import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import type { DbInvoice } from '@/lib/db/schema';
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
// STATUS TRANSITIONS
// ============================================================================

type InvoiceStatus = DbInvoice['status'];

/** Valid status transitions map */
const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'void'],
  sent: ['viewed', 'approved', 'void'],
  viewed: ['approved', 'void'],
  approved: ['in_progress', 'void'],
  in_progress: ['completed', 'void'],
  completed: ['paid', 'void'],
  paid: [],
  void: [],
};

// ============================================================================
// PATCH /api/invoices/[id]/status — Change invoice status
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;

  let body: { status: InvoiceStatus; changedBy?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json(
      { error: 'status is required' },
      { status: 400 }
    );
  }

  const existing = await getInvoiceById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Validate transition
  const allowed = VALID_TRANSITIONS[existing.status];
  if (!allowed?.includes(body.status)) {
    return NextResponse.json(
      {
        error: `Invalid status transition: ${existing.status} -> ${body.status}`,
        allowed,
      },
      { status: 422 }
    );
  }

  // Build update
  const updateSet: Record<string, unknown> = {
    status: body.status,
    version: existing.version + 1,
    updatedAt: new Date(),
  };

  // Set timestamp fields for specific transitions
  if (body.status === 'viewed' && !existing.viewedAt) {
    updateSet.viewedAt = new Date();
  }
  if (body.status === 'approved' && !existing.approvedAt) {
    updateSet.approvedAt = new Date();
  }

  await db
    .update(invoices)
    .set(updateSet)
    .where(eq(invoices.id, id));

  // Create version record
  await createInvoiceVersion(
    id,
    'status_change',
    `Status changed from ${existing.status} to ${body.status}`,
    body.changedBy || 'api'
  );

  const updated = await getInvoiceById(id);
  return NextResponse.json(updated);
}
