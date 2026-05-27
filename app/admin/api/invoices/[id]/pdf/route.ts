import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceTermsTemplates } from '@/lib/db/schema';
import { getInvoiceById } from '@/lib/db/invoice-queries';
import { generateInvoicePdf } from '@/lib/pdf/generate';
import { validateSession } from '@/lib/admin/auth';
import { invoiceClient, isNotFoundError } from '@/lib/clients/invoice';

function isServiceMode(): boolean {
  return process.env.INVOICE_SOURCE === 'service';
}

/**
 * GET /admin/api/invoices/[id]/pdf
 *
 * Admin-only PDF endpoint. Uses the admin session cookie (path=/admin)
 * which is always sent for requests under /admin/*.
 *
 * Under INVOICE_SOURCE=service the PDF is rendered by the standalone
 * invoice service and the bytes are streamed through unchanged so the
 * filename / disposition / cache headers match the legacy path.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateSession();
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const download = req.nextUrl.searchParams.get('download') === 'true';

  if (isServiceMode()) {
    try {
      // The service-generated filename doesn't include the invoice number
      // suffix we use here, so fetch the header to keep the original
      // download UX consistent.
      const detail = await invoiceClient.get(id);
      const pdfBuffer = await invoiceClient.getPdf(id);
      const filename = `${detail.invoice.invoiceNumber}.pdf`;
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
    } catch (err) {
      if (isNotFoundError(err)) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Failed to render PDF via invoice service:', err);
      return NextResponse.json({ error: 'Failed to render PDF' }, { status: 502 });
    }
  }

  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

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
      steps: item.steps ?? undefined,
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

  const pdfBuffer = await generateInvoicePdf(pdfProps);

  const filename = `${invoice.invoiceNumber}.pdf`;
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
