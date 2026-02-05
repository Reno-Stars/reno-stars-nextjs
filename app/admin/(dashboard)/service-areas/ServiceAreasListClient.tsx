'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleServiceAreaActive } from '@/app/actions/admin/service-areas';
import { GOLD } from '@/lib/theme';

interface ServiceAreaRow {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  displayOrder: number;
  isActive: boolean;
}

interface Props {
  areas: ServiceAreaRow[];
}

export default function ServiceAreasListClient({ areas }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const columns: Column<ServiceAreaRow>[] = [
    { key: 'slug', header: 'Slug', sortable: true },
    { key: 'nameEn', header: 'Name (EN)', sortable: true },
    { key: 'nameZh', header: 'Name (ZH)' },
    { key: 'displayOrder', header: 'Order', sortable: true },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => (
        <ToggleButton
          isActive={row.isActive}
          isPending={pendingId === row.id}
          ariaLabel={`Toggle active for ${row.nameEn}`}
          onClick={() => {
            setPendingId(row.id);
            startTransition(async () => {
              const result = await toggleServiceAreaActive(row.id, row.isActive);
              if (result.error) toast(result.error, 'error');
              setPendingId(null);
            });
          }}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={areas}
      getRowKey={(row) => row.id}
      searchKeys={['slug', 'nameEn', 'nameZh']}
      actions={(row) => (
        <Link
          href={`/admin/service-areas/${row.id}`}
          style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
        >
          Edit
        </Link>
      )}
    />
  );
}
