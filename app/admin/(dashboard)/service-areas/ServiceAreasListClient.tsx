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
import { toggleServiceAreaActive, deleteServiceArea, reorderServiceAreas } from '@/app/actions/admin/service-areas';
import { GOLD, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, ERROR, neu } from '@/lib/theme';

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
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const {
    draggedId, dragOverId, localOrder, isReordering,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
  } = useDragReorder<ServiceAreaRow>({
    items: areas,
    getId: (item) => item.id,
    getDisplayOrder: (item) => item.displayOrder,
    isIncluded: (item) => item.isActive,
    onReorder: reorderServiceAreas,
    onSuccess: () => toast(t.common.savedSuccessfully, 'success'),
    onError: (err) => toast(err, 'error'),
  });

  const displayData = useMemo(
    () => localOrder ?? [...areas].sort((a, b) => a.displayOrder - b.displayOrder),
    [localOrder, areas],
  );

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteServiceArea(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.serviceAreas.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<ServiceAreaRow>[] = useMemo(() => {
    return [
      { key: 'slug', header: t.serviceAreas.slug },
      { key: locale === 'zh' ? 'nameZh' : 'nameEn', header: locale === 'zh' ? t.serviceAreas.nameZh : t.serviceAreas.nameEn },
      { key: 'displayOrder', header: t.serviceAreas.displayOrder },
      {
        key: 'isActive',
        header: t.serviceAreas.isActive,
        render: (row: ServiceAreaRow) => (
          <ToggleButton
            isActive={row.isActive}
            isPending={pendingId === row.id}
            ariaLabel={`Toggle active for ${locale === 'zh' ? row.nameZh : row.nameEn}`}
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
  }, [locale, pendingId, toast, t]);

  const activeAreas = useMemo(
    () => displayData
      .filter((a) => a.isActive)
      .map((a) => ({
        slug: a.slug,
        name: locale === 'zh' ? a.nameZh : a.nameEn,
      })),
    [displayData, locale],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={displayData}
        getRowKey={(row) => row.id}
        searchKeys={['slug', 'nameEn', 'nameZh']}
        headerAction={isReordering ? (
          <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>{t.common.saving}</span>
        ) : undefined}
        dragReorder={{
          draggedId, dragOverId, isReordering,
          handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
        }}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/admin/service-areas/${row.id}`}
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
      {activeAreas.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_MID, marginBottom: '1rem' }}>
            {t.serviceAreas.landingPreview}
          </h3>
          {/* Areas hub card grid */}
          <div
            style={{
              backgroundColor: SURFACE_ALT,
              borderRadius: 16,
              padding: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {activeAreas.map((area) => (
                <div
                  key={area.slug}
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 12,
                    padding: '1rem',
                    boxShadow: neu(4),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={GOLD}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT }}>
                      {area.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Footer bar preview */}
          <div
            style={{
              backgroundColor: SURFACE_ALT,
              borderRadius: 12,
              padding: '0.75rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem 0.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: GOLD }}>
              {t.serviceAreas.title}
            </span>
            <span style={{ color: TEXT_MUTED, margin: '0 0.25rem' }}>|</span>
            {activeAreas.map((area, i) => (
              <span key={area.slug} style={{ fontSize: '0.75rem', fontWeight: 500, color: TEXT_MID }}>
                {area.name}
                {i < activeAreas.length - 1 && (
                  <span style={{ color: `${TEXT}20`, margin: '0 0.375rem' }}>&bull;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t.serviceAreas.deleteServiceArea}
        message={t.serviceAreas.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
