import { eq, and, like, desc, asc, count } from 'drizzle-orm';
import { db } from './index';
import {
  invoices,
  invoiceLineItems,
  invoicePaymentMilestones,
  invoiceVersions,
} from './schema';
import type {
  DbInvoice,
  DbInvoiceLineItem,
  DbInvoicePaymentMilestone,
  DbInvoiceVersion,
} from './schema';

// ============================================================================
// TYPES
// ============================================================================

export interface InvoiceWithDetails extends DbInvoice {
  lineItems: DbInvoiceLineItem[];
  paymentMilestones: DbInvoicePaymentMilestone[];
  versions: DbInvoiceVersion[];
}

export interface ListInvoicesFilters {
  status?: DbInvoice['status'];
  type?: DbInvoice['type'];
  clientName?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedInvoices {
  data: DbInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch a single invoice by ID with all related data.
 */
export async function getInvoiceById(
  id: string
): Promise<InvoiceWithDetails | null> {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) return null;

  const [lineItems, milestones, versions] = await Promise.all([
    db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(asc(invoiceLineItems.displayOrder)),
    db
      .select()
      .from(invoicePaymentMilestones)
      .where(eq(invoicePaymentMilestones.invoiceId, id))
      .orderBy(asc(invoicePaymentMilestones.displayOrder)),
    db
      .select()
      .from(invoiceVersions)
      .where(eq(invoiceVersions.invoiceId, id))
      .orderBy(desc(invoiceVersions.createdAt)),
  ]);

  return {
    ...invoice,
    lineItems,
    paymentMilestones: milestones,
    versions,
  };
}

/**
 * Fetch a single invoice by its public shareToken with all related data.
 */
export async function getInvoiceByShareToken(
  shareToken: string
): Promise<InvoiceWithDetails | null> {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.shareToken, shareToken))
    .limit(1);

  if (!invoice) return null;

  const [lineItems, milestones, versions] = await Promise.all([
    db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoice.id))
      .orderBy(asc(invoiceLineItems.displayOrder)),
    db
      .select()
      .from(invoicePaymentMilestones)
      .where(eq(invoicePaymentMilestones.invoiceId, invoice.id))
      .orderBy(asc(invoicePaymentMilestones.displayOrder)),
    db
      .select()
      .from(invoiceVersions)
      .where(eq(invoiceVersions.invoiceId, invoice.id))
      .orderBy(desc(invoiceVersions.createdAt)),
  ]);

  return {
    ...invoice,
    lineItems,
    paymentMilestones: milestones,
    versions,
  };
}

/**
 * Mark an invoice as viewed (first client visit).
 * Only updates if status is 'sent' and viewedAt is null.
 */
export async function markInvoiceViewed(invoiceId: string): Promise<void> {
  await db
    .update(invoices)
    .set({
      status: 'viewed',
      viewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.status, 'sent')
      )
    );
}

/**
 * Approve an invoice (client action). Returns the updated invoice or null if
 * the invoice was not in an approvable state.
 */
export async function approveInvoice(
  invoiceId: string
): Promise<DbInvoice | null> {
  // Only allow approval from 'sent' or 'viewed' status
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) return null;
  if (invoice.status !== 'sent' && invoice.status !== 'viewed') return null;

  const [updated] = await db
    .update(invoices)
    .set({
      status: 'approved',
      approvedAt: new Date(),
      version: invoice.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  return updated ?? null;
}

/**
 * List invoices with optional filters and pagination.
 */
export async function listInvoices(
  filters: ListInvoicesFilters = {}
): Promise<PaginatedInvoices> {
  const { status, type, clientName, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (status) conditions.push(eq(invoices.status, status));
  if (type) conditions.push(eq(invoices.type, type));
  if (clientName) conditions.push(like(invoices.clientName, `%${clientName}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(invoices)
      .where(where),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Recalculate invoice totals from line items and update milestone amounts.
 *
 * subtotal = sum of all line item amountCents
 * tax = subtotal * taxRate / 100
 * total = subtotal + tax
 * milestone amounts = total * milestone.percentage / 100
 */
export async function recalculateInvoiceTotals(
  invoiceId: string
): Promise<DbInvoice> {
  // Fetch current invoice + line items + milestones
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) throw new Error(`Invoice not found: ${invoiceId}`);

  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId));

  const subtotalCents = lineItems.reduce(
    (sum: number, item: DbInvoiceLineItem) => sum + item.amountCents,
    0
  );
  const taxCents = Math.round((subtotalCents * invoice.taxRate) / 100);
  const totalCents = subtotalCents + taxCents;

  // Update invoice totals
  const [updatedInvoice] = await db
    .update(invoices)
    .set({
      subtotalCents,
      taxCents,
      totalCents,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  // Update milestone amounts based on percentages
  const milestones = await db
    .select()
    .from(invoicePaymentMilestones)
    .where(eq(invoicePaymentMilestones.invoiceId, invoiceId));

  for (const milestone of milestones) {
    await db
      .update(invoicePaymentMilestones)
      .set({
        amountCents: Math.round((totalCents * milestone.percentage) / 100),
        updatedAt: new Date(),
      })
      .where(eq(invoicePaymentMilestones.id, milestone.id));
  }

  return updatedInvoice;
}

/**
 * Create a version snapshot for an invoice (audit log).
 */
export async function createInvoiceVersion(
  invoiceId: string,
  changeType: string,
  changeSummary: string,
  changedBy: string
): Promise<DbInvoiceVersion> {
  // Fetch the current invoice state for the snapshot
  const invoiceData = await getInvoiceById(invoiceId);
  if (!invoiceData) throw new Error(`Invoice not found: ${invoiceId}`);

  // Exclude versions from the snapshot (only header + lineItems + milestones)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { versions: _versions, ...snapshot } = invoiceData;

  const [versionRecord] = await db
    .insert(invoiceVersions)
    .values({
      invoiceId,
      version: invoiceData.version,
      changeType,
      changeSummary,
      changedBy,
      snapshot: snapshot as Record<string, unknown>,
    })
    .returning();

  return versionRecord;
}
