import { listInvoices, type ListInvoicesFilters } from '@/lib/db/invoice-queries';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InvoiceListClient from './InvoiceListClient';

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
  const filters: ListInvoicesFilters = {
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
  };

  if (params.status && params.status !== 'all') {
    filters.status = params.status as ListInvoicesFilters['status'];
  }
  if (params.type && params.type !== 'all') {
    filters.type = params.type as ListInvoicesFilters['type'];
  }
  if (params.q) {
    filters.clientName = params.q;
  }

  const result = await listInvoices(filters);

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
        currentType={params.type || 'all'}
        currentQuery={params.q || ''}
      />
    </div>
  );
}
