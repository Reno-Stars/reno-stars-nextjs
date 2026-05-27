'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { invoices, invoiceLineItems, invoicePaymentMilestones } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString } from '@/lib/admin/form-utils';
import { createInvoiceVersion } from '@/lib/db/invoice-queries';
import {
  invoiceClient,
  InvoiceServiceError,
  type InvoiceStatus,
  type PaymentMethod,
} from '@/lib/clients/invoice';
import crypto from 'crypto';

// ============================================================================
// FEATURE FLAG
// ============================================================================
//
// INVOICE_SOURCE controls which backend handles invoice operations:
//   - 'legacy'   → direct Drizzle queries against Neon (default, today)
//   - 'service'  → HTTPS calls to the standalone reno-stars-invoice-service
//
// The two paths MUST return identical shapes — callers downstream (admin
// components, share view, PDF route) must not be able to tell which ran.
// Phase A extraction (see docs/superpowers/plans/2026-05-27-phase-a-...).

function isServiceMode(): boolean {
  return process.env.INVOICE_SOURCE === 'service';
}

function describeServiceError(err: unknown, fallback: string): string {
  if (err instanceof InvoiceServiceError) {
    if (err.status === 404) return 'Invoice not found.';
    // Surface validation-style messages from the service.
    if (err.status >= 400 && err.status < 500) {
      // Try to extract the JSON {error} field from the body
      try {
        const parsed = JSON.parse(err.body) as { error?: string };
        if (parsed.error) return parsed.error;
      } catch {
        // not JSON — fall through
      }
    }
    console.error(`Invoice service error (${err.status}):`, err.message);
  } else {
    console.error('Invoice service error:', err);
  }
  return fallback;
}

const VALID_STATUSES = [
  'draft', 'sent', 'viewed', 'approved', 'in_progress', 'completed', 'paid', 'void',
] as const;

const VALID_TYPES = ['estimate', 'invoice'] as const;

const VALID_PAYMENT_METHODS = [
  'e_transfer', 'cheque', 'cash', 'wire', 'credit_card',
] as const;

