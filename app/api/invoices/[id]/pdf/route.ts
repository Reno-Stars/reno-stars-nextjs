import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/admin/auth';
import { invoiceClient, isNotFoundError } from '@/lib/clients/invoice';

// ============================================================================
// AUTH — accepts either Bearer token (MCP) or admin session cookie (browser)
// ============================================================================
//
// NOTE: this used to be the only auth-gated path because the public share
// view's "Download PDF" link points here. The share page itself is open
// (anyone with the share token sees the invoice), so a customer hitting
// "Download" needs an auth-less way through. The Next.js server fetches the
// PDF on their behalf using its server-side bearer token. The public client
// never sees the secret; this route is the gate.
//
// Today the Authorization-header / admin-cookie checks below mean the public
// "Download" link will return 401 to anyone NOT signed in as admin or
// passing INVOICE_API_SECRET. That's the legacy behavior preserved here.
// If we later want true public download access via the share token, switch
// the auth to "share-token in query string" — but for now keep parity.

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
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
