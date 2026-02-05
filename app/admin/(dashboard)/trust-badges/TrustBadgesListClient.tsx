'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleTrustBadgeActive } from '@/app/actions/admin/trust-badges';
import { GOLD } from '@/lib/theme';

interface TrustBadgeRow {
  id: string;
  badgeEn: string;
  badgeZh: string;
  displayOrder: number;
  isActive: boolean;
}

interface Props {
  badges: TrustBadgeRow[];
}

export default function TrustBadgesListClient({ badges }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const columns: Column<TrustBadgeRow>[] = [
    { key: 'badgeEn', header: 'Badge (EN)', sortable: true },
    { key: 'badgeZh', header: 'Badge (ZH)' },
    { key: 'displayOrder', header: 'Order', sortable: true },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => (
        <ToggleButton
          isActive={row.isActive}
          isPending={pendingId === row.id}
          ariaLabel={`Toggle active for ${row.badgeEn}`}
          onClick={() => {
            setPendingId(row.id);
            startTransition(async () => {
              const result = await toggleTrustBadgeActive(row.id, row.isActive);
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
      data={badges}
      getRowKey={(row) => row.id}
      searchKeys={['badgeEn', 'badgeZh']}
      actions={(row) => (
        <Link
          href={`/admin/trust-badges/${row.id}`}
          style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
        >
          Edit
        </Link>
      )}
    />
  );
}
