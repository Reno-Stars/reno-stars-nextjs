import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  invoices,
  invoiceLineItems,
  invoicePaymentMilestones,
} from '@/lib/db/schema';
import type { DbInvoice } from '@/lib/db/schema';
import { generateInvoiceNumber } from '@/lib/invoice/number-generator';
import { generateShareToken } from '@/lib/invoice/share-token';
import {
  listInvoices,
  recalculateInvoiceTotals,
  createInvoiceVersion,
} from '@/lib/db/invoice-queries';

// ============================================================================
// AUTH
// ============================================================================

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === process.env.INVOICE_API_SECRET;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ============================================================================
// POST /api/invoices — Create a new invoice
// ============================================================================

interface CreateLineItemInput {
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

interface CreateMilestoneInput {
  label: string;
  labelZh?: string;
  percentage: number;
  displayOrder?: number;
}

interface CreateInvoiceBody {
  type?: 'estimate' | 'invoice';
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  language?: string;
  taxRate?: number;
  gstNumber?: string;
  paymentScheduleKey?: string;
  notes?: string;
  siteId?: string;
  lineItems?: CreateLineItemInput[];
  paymentMilestones?: CreateMilestoneInput[];
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  let body: CreateInvoiceBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.clientName?.trim()) {
    return NextResponse.json(
      { error: 'clientName is required' },
      { status: 400 }
    );
  }

  const type = body.type ?? 'estimate';
  const invoiceNumber = await generateInvoiceNumber(type);
  const shareToken = generateShareToken();

  // Insert invoice
  const [invoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      type,
      clientName: body.clientName.trim(),
      clientEmail: body.clientEmail?.trim() || null,
      clientPhone: body.clientPhone?.trim() || null,
      clientAddress: body.clientAddress?.trim() || null,
      language: body.language ?? 'english',
      taxRate: body.taxRate ?? 5,
      gstNumber: body.gstNumber ?? '748434285RT0001',
      paymentScheduleKey: body.paymentScheduleKey ?? '70/30',
      notes: body.notes?.trim() || null,
      shareToken,
      siteId: body.siteId || null,
    })
    .returning();

  // Insert line items (insert-before-delete pattern: fresh insert, nothing to delete)
  if (body.lineItems?.length) {
    await db.insert(invoiceLineItems).values(
      body.lineItems.map((item, idx) => ({
        invoiceId: invoice.id,
        sectionType: item.sectionType || null,
        label: item.label,
        description: item.description,
        rateCents: item.rateCents ?? 0,
        quantity: item.quantity ?? 1,
        amountCents: item.amountCents ?? 0,
        footerLines: item.footerLines ?? [],
        buildParams: item.buildParams ?? null,
        displayOrder: item.displayOrder ?? idx,
      }))
    );
  }

  // Insert payment milestones
  if (body.paymentMilestones?.length) {
    await db.insert(invoicePaymentMilestones).values(
      body.paymentMilestones.map((m, idx) => ({
        invoiceId: invoice.id,
        label: m.label,
        labelZh: m.labelZh || null,
        percentage: m.percentage,
        displayOrder: m.displayOrder ?? idx,
      }))
    );
  }

  // Recalculate totals
  const updatedInvoice = await recalculateInvoiceTotals(invoice.id);

  // Create initial version
  await createInvoiceVersion(
    invoice.id,
    'created',
    `Invoice ${invoiceNumber} created`,
    'api'
  );

  return NextResponse.json(
    { id: updatedInvoice.id, invoiceNumber, shareToken },
    { status: 201 }
  );
}

// ============================================================================
// GET /api/invoices — List invoices (paginated + filtered)
// ============================================================================

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status') as DbInvoice['status'] | null;
  const type = searchParams.get('type') as 'estimate' | 'invoice' | null;
  const clientName = searchParams.get('clientName') || undefined;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  const result = await listInvoices({
    status: status || undefined,
    type: type || undefined,
    clientName,
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 20 : limit,
  });

  return NextResponse.json(result);
}
