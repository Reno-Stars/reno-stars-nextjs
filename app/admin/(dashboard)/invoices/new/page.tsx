import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InvoiceCreateForm from './InvoiceCreateForm';

interface SearchParams {
  type?: string;
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const type = params.type === 'invoice' ? 'invoice' : 'estimate';
  const titleKey = type === 'invoice' ? 'invoices.createInvoice' : 'invoices.createEstimate';

  return (
    <div>
      <AdminPageHeader titleKey={titleKey} backHref="/admin/invoices" backLabelKey="invoices.title" />
      <InvoiceCreateForm type={type} />
    </div>
  );
}