/** Generate a sequential invoice number like EST-0001 or INV-0001 */
async function generateInvoiceNumber(type: 'estimate' | 'invoice'): Promise<string> {
  const prefix = type === 'estimate' ? 'EST' : 'INV';
  const existing = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(eq(invoices.type, type))
    .orderBy(invoices.invoiceNumber);

  let maxNum = 0;
  for (const row of existing) {
    const match = row.invoiceNumber.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return `${prefix}-${String(maxNum + 1).padStart(4, '0')}`;
}

/** Default payment milestones for each schedule key */
function getDefaultMilestones(key: string): Array<{ label: string; labelZh: string; percentage: number; displayOrder: number }> {
  switch (key) {
    case '70/30':
      return [
        { label: 'Deposit (70%)', labelZh: '定金 (70%)', percentage: 70, displayOrder: 0 },
        { label: 'Completion (30%)', labelZh: '尾款 (30%)', percentage: 30, displayOrder: 1 },
      ];
    case 'milestone-5':
      return [
        { label: 'Deposit', labelZh: '定金', percentage: 30, displayOrder: 0 },
        { label: 'Demolition complete', labelZh: '拆除完成', percentage: 20, displayOrder: 1 },
        { label: 'Rough-in complete', labelZh: '粗装完成', percentage: 20, displayOrder: 2 },
        { label: 'Finishing started', labelZh: '精装开始', percentage: 15, displayOrder: 3 },
        { label: 'Project completion', labelZh: '项目完工', percentage: 15, displayOrder: 4 },
      ];
    case 'milestone-large':
      return [
        { label: 'Deposit', labelZh: '定金', percentage: 25, displayOrder: 0 },
        { label: 'Demolition complete', labelZh: '拆除完成', percentage: 15, displayOrder: 1 },
        { label: 'Framing complete', labelZh: '框架完成', percentage: 15, displayOrder: 2 },
        { label: 'Rough-in complete', labelZh: '粗装完成', percentage: 15, displayOrder: 3 },
        { label: 'Finishing started', labelZh: '精装开始', percentage: 15, displayOrder: 4 },
        { label: 'Project completion', labelZh: '项目完工', percentage: 15, displayOrder: 5 },
      ];
    case '100%':
    default:
      // Single-line default. Forces the salesperson to either accept a single
      // full-payment line or explicitly design milestones — no canned split
      // assumed at creation time.
      return [
        { label: 'Full payment', labelZh: '全款', percentage: 100, displayOrder: 0 },
      ];
  }
}

export async function createInvoiceAction(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  await requireAuth();

  const type = getString(formData, 'type') as 'estimate' | 'invoice';
  if (!VALID_TYPES.includes(type)) {
    return { error: 'Invalid type.' };
  }

  const clientName = getString(formData, 'clientName').trim();
  if (!clientName) {
    return { error: 'Client name is required.' };
  }

  const language = getString(formData, 'language') || 'english';
  const taxRateStr = getString(formData, 'taxRate');
  const taxRate = taxRateStr ? parseInt(taxRateStr, 10) : 5;
  const paymentScheduleKey = getString(formData, 'paymentScheduleKey') || '70/30';
  const invoiceDateStr = getString(formData, 'invoiceDate');
  const dueDateStr = getString(formData, 'dueDate');

  if (isServiceMode()) {
    try {
      const milestonesInput = getDefaultMilestones(paymentScheduleKey).map((m) => ({
        label: m.label,
        labelZh: m.labelZh,
        percentage: m.percentage,
        displayOrder: m.displayOrder,
      }));

      const created = await invoiceClient.create({
        type,
        clientName,
        clientEmail: getString(formData, 'clientEmail').trim() || null,
        clientPhone: getString(formData, 'clientPhone').trim() || null,
        clientAddress: getString(formData, 'clientAddress').trim() || null,
        language,
        taxRate,
        paymentScheduleKey,
        paymentMilestones: milestonesInput,
      });

      // The service doesn't accept invoiceDate/dueDate on create today;
      // patch them in if provided so behavior matches legacy.
      if (invoiceDateStr || dueDateStr) {
        // Note: service PATCH allowlist accepts dueDate. invoiceDate is
        // set to "now" by the service. The Next.js admin form historically
        // accepts both; we honor dueDate here and leave invoiceDate as
        // server-now to keep the contract simple. If a custom invoiceDate
        // proves necessary, add it to the service's PATCH allowlist.
        if (dueDateStr) {
          try {
            await invoiceClient.update(created.id, {
              dueDate: new Date(dueDateStr).toISOString(),
            });
          } catch (patchErr) {
            console.error('createInvoiceAction: failed to patch dueDate:', patchErr);
          }
        }
      }

      revalidatePath('/admin/invoices');
      return { id: created.id };
    } catch (err) {
      return { error: describeServiceError(err, 'Failed to create invoice.') };
    }
  }

  try {
    const invoiceNumber = await generateInvoiceNumber(type);
    const shareToken = crypto.randomBytes(32).toString('hex');

    const [created] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        type,
        status: 'draft',
        clientName,
        clientEmail: getString(formData, 'clientEmail').trim() || null,
        clientPhone: getString(formData, 'clientPhone').trim() || null,
        clientAddress: getString(formData, 'clientAddress').trim() || null,
        language,
        taxRate,
        paymentScheduleKey,
        shareToken,
        invoiceDate: invoiceDateStr ? new Date(invoiceDateStr) : new Date(),
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
      })
      .returning();

    // Create default milestones
    const milestones = getDefaultMilestones(paymentScheduleKey);
    for (const m of milestones) {
      await db.insert(invoicePaymentMilestones).values({
        invoiceId: created.id,
        label: m.label,
        labelZh: m.labelZh,
        percentage: m.percentage,
        amountCents: 0,
        displayOrder: m.displayOrder,
      });
    }

    // Create initial version
    await createInvoiceVersion(created.id, 'created', 'Invoice created', 'admin');

    revalidatePath('/admin/invoices');
    return { id: created.id };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return { error: 'Failed to create invoice.' };
  }
}

