import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompanyFromDb } from '@/lib/db/queries';
import { SITE_NAME } from '@/lib/utils';
import {
  invoiceClient,
  isNotFoundError,
  type ServiceInvoice,
  type ServiceLineItem,
  type ServicePaymentMilestone,
} from '@/lib/clients/invoice';
import InvoiceClientView from './InvoiceClientView';

// No caching — always show fresh status
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string; shareToken: string }>;
}

interface ShareInvoiceData {
  id: string;
  invoiceNumber: string;
  type: 'estimate' | 'invoice';
  status: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  language: string;
  taxRate: number;
  gstNumber: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  shareToken: string;
  invoiceDate: Date;
  dueDate: Date | null;
  approvedAt: Date | null;
  viewedAt: Date | null;
  lineItems: Array<{
    id: string;
    sectionType: string | null;
    label: string;
    description: string;
    rateCents: number;
    quantity: number;
    amountCents: number;
    footerLines: string[];
  }>;
  paymentMilestones: Array<{
    id: string;
    label: string;
    labelZh: string | null;
    percentage: number;
    amountCents: number;
    isPaid: boolean;
    paidAt: Date | null;
  }>;
}

/** Normalize a service share response (ISO strings) to the page shape. */
function fromService(payload: {
  invoice: ServiceInvoice;
  lineItems: ServiceLineItem[];
  paymentMilestones: ServicePaymentMilestone[];
}): ShareInvoiceData {
  const { invoice, lineItems, paymentMilestones } = payload;
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    status: invoice.status,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    clientAddress: invoice.clientAddress,
    language: invoice.language,
    taxRate: invoice.taxRate,
    gstNumber: invoice.gstNumber,
    subtotalCents: invoice.subtotalCents,
    taxCents: invoice.taxCents,
    totalCents: invoice.totalCents,
    notes: invoice.notes,
    shareToken: invoice.shareToken,
    invoiceDate: new Date(invoice.invoiceDate),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
    approvedAt: invoice.approvedAt ? new Date(invoice.approvedAt) : null,
    viewedAt: invoice.viewedAt ? new Date(invoice.viewedAt) : null,
    lineItems: lineItems
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        id: item.id,
        sectionType: item.sectionType,
        label: item.label,
        description: item.description,
        rateCents: item.rateCents,
        quantity: item.quantity,
        amountCents: item.amountCents,
        footerLines: item.footerLines ?? [],
      })),
    paymentMilestones: paymentMilestones
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((ms) => ({
        id: ms.id,
        label: ms.label,
        labelZh: ms.labelZh,
        percentage: ms.percentage,
        amountCents: ms.amountCents,
        isPaid: ms.isPaid,
        paidAt: ms.paidAt ? new Date(ms.paidAt) : null,
      })),
  };
}

async function loadShareInvoice(shareToken: string): Promise<ShareInvoiceData | null> {
  try {
    const payload = await invoiceClient.getShare(shareToken);
    return fromService(payload);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareToken } = await params;

  const invoice = await loadShareInvoice(shareToken);
  if (!invoice) {
    return { title: 'Not Found', robots: { index: false, follow: false } };
  }

  const typeLabel = invoice.type === 'estimate' ? 'Estimate' : 'Invoice';
  const title = `${typeLabel} ${invoice.invoiceNumber} | ${SITE_NAME}`;

  return {
    title,
    description: `${typeLabel} for ${invoice.clientName}`,
    robots: { index: false, follow: false },
    openGraph: { title, type: 'website' },
  };
}

// ============================================================================
// PAGE
// ============================================================================

export default async function InvoiceSharePage({ params }: PageProps) {
  const { locale, shareToken } = await params;

  // Validate share token format (64-char hex)
  if (!/^[a-f0-9]{64}$/.test(shareToken)) {
    notFound();
  }

  const invoice = await loadShareInvoice(shareToken);
  if (!invoice) {
    notFound();
  }

  // NOTE: the service auto-tracks viewedAt and flips sent → viewed inside
  // getShare() — no client-side write needed here.

  // Fetch company info from the marketing DB. Terms & conditions are served
  // from the standalone invoice service (sourced from terms-english.ts /
  // terms-chinese.ts — same strings used for PDF rendering). We tolerate
  // failure here so a transient terms outage doesn't break the whole page.
  const [company, termsResult] = await Promise.all([
    getCompanyFromDb(),
    invoiceClient
      .getShareTerms(shareToken)
      .catch(() => ({ language: invoice.language, text: '', html: '' })),
  ]);

  // Determine if the client can approve
  const canApprove = invoice.status === 'sent' || invoice.status === 'viewed';

  return (
    <InvoiceClientView
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        status: invoice.status,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        clientAddress: invoice.clientAddress,
        language: invoice.language,
        taxRate: invoice.taxRate,
        gstNumber: invoice.gstNumber,
        subtotalCents: invoice.subtotalCents,
        taxCents: invoice.taxCents,
        totalCents: invoice.totalCents,
        notes: invoice.notes,
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString() ?? null,
        approvedAt: invoice.approvedAt?.toISOString() ?? null,
        shareToken: invoice.shareToken,
      }}
      lineItems={invoice.lineItems.map((item) => ({
        id: item.id,
        sectionType: item.sectionType,
        label: item.label,
        description: item.description,
        rateCents: item.rateCents,
        quantity: item.quantity,
        amountCents: item.amountCents,
        footerLines: item.footerLines ?? [],
      }))}
      milestones={invoice.paymentMilestones.map((ms) => ({
        id: ms.id,
        label: ms.label,
        labelZh: ms.labelZh,
        percentage: ms.percentage,
        amountCents: ms.amountCents,
        isPaid: ms.isPaid,
        paidAt: ms.paidAt?.toISOString() ?? null,
      }))}
      terms={termsResult.text}
      company={{
        name: company.name,
        phone: company.phone,
        email: company.email,
        address: company.address,
        logo: company.logo,
      }}
      canApprove={canApprove}
      locale={locale}
    />
  );
}
