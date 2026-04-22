import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices, invoicePaymentMilestones } from '@/lib/db/schema';
import type { DbInvoice } from '@/lib/db/schema';
import { createInvoiceVersion } from '@/lib/db/invoice-queries';

// ============================================================================
// AUTH
// ============================================================================

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  return authHeader.slice(7) === process.env.INVOICE_API_SECRET;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ============================================================================
// PATCH /api/invoices/[id]/payments/[milestoneId] — Record a payment
// ============================================================================

interface RecordPaymentBody {
  isPaid?: boolean;
  paymentMethod?: DbInvoice['status'] extends string
    ? 'e_transfer' | 'cheque' | 'cash' | 'wire' | 'credit_card'
    : never;
  paymentReference?: string;
  changedBy?: string;
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id, milestoneId } = await params;

  let body: RecordPaymentBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Verify invoice exists
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Verify milestone exists and belongs to this invoice
  const [milestone] = await db
    .select()
    .from(invoicePaymentMilestones)
    .where(
      and(
        eq(invoicePaymentMilestones.id, milestoneId),
        eq(invoicePaymentMilestones.invoiceId, id)
      )
    )
    .limit(1);

  if (!milestone) {
    return NextResponse.json(
      { error: 'Payment milestone not found' },
      { status: 404 }
    );
  }

  // Update milestone
  const isPaid = body.isPaid ?? true;
  const [updated] = await db
    .update(invoicePaymentMilestones)
    .set({
      isPaid,
      paidAt: isPaid ? new Date() : null,
      paymentMethod: body.paymentMethod || null,
      paymentReference: body.paymentReference?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(invoicePaymentMilestones.id, milestoneId))
    .returning();

  // Check if all milestones are paid — auto-set invoice to 'paid'
  const allMilestones = await db
    .select()
    .from(invoicePaymentMilestones)
    .where(eq(invoicePaymentMilestones.invoiceId, id));

  const allPaid =
    allMilestones.length > 0 &&
    allMilestones.every((m: { isPaid: boolean }) => m.isPaid);

  if (allPaid && invoice.status !== 'paid' && invoice.status !== 'void') {
    await db
      .update(invoices)
      .set({
        status: 'paid',
        version: invoice.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    await createInvoiceVersion(
      id,
      'auto_paid',
      'All milestones paid — invoice auto-marked as paid',
      body.changedBy || 'api'
    );
  }

  // Create version record for the payment
  await createInvoiceVersion(
    id,
    'payment_recorded',
    `Payment ${isPaid ? 'recorded' : 'reversed'} for milestone: ${milestone.label}`,
    body.changedBy || 'api'
  );

  return NextResponse.json(updated);
}
