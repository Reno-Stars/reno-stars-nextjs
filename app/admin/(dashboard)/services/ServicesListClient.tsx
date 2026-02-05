'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useAdminTranslations } from '@/lib/admin/translations';
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

export default function ServicesListClient({ services }: Props) {
  const t = useAdminTranslations();

  const columns: Column<ServiceRow>[] = useMemo(() => [
    { key: 'slug', header: t.services.slug, sortable: true },
    { key: 'titleEn', header: t.services.titleEn, sortable: true },
    { key: 'titleZh', header: t.services.titleZh },
    { key: 'displayOrder', header: t.services.displayOrder, sortable: true },
  ], [t]);

  return (
    <DataTable
      columns={columns}
      data={services}
      getRowKey={(row) => row.id}
      searchKeys={['slug', 'titleEn']}
      actions={(row) => (
        <Link href={`/admin/services/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
          {t.common.edit}
        </Link>
      )}
    />
  );
}
