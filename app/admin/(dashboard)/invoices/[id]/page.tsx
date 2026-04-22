import { notFound } from 'next/navigation';
import { getInvoiceById } from '@/lib/db/invoice-queries';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InvoiceDetailClient from './InvoiceDetailClient';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) notFound();

  // Serialize dates for client component
  const serialized = {
    ...invoice,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
    approvedAt: invoice.approvedAt?.toISOString() ?? null,
    viewedAt: invoice.viewedAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    lineItems: invoice.lineItems.map((li) => ({
      ...li,
      steps: li.steps ?? null,
      createdAt: li.createdAt.toISOString(),
    })),
    paymentMilestones: invoice.paymentMilestones.map((pm) => ({
      ...pm,
      paidAt: pm.paidAt?.toISOString() ?? null,
      createdAt: pm.createdAt.toISOString(),
      updatedAt: pm.updatedAt.toISOString(),
    })),
    versions: invoice.versions.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
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
