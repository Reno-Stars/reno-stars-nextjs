'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import DragHandleIcon from '@/components/admin/DragHandleIcon';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { togglePartnerActive, togglePartnerHidden, deletePartner, reorderPartners } from '@/app/actions/admin/partners';
import { GOLD, TEXT_MID, CARD, NAVY, ERROR, neu, SURFACE_ALT, TEXT_MUTED } from '@/lib/theme';
import { getAssetUrl } from '@/lib/storage';
import { useDragReorder } from '@/hooks/useDragReorder';

interface PartnerRow {
  id: string;
  nameEn: string;
  nameZh: string;
  logoUrl: string;
  websiteUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  isHiddenVisually: boolean;
}

interface Props {
  partners: PartnerRow[];
}

export default function PartnersListClient({ partners }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  // Drag and drop reordering
  const {
    draggedId,
    dragOverId,
    localOrder,
    isReordering,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    shouldNavigate,
  } = useDragReorder({
    items: partners,
    getId: (item) => item.id,
    getDisplayOrder: (item) => item.displayOrder,
    isIncluded: (item) => item.isActive,
    onReorder: reorderPartners,
    onSuccess: () => toast(t.common.savedSuccessfully, 'success'),
    onError: (error) => toast(error, 'error'),
  });

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  }, []);

  // Filter active partners for preview
  const activePartners = useMemo(() => {
    const source = localOrder ?? partners;
    return source.filter((item) => item.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [partners, localOrder]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deletePartner(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.partners.deleted, 'success');
      setDeleteId(null);
    });
  };

  const handleItemClick = useCallback((e: React.MouseEvent, id: string) => {
    if (shouldNavigate(e)) {
      router.push(`/admin/partners/${id}`);
    }
  }, [router, shouldNavigate]);

  const columns: Column<PartnerRow>[] = useMemo(() => {
    const getName = (row: PartnerRow) => locale === 'zh' ? row.nameZh : row.nameEn;
    return [
      {
        key: 'logoUrl',
        header: t.partners.logo,
        render: (row: PartnerRow) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getAssetUrl(row.logoUrl)}
            alt={getName(row)}
            style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ),
      },
      { key: locale === 'zh' ? 'nameZh' : 'nameEn', header: locale === 'zh' ? t.partners.nameZh : t.partners.nameEn, sortable: true },
      { key: 'displayOrder', header: t.partners.displayOrder, sortable: true },
      {
        key: 'isActive',
        header: t.partners.isActive,
        render: (row: PartnerRow) => (
          <ToggleButton
            isActive={row.isActive}
            isPending={pendingId === `active-${row.id}`}
            ariaLabel={t.partners.toggleActiveFor.replace('{name}', getName(row))}
            onClick={() => {
              setPendingId(`active-${row.id}`);
              startTransition(async () => {
                const result = await togglePartnerActive(row.id, row.isActive);
                if (result.error) toast(result.error, 'error');
                setPendingId(null);
              });
            }}
          />
        ),
      },
      {
        key: 'isHiddenVisually',
        header: t.partners.isHiddenVisually,
        render: (row: PartnerRow) => (
          <ToggleButton
            isActive={row.isHiddenVisually}
            isPending={pendingId === `hidden-${row.id}`}
            ariaLabel={t.partners.toggleHiddenFor.replace('{name}', getName(row))}
            onClick={() => {
              setPendingId(`hidden-${row.id}`);
              startTransition(async () => {
                const result = await togglePartnerHidden(row.id, row.isHiddenVisually);
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
      {/* Partners Preview - Logo Carousel */}
      <div
        style={{
          backgroundColor: SURFACE_ALT,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: NAVY, fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            {t.common.preview} ({t.partners.activeCount.replace('{count}', String(activePartners.length))})
          </h2>
          {activePartners.length > 1 && (
            <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
              {isReordering ? t.common.saving : t.partners.dragToReorder}
            </span>
          )}
        </div>
        {activePartners.length === 0 ? (
          <p style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.common.noRecords}</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {activePartners.map((item, index) => {
              const name = locale === 'zh' ? item.nameZh : item.nameEn;
              const hasFailed = failedImages.has(item.id);
              const isDragging = draggedId === item.id;
              const isDragOver = dragOverId === item.id;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleItemClick(e, item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/admin/partners/${item.id}`);
                    }
                  }}
                  className="group relative cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  style={{
                    width: 120,
                    height: 80,
                    borderRadius: '8px',
                    backgroundColor: CARD,
                    boxShadow: isDragOver ? `0 0 0 3px ${GOLD}` : neu(4),
                    opacity: isDragging ? 0.5 : item.isHiddenVisually ? 0.5 : 1,
                    transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                  }}
                  aria-label={`${t.common.edit} ${name}. ${t.partners.dragToReorder}`}
                >
                  {hasFailed ? (
                    <span style={{ color: TEXT_MUTED, fontSize: '0.65rem', textAlign: 'center' }}>
                      {t.common.imageLoadError}
                    </span>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getAssetUrl(item.logoUrl)}
                      alt={name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        filter: item.isHiddenVisually ? 'grayscale(100%)' : 'none',
                      }}
                      onError={() => handleImageError(item.id)}
                      draggable={false}
                    />
                  )}
                  {/* Order badge */}
                  <div
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem' }}
                  >
                    #{index + 1}
                  </div>
                  {/* Edit indicator */}
                  <div
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 px-1.5 py-0.5 rounded text-xs font-medium pointer-events-none"
                    style={{ backgroundColor: GOLD, color: '#fff', fontSize: '0.65rem' }}
                  >
                    {t.common.edit}
                  </div>
                  {/* Hidden indicator */}
                  {item.isHiddenVisually && (
                    <div
                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem' }}
                    >
                      {t.partners.seoOnly}
                    </div>
                  )}
                  {/* Drag indicator */}
                  <div
                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none"
                    style={{ color: TEXT_MID }}
                  >
                    <DragHandleIcon size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: CARD, borderRadius: '12px', padding: '1.5rem', boxShadow: neu(6) }}>
        <DataTable
          columns={columns}
          data={partners}
          getRowKey={(row) => row.id}
          searchKeys={['nameEn', 'nameZh']}
          headerAction={
            <Link
              href="/admin/partners/new"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: GOLD,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              {t.partners.addPartner}
            </Link>
          }
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href={`/admin/partners/${row.id}`}
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
      </div>
      <ConfirmDialog
        open={!!deleteId}
        title={t.partners.deletePartner}
        message={t.partners.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
