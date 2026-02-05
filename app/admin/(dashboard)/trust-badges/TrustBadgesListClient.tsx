'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
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
  const { locale } = useAdminLocale();

  const columns: Column<TrustBadgeRow>[] = useMemo(() => {
    const getB = (row: TrustBadgeRow) => locale === 'zh' ? row.badgeZh : row.badgeEn;
    return [
      { key: locale === 'zh' ? 'badgeZh' : 'badgeEn', header: locale === 'zh' ? 'Badge (ZH)' : 'Badge (EN)', sortable: true },
      { key: 'displayOrder', header: 'Order', sortable: true },
      {
        key: 'isActive',
        header: 'Active',
        render: (row: TrustBadgeRow) => (
          <ToggleButton
            isActive={row.isActive}
            isPending={pendingId === row.id}
            ariaLabel={`Toggle active for ${getB(row)}`}
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
  }, [locale, pendingId, toast]);

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
