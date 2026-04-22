import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import {
  getInvoiceById,
  createInvoiceVersion,
} from '@/lib/db/invoice-queries';

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
// GET /api/invoices/[id] — Fetch invoice with all details
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

// ============================================================================
// PATCH /api/invoices/[id] — Update invoice header fields
// ============================================================================

const UPDATABLE_FIELDS = [
  'clientName',
  'clientEmail',
  'clientPhone',
  'clientAddress',
  'language',
  'taxRate',
  'gstNumber',
  'paymentScheduleKey',
  'notes',
  'dueDate',
  'siteId',
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Fetch existing invoice
  const existing = await getInvoiceById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Build update set from allowed fields
  const updateSet: Record<string, unknown> = {};
  const changes: string[] = [];

  for (const field of UPDATABLE_FIELDS) {
    if (field in body) {
      updateSet[field] = body[field];
      changes.push(field);
    }
  }

  if (changes.length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields provided' },
      { status: 400 }
    );
  }

  // Increment version
  const newVersion = existing.version + 1;
  updateSet.version = newVersion;
  updateSet.updatedAt = new Date();

  await db
    .update(invoices)
    .set(updateSet)
    .where(eq(invoices.id, id));

  // Create version record
  await createInvoiceVersion(
    id,
    'updated',
    `Updated fields: ${changes.join(', ')}`,
    (body.changedBy as string) || 'api'
  );

  const updated = await getInvoiceById(id);
  return NextResponse.json(updated);
}
