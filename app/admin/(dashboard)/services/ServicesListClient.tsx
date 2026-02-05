'use client';

import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { GOLD } from '@/lib/theme';

interface ServiceRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  displayOrder: number;
}

interface Props {
  services: ServiceRow[];
}

const columns: Column<ServiceRow>[] = [
  { key: 'slug', header: 'Slug', sortable: true },
  { key: 'titleEn', header: 'Title (EN)', sortable: true },
  { key: 'titleZh', header: 'Title (ZH)' },
  { key: 'displayOrder', header: 'Order', sortable: true },
];

export default function ServicesListClient({ services }: Props) {
  return (
    <DataTable
      columns={columns}
      data={services}
      getRowKey={(row) => row.id}
      searchKeys={['slug', 'titleEn']}
      actions={(row) => (
        <Link href={`/admin/services/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
          Edit
        </Link>
      )}
    />
  );
}