export async function updateInvoiceAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid invoice ID.' };

  const clientName = getString(formData, 'clientName').trim();
  if (!clientName) return { error: 'Client name is required.' };

  const language = getString(formData, 'language') || 'english';
  const taxRateStr = getString(formData, 'taxRate');
  const taxRate = taxRateStr ? parseInt(taxRateStr, 10) : 5;
  const dueDateStr = getString(formData, 'dueDate');
  const notes = getString(formData, 'notes');

  if (isServiceMode()) {
    try {
      await invoiceClient.update(id, {
        clientName,
        clientEmail: getString(formData, 'clientEmail').trim() || null,
        clientPhone: getString(formData, 'clientPhone').trim() || null,
        clientAddress: getString(formData, 'clientAddress').trim() || null,
        language,
        taxRate,
        notes: notes || null,
        dueDate: dueDateStr ? new Date(dueDateStr).toISOString() : null,
        changedBy: 'admin',
      });
      revalidatePath('/admin/invoices');
      revalidatePath(`/admin/invoices/${id}`);
      return {};
    } catch (err) {
      return { error: describeServiceError(err, 'Failed to update invoice.') };
    }
  }

  try {
    const updated = await db
      .update(invoices)
      .set({
        clientName,
        clientEmail: getString(formData, 'clientEmail').trim() || null,
        clientPhone: getString(formData, 'clientPhone').trim() || null,
        clientAddress: getString(formData, 'clientAddress').trim() || null,
        language,
        taxRate,
        notes: notes || null,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id });

    if (updated.length === 0) return { error: 'Invoice not found.' };

    await createInvoiceVersion(id, 'header_updated', 'Invoice header updated', 'admin');

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${id}`);
    return {};
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return { error: 'Failed to update invoice.' };
  }
}

export async function deleteInvoiceAction(
  id: string
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid invoice ID.' };

  // NOTE: This is a SOFT delete (status='void'), not a hard DELETE. To
  // preserve behavior under INVOICE_SOURCE=service, route through the
  // service's status endpoint rather than its DELETE endpoint (which is a
  // hard delete that cascades to line items + milestones + versions).
  if (isServiceMode()) {
    try {
      await invoiceClient.setStatus(id, 'void', 'admin');
      revalidatePath('/admin/invoices');
      revalidatePath(`/admin/invoices/${id}`);
      return {};
    } catch (err) {
      return { error: describeServiceError(err, 'Failed to void invoice.') };
    }
  }

  try {
    const updated = await db
      .update(invoices)
      .set({ status: 'void', updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id });

    if (updated.length === 0) return { error: 'Invoice not found.' };

    await createInvoiceVersion(id, 'voided', 'Invoice voided', 'admin');

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${id}`);
    return {};
  } catch (error) {
    console.error('Failed to void invoice:', error);
    return { error: 'Failed to void invoice.' };
  }
}

export async function updateStatusAction(
  id: string,
  status: string
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid invoice ID.' };
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' };
  }

  if (isServiceMode()) {
    try {
      await invoiceClient.setStatus(id, status as InvoiceStatus, 'admin');
      revalidatePath('/admin/invoices');
      revalidatePath(`/admin/invoices/${id}`);
      return {};
    } catch (err) {
      return { error: describeServiceError(err, 'Failed to update status.') };
    }
  }

  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps for certain statuses
    if (status === 'approved') updateData.approvedAt = new Date();
    if (status === 'viewed') updateData.viewedAt = new Date();

    const updated = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id });

    if (updated.length === 0) return { error: 'Invoice not found.' };

    await createInvoiceVersion(id, 'status_changed', `Status changed to ${status}`, 'admin');

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${id}`);
    return {};
  } catch (error) {
    console.error('Failed to update status:', error);
    return { error: 'Failed to update status.' };
  }
}

export async function recordPaymentAction(
  invoiceId: string,
  milestoneId: string,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(invoiceId)) return { error: 'Invalid invoice ID.' };
  if (!isValidUUID(milestoneId)) return { error: 'Invalid milestone ID.' };

  const method = getString(formData, 'paymentMethod');
  if (method && !(VALID_PAYMENT_METHODS as readonly string[]).includes(method)) {
    return { error: 'Invalid payment method.' };
  }

  const paidAtStr = getString(formData, 'paidAt');
  const reference = getString(formData, 'paymentReference').trim();

  if (isServiceMode()) {
    try {
      await invoiceClient.recordPayment(invoiceId, milestoneId, {
        isPaid: true,
        paidAt: paidAtStr ? new Date(paidAtStr).toISOString() : new Date().toISOString(),
        paymentMethod: (method as PaymentMethod) || null,
        paymentReference: reference || null,
        changedBy: 'admin',
      });
      revalidatePath('/admin/invoices');
      revalidatePath(`/admin/invoices/${invoiceId}`);
      return {};
    } catch (err) {
      return { error: describeServiceError(err, 'Failed to record payment.') };
    }
  }

  try {
    const [milestone] = await db
      .update(invoicePaymentMilestones)
      .set({
        isPaid: true,
        paidAt: paidAtStr ? new Date(paidAtStr) : new Date(),
        paymentMethod: method as typeof VALID_PAYMENT_METHODS[number] || null,
        paymentReference: reference || null,
        updatedAt: new Date(),
      })
      .where(eq(invoicePaymentMilestones.id, milestoneId))
      .returning();

    if (!milestone) return { error: 'Milestone not found.' };

    await createInvoiceVersion(
      milestone.invoiceId,
      'payment_recorded',
      `Payment recorded for "${milestone.label}"`,
      'admin'
    );

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${milestone.invoiceId}`);
    return {};
  } catch (error) {
    console.error('Failed to record payment:', error);
    return { error: 'Failed to record payment.' };
  }
}

