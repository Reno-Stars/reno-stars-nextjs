'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { useDragReorder } from '@/hooks/useDragReorder';
import { toggleTrustBadgeActive, deleteTrustBadge, reorderTrustBadges } from '@/app/actions/admin/trust-badges';
import { GOLD, SURFACE_ALT, CARD, TEXT, TEXT_MID, ERROR, neu } from '@/lib/theme';

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

  const {
    draggedId, dragOverId, localOrder, isReordering,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
  } = useDragReorder<TrustBadgeRow>({
    items: badges,
    getId: (item) => item.id,
    getDisplayOrder: (item) => item.displayOrder,
    isIncluded: (item) => item.isActive,
    onReorder: reorderTrustBadges,
    onSuccess: () => toast(t.common.savedSuccessfully, 'success'),
    onError: (err) => toast(err, 'error'),
  });

  const displayData = useMemo(
    () => localOrder ?? [...badges].sort((a, b) => a.displayOrder - b.displayOrder),
    [localOrder, badges],
  );

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
      { key: locale === 'zh' ? 'badgeZh' : 'badgeEn', header: locale === 'zh' ? t.trustBadges.badgeZh : t.trustBadges.badgeEn },
      { key: 'displayOrder', header: t.trustBadges.displayOrder },
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

  const activeBadges = useMemo(
    () => displayData
      .filter((b) => b.isActive)
      .map((b) => ({ id: b.id, text: locale === 'zh' ? b.badgeZh : b.badgeEn })),
    [displayData, locale],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={displayData}
        getRowKey={(row) => row.id}
        searchKeys={['badgeEn', 'badgeZh']}
        headerAction={isReordering ? (
          <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>{t.common.saving}</span>
        ) : undefined}
        dragReorder={{
          draggedId, dragOverId, isReordering,
          handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
        }}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
                color: ERROR,
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

      {/* Landing page preview */}
      {activeBadges.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_MID, marginBottom: '1rem' }}>
            {t.trustBadges.landingPreview}
          </h3>
          <div
            style={{
              backgroundColor: SURFACE_ALT,
              borderRadius: 16,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {activeBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 12,
                    padding: '0.875rem 1rem',
                    boxShadow: neu(4),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                    <circle cx="12" cy="8" r="6" />
                  </svg>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT }}>
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
