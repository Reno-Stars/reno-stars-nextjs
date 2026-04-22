import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices, invoiceLineItems } from '@/lib/db/schema';
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
// POST /api/invoices/[id]/line-items — Add a line item
// ============================================================================

interface CreateLineItemBody {
  sectionType?: string;
  label: string;
  description: string;
  rateCents?: number;
  quantity?: number;
  amountCents?: number;
  footerLines?: string[];
  buildParams?: Record<string, unknown>;
  displayOrder?: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;

  // Verify invoice exists
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  let body: CreateLineItemBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.label?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: 'label and description are required' },
      { status: 400 }
    );
  }

  const [lineItem] = await db
    .insert(invoiceLineItems)
    .values({
      invoiceId: id,
      sectionType: body.sectionType || null,
      label: body.label.trim(),
      description: body.description.trim(),
      rateCents: body.rateCents ?? 0,
      quantity: body.quantity ?? 1,
      amountCents: body.amountCents ?? 0,
      footerLines: body.footerLines ?? [],
      buildParams: body.buildParams ?? null,
      displayOrder: body.displayOrder ?? 0,
    })
    .returning();

  // Recalculate totals
  await recalculateInvoiceTotals(id);

  return NextResponse.json(lineItem, { status: 201 });
}
