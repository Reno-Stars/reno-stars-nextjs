import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceTermsTemplates } from '@/lib/db/schema';
import {
  getInvoiceByShareToken,
  markInvoiceViewed,
} from '@/lib/db/invoice-queries';
import { getCompanyFromDb } from '@/lib/db/queries';
import { SITE_NAME } from '@/lib/utils';
import InvoiceClientView from './InvoiceClientView';

// No caching — always show fresh status
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string; shareToken: string }>;
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareToken } = await params;

  const invoice = await getInvoiceByShareToken(shareToken);
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

  const invoice = await getInvoiceByShareToken(shareToken);
  if (!invoice) {
    notFound();
  }

  // Mark as viewed on first visit (sent → viewed)
  if (invoice.status === 'sent' && !invoice.viewedAt) {
    await markInvoiceViewed(invoice.id);
    // Update local reference for rendering
    invoice.status = 'viewed';
    invoice.viewedAt = new Date();
  }

  // Fetch company info and terms
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
