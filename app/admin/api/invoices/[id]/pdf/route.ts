import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { invoiceClient, isNotFoundError } from '@/lib/clients/invoice';

/**
 * GET /admin/api/invoices/[id]/pdf
 *
 * Admin-only PDF endpoint. Uses the admin session cookie (path=/admin)
 * which is always sent for requests under /admin/*.
 *
 * Thin proxy in front of the standalone invoice service — Next.js server
 * holds the bearer token so the admin browser never sees it. The bytes are
 * streamed through unchanged, with the original filename preserved.
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

  try {
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
