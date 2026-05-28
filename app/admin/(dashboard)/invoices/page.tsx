import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InvoiceListClient from './InvoiceListClient';
import {
  invoiceClient,
  type InvoiceStatus,
  type InvoiceType,
  type ListInvoicesQuery,
} from '@/lib/clients/invoice';

interface SearchParams {
  status?: string;
  type?: string;
  q?: string;
  page?: string;
}

export default async function InvoicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters: ListInvoicesQuery = {
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
  };

  if (params.status && params.status !== 'all') {
    filters.status = params.status as InvoiceStatus;
  }
  const activeType = params.type || 'estimate';
  if (activeType !== 'all') {
    filters.type = activeType as InvoiceType;
  }
  if (params.q) {
    filters.clientName = params.q;
  }

  const result = await invoiceClient.list(filters);

  return (
    <div>
      <AdminPageHeader
        titleKey="invoices.title"
        actions={[
          { labelKey: 'invoices.newEstimate', href: '/admin/invoices/new?type=estimate' },
          { labelKey: 'invoices.newInvoice', href: '/admin/invoices/new?type=invoice', color: '#1B365D' },
        ]}
      />
      <InvoiceListClient
        invoices={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        currentStatus={params.status || 'all'}
        currentType={params.type || 'estimate'}
        currentQuery={params.q || ''}
      />
    </div>
  );
}
