import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceTermsTemplates } from '@/lib/db/schema';
import { getInvoiceById } from '@/lib/db/invoice-queries';
import { generateInvoicePdf } from '@/lib/pdf/generate';
import { verifyToken } from '@/lib/admin/auth';

// ============================================================================
// AUTH — accepts either Bearer token (MCP) or admin session cookie (browser)
// ============================================================================

function isAuthorized(req: NextRequest): boolean {
  // 1. Bearer token (MCP / API clients)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === process.env.INVOICE_API_SECRET) {
    return true;
  }
  // 2. Admin session cookie (browser / admin panel)
  const sessionCookie = req.cookies.get('admin_session')?.value;
  if (sessionCookie && verifyToken(sessionCookie)) {
    return true;
  }
  return false;
}

// ============================================================================
// GET /api/invoices/[id]/pdf — Generate and return PDF
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // 1. Fetch invoice with all details
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // 2. Fetch terms template (default for the invoice's language)
  const [termsTemplate] = await db
    .select()
    .from(invoiceTermsTemplates)
    .where(
      and(
        eq(invoiceTermsTemplates.language, invoice.language),
        eq(invoiceTermsTemplates.isDefault, true)
      )
    )
    .limit(1);

  const terms = termsTemplate?.content ?? '';

  // 3. Build PDF props from DB records
  const pdfProps = {
    invoice: {
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      clientName: invoice.clientName,
      clientAddress: invoice.clientAddress ?? undefined,
      clientPhone: invoice.clientPhone ?? undefined,
      clientEmail: invoice.clientEmail ?? undefined,
      language: invoice.language,
      taxRate: invoice.taxRate,
      gstNumber: invoice.gstNumber,
      subtotalCents: invoice.subtotalCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      notes: invoice.notes ?? undefined,
    },
    lineItems: invoice.lineItems.map((item) => ({
      label: item.label,
      description: item.description,
      rateCents: item.rateCents,
      quantity: item.quantity,
      amountCents: item.amountCents,
      footerLines: item.footerLines ?? undefined,
    })),
    milestones: invoice.paymentMilestones.map((ms) => ({
      label: ms.label,
      percentage: ms.percentage,
      amountCents: ms.amountCents,
      isPaid: ms.isPaid,
      paidAt: ms.paidAt?.toISOString(),
    })),
    terms,
  };

  // 4. Generate PDF
  const pdfBuffer = await generateInvoicePdf(pdfProps);

  // 5. Determine filename
  const filename = `${invoice.invoiceNumber}.pdf`;

  // Check if download was requested
  const download = req.nextUrl.searchParams.get('download') === 'true';
  const disposition = download
    ? `attachment; filename="${filename}"`
    : `inline; filename="${filename}"`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': disposition,
      'Content-Length': String(pdfBuffer.length),
      'Cache-Control': 'private, no-cache',
    },
  });
}
