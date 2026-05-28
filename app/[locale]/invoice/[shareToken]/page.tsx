import { permanentRedirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string; shareToken: string }>;
}

/**
 * Preserves existing emails that link to /[locale]/invoice/<token> by
 * permanently redirecting (HTTP 308) to the customer-facing share view served
 * by reno-stars-invoice-service at https://invoice.reno-stars.com/i/<token>.
 *
 * The Next.js admin no longer renders invoices — Twenty CRM owns invoice
 * records and the service owns the customer-facing view.
 */
export default async function InvoiceShareRedirect({ params }: Props) {
  const { shareToken } = await params;
  permanentRedirect(`https://invoice.reno-stars.com/i/${shareToken}`);
}

export const dynamic = 'force-dynamic';
