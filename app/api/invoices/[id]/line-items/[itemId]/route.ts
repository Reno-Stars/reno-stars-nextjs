import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceLineItems } from '@/lib/db/schema';
import { recalculateInvoiceTotals } from '@/lib/db/invoice-queries';

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
// PATCH /api/invoices/[id]/line-items/[itemId] — Update a line item
// ============================================================================

const UPDATABLE_FIELDS = [
  'sectionType',
  'label',
  'description',
  'steps',
  'rateCents',
  'quantity',
  'amountCents',
  'footerLines',
  'buildParams',
  'displayOrder',
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id, itemId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Verify line item exists and belongs to this invoice
  const [existing] = await db
    .select()
    .from(invoiceLineItems)
    .where(
      and(
        eq(invoiceLineItems.id, itemId),
        eq(invoiceLineItems.invoiceId, id)
      )
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: 'Line item not found' },
      { status: 404 }
    );
  }

  // Build update set
  const updateSet: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) {
      updateSet[field] = body[field];
    }
  }

  if (Object.keys(updateSet).length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields provided' },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(invoiceLineItems)
    .set(updateSet)
    .where(eq(invoiceLineItems.id, itemId))
    .returning();

  // Recalculate totals
  await recalculateInvoiceTotals(id);

  return NextResponse.json(updated);
}

// ============================================================================
// DELETE /api/invoices/[id]/line-items/[itemId] — Remove a line item
// ============================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id, itemId } = await params;

  // Verify line item exists and belongs to this invoice
  const [existing] = await db
    .select()
    .from(invoiceLineItems)
    .where(
      and(
        eq(invoiceLineItems.id, itemId),
        eq(invoiceLineItems.invoiceId, id)
      )
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: 'Line item not found' },
      { status: 404 }
    );
  }

  await db
    .delete(invoiceLineItems)
    .where(eq(invoiceLineItems.id, itemId));

  // Recalculate totals
  await recalculateInvoiceTotals(id);

  return NextResponse.json({ deleted: true });
}
