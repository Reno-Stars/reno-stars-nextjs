import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceTermsTemplates } from '@/lib/db/schema';
import type { DbInvoice, DbInvoiceLineItem, DbInvoicePaymentMilestone } from '@/lib/db/schema';
import {
  getInvoiceByShareToken,
  markInvoiceViewed,
} from '@/lib/db/invoice-queries';
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

function isServiceMode(): boolean {
  return process.env.INVOICE_SOURCE === 'service';
}

/** Normalize a legacy DB invoice (Date objects) to the shared share-data shape. */
function fromLegacy(
  invoice: DbInvoice & {
    lineItems: DbInvoiceLineItem[];
    paymentMilestones: DbInvoicePaymentMilestone[];
  }
): ShareInvoiceData {
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
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    approvedAt: invoice.approvedAt,
    viewedAt: invoice.viewedAt,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      sectionType: item.sectionType,
      label: item.label,
      description: item.description,
      rateCents: item.rateCents,
      quantity: item.quantity,
      amountCents: item.amountCents,
      footerLines: item.footerLines ?? [],
    })),
    paymentMilestones: invoice.paymentMilestones.map((ms) => ({
      id: ms.id,
      label: ms.label,
      labelZh: ms.labelZh,
      percentage: ms.percentage,
      amountCents: ms.amountCents,
      isPaid: ms.isPaid,
      paidAt: ms.paidAt,
    })),
  };
}

/** Normalize a service share response (ISO strings) to the same shape. */
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
  if (isServiceMode()) {
    try {
      const payload = await invoiceClient.getShare(shareToken);
      return fromService(payload);
    } catch (err) {
      if (isNotFoundError(err)) return null;
      throw err;
    }
  }
  const legacy = await getInvoiceByShareToken(shareToken);
  if (!legacy) return null;
  return fromLegacy(legacy);
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

  // Mark as viewed on first visit (sent → viewed).
  // The standalone service already does this server-side on every share
  // fetch — only run it for the legacy path so we don't double-write.
  if (!isServiceMode() && invoice.status === 'sent' && !invoice.viewedAt) {
    await markInvoiceViewed(invoice.id);
    invoice.status = 'viewed';
    invoice.viewedAt = new Date();
  }

  // Fetch company info and terms (still served from the marketing DB —
  // terms templates and company info are not part of the invoice service).
  const [company, termsRows] = await Promise.all([
    getCompanyFromDb(),
    db
      .select()
      .from(invoiceTermsTemplates)
      .where(
        and(
          eq(invoiceTermsTemplates.language, invoice.language),
          eq(invoiceTermsTemplates.isDefault, true)
        )
      )
      .limit(1),
  ]);

  const terms = termsRows[0]?.content ?? '';

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
      terms={terms}
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