export async function addLineItemAction(
  invoiceId: string,
  label: string,
  steps: Array<{ text: string; remarks: string[] }>
): Promise<{ error?: string }> {
  try {
    await requireAuth();
    if (!isValidUUID(invoiceId)) return { error: 'Invalid invoice ID.' };
    if (!label.trim()) return { error: 'Label is required.' };

    // Build description from steps
    const descriptionLines: string[] = [];
    steps.forEach((step, i) => {
      descriptionLines.push(`${i + 1}. ${step.text}`);
      for (const remark of step.remarks) {
        descriptionLines.push(`   - ${remark}`);
      }
    });

    if (isServiceMode()) {
      try {
        // The service defaults displayOrder to 0 when omitted, which would
        // collide with existing items. Preserve legacy "append to end" by
        // computing max+1 from the current line items.
        const detail = await invoiceClient.get(invoiceId);
        const maxOrder = detail.lineItems.length > 0
          ? Math.max(...detail.lineItems.map((li) => li.displayOrder))
          : -1;

        await invoiceClient.addLineItem(invoiceId, {
          label: label.trim(),
          description: descriptionLines.join('\n'),
          steps,
          displayOrder: maxOrder + 1,
        });
        revalidatePath('/admin/invoices');
        revalidatePath(`/admin/invoices/${invoiceId}`);
        return {};
      } catch (err) {
        return { error: describeServiceError(err, 'Failed to add line item.') };
      }
    }

    // Get max display order
    const existing = await db
      .select({ displayOrder: invoiceLineItems.displayOrder })
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId))
      .orderBy(invoiceLineItems.displayOrder);
    const maxOrder = existing.length > 0 ? existing[existing.length - 1].displayOrder : -1;

    await db.insert(invoiceLineItems).values({
      invoiceId,
      label: label.trim(),
      description: descriptionLines.join('\n'),
      steps,
      displayOrder: maxOrder + 1,
    });

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${invoiceId}`);
    return {};
  } catch (error) {
    console.error('Failed to add line item:', error);
    return { error: 'Failed to add line item.' };
  }
}

export async function deleteLineItemAction(
  invoiceId: string,
  lineItemId: string
): Promise<{ error?: string }> {
  try {
    await requireAuth();
    if (!isValidUUID(invoiceId) || !isValidUUID(lineItemId)) return { error: 'Invalid ID.' };

    if (isServiceMode()) {
      try {
        await invoiceClient.removeLineItem(invoiceId, lineItemId);
        revalidatePath('/admin/invoices');
        revalidatePath(`/admin/invoices/${invoiceId}`);
        return {};
      } catch (err) {
        return { error: describeServiceError(err, 'Failed to delete line item.') };
      }
    }

    await db
      .delete(invoiceLineItems)
      .where(eq(invoiceLineItems.id, lineItemId));

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${invoiceId}`);
    return {};
  } catch (error) {
    console.error('Failed to delete line item:', error);
    return { error: 'Failed to delete line item.' };
  }
}

export async function updateLineItemStepsAction(
  invoiceId: string,
  lineItemId: string,
  steps: Array<{ text: string; remarks: string[] }>,
  footerLines?: string[]
): Promise<{ error?: string }> {
  try {
    await requireAuth();
    if (!isValidUUID(invoiceId) || !isValidUUID(lineItemId)) return { error: 'Invalid ID.' };

    // Also regenerate the description text from steps for PDF/export backward compat
    const descriptionLines: string[] = [];
    steps.forEach((step, i) => {
      descriptionLines.push(`${i + 1}. ${step.text}`);
      for (const remark of step.remarks) {
        descriptionLines.push(`   - ${remark}`);
      }
    });

    const cleanedFooter = footerLines?.map((l) => l.trim()).filter(Boolean);

    if (isServiceMode()) {
      try {
        const body: {
          steps: typeof steps;
          description: string;
          footerLines?: string[];
        } = {
          steps,
          description: descriptionLines.join('\n'),
        };
        if (cleanedFooter !== undefined) {
          body.footerLines = cleanedFooter;
        }
        await invoiceClient.updateLineItem(invoiceId, lineItemId, body);
        revalidatePath('/admin/invoices');
        revalidatePath(`/admin/invoices/${invoiceId}`);
        return {};
      } catch (err) {
        return { error: describeServiceError(err, 'Failed to update steps.') };
      }
    }

    // Build the update set. Only touch footerLines when the caller passed an
    // array (undefined = leave alone; empty array = explicit clear).
    const updateSet: Partial<typeof invoiceLineItems.$inferInsert> = {
      steps,
      description: descriptionLines.join('\n'),
    };
    if (cleanedFooter !== undefined) {
      updateSet.footerLines = cleanedFooter;
    }

    await db
      .update(invoiceLineItems)
      .set(updateSet)
      .where(eq(invoiceLineItems.id, lineItemId));

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${invoiceId}`);
    return {};
  } catch (error) {
    console.error('Failed to update line item steps:', error);
    return { error: 'Failed to update steps.' };
  }
}
