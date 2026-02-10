'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleTrustBadgeActive, deleteTrustBadge } from '@/app/actions/admin/trust-badges';
import { GOLD, TEXT_MID } from '@/lib/theme';

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
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteTrustBadge(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.trustBadges.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<TrustBadgeRow>[] = useMemo(() => {
    const getB = (row: TrustBadgeRow) => locale === 'zh' ? row.badgeZh : row.badgeEn;
    return [
      { key: locale === 'zh' ? 'badgeZh' : 'badgeEn', header: locale === 'zh' ? t.trustBadges.badgeZh : t.trustBadges.badgeEn, sortable: true },
      { key: 'displayOrder', header: t.trustBadges.displayOrder, sortable: true },
      {
        key: 'isActive',
        header: t.trustBadges.isActive,
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
  }, [locale, pendingId, toast, t]);

  return (
    <>
      <DataTable
        columns={columns}
        data={badges}
        getRowKey={(row) => row.id}
        searchKeys={['badgeEn', 'badgeZh']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/admin/trust-badges/${row.id}`}
              style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              {t.common.edit}
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{
                background: 'none',
                border: 'none',
                color: TEXT_MID,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t.common.delete}
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t.trustBadges.deleteTrustBadge}
        message={t.trustBadges.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
