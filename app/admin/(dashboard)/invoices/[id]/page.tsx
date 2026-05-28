import { notFound } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InvoiceDetailClient from './InvoiceDetailClient';
import { invoiceClient, isNotFoundError } from '@/lib/clients/invoice';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let detail;
  try {
    detail = await invoiceClient.get(id);
  } catch (err) {
    if (isNotFoundError(err)) notFound();
    throw err;
  }

  const { invoice, lineItems, paymentMilestones } = detail;

  // Build the serialized payload the admin client expects. The standalone
  // invoice service doesn't expose the versions audit log over HTTP, so pass
  // an empty array — the UI handles versions.length === 0 gracefully.
  const serialized = {
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
    paymentScheduleKey: invoice.paymentScheduleKey,
    subtotalCents: invoice.subtotalCents,
    taxCents: invoice.taxCents,
    totalCents: invoice.totalCents,
    notes: invoice.notes,
    shareToken: invoice.shareToken,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    approvedAt: invoice.approvedAt,
    viewedAt: invoice.viewedAt,
    version: invoice.version,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    lineItems: lineItems
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((li) => ({
        id: li.id,
        label: li.label,
        description: li.description,
        steps: li.steps ?? null,
        footerLines: li.footerLines ?? null,
        amountCents: li.amountCents,
        displayOrder: li.displayOrder,
        sectionType: li.sectionType,
        createdAt: li.createdAt,
      })),
    paymentMilestones: paymentMilestones
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((pm) => ({
        id: pm.id,
        label: pm.label,
        labelZh: pm.labelZh,
        percentage: pm.percentage,
        amountCents: pm.amountCents,
        isPaid: pm.isPaid,
        paidAt: pm.paidAt,
        paymentMethod: pm.paymentMethod,
        paymentReference: pm.paymentReference,
        createdAt: pm.createdAt,
        updatedAt: pm.updatedAt,
      })),
    versions: [],
  };

  return (
    <div>
      <AdminPageHeader
        titleKey="invoices.editInvoice"
        backHref="/admin/invoices"
        backLabelKey="invoices.title"
      />
      <InvoiceDetailClient invoice={serialized} />
    </div>
  );
}
