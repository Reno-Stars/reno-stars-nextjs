'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useDragReorder } from '@/hooks/useDragReorder';
import { deleteService, reorderServices } from '@/app/actions/admin/services';
import { getAssetUrl } from '@/lib/storage';
import {
  GOLD, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, CARD,
  TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface ServiceRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  iconUrl: string | null;
  displayOrder: number;
}

interface Props {
  services: ServiceRow[];
}

export default function ServicesListClient({ services }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const {
    draggedId, dragOverId, localOrder, isReordering,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
  } = useDragReorder<ServiceRow>({
    items: services,
    getId: (item) => item.id,
    getDisplayOrder: (item) => item.displayOrder,
    isIncluded: () => true,
    onReorder: reorderServices,
    onSuccess: () => toast(t.common.savedSuccessfully, 'success'),
    onError: (err) => toast(err, 'error'),
  });

  const displayData = useMemo(
    () => localOrder ?? [...services].sort((a, b) => a.displayOrder - b.displayOrder),
    [localOrder, services],
  );

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteService(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.services.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<ServiceRow>[] = useMemo(() => [
    { key: 'slug', header: t.services.slug },
    {
      key: locale === 'zh' ? 'titleZh' : 'titleEn',
      header: locale === 'zh' ? t.services.titleZh : t.services.titleEn,
      render: (row) => {
        const title = locale === 'zh' ? row.titleZh : row.titleEn;
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {row.iconUrl ? (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 6, backgroundColor: GOLD_PALE, flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getAssetUrl(row.iconUrl)} alt="" style={{ width: 14, height: 14, filter: GOLD_ICON_FILTER }} />
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 6, backgroundColor: `${TEXT_MUTED}20`, flexShrink: 0,
                  fontSize: 10, color: TEXT_MUTED,
                }}
              >
                ?
              </span>
            )}
            {title}
          </span>
        );
      },
    },
    { key: 'displayOrder', header: t.services.displayOrder },
  ], [locale, t]);

  const previewServices = useMemo(
    () => displayData.map((s) => ({
      slug: s.slug,
      title: locale === 'zh' ? s.titleZh : s.titleEn,
      description: locale === 'zh' ? s.descriptionZh : s.descriptionEn,
      iconUrl: s.iconUrl,
    })),
    [displayData, locale],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={displayData}
        getRowKey={(row) => row.id}
        searchKeys={['slug', 'titleEn', 'titleZh']}
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
              href={`/admin/services/${row.id}`}
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

      {/* Landing page preview */}
      {previewServices.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_MID, marginBottom: '1rem' }}>
            {t.services.landingPreview}
          </h3>
          <div
            style={{
              backgroundColor: SURFACE,
              borderRadius: 16,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              {previewServices.map((service) => (
                <div
                  key={service.slug}
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 16,
                    padding: '1.25rem',
                    boxShadow: neu(6),
                  }}
                >
                  {service.iconUrl && (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: GOLD_PALE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAssetUrl(service.iconUrl)}
                        alt=""
                        style={{ width: 24, height: 24, filter: GOLD_ICON_FILTER }}
                      />
                    </div>
                  )}
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: TEXT, marginBottom: '0.375rem' }}>
                    {service.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      color: TEXT_MID,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {service.description}
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: GOLD }}>
                    {t.services.exploreService.replace('{service}', service.title)} ›
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t.services.deleteService}
        message={t.services.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
