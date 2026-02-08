'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleGalleryItemPublished, deleteGalleryItem } from '@/app/actions/admin/gallery';
import { GOLD, TEXT_MID, CARD, NAVY, neu, SURFACE_ALT, TEXT_MUTED } from '@/lib/theme';
import { getAssetUrl } from '@/lib/storage';

interface GalleryRow {
  id: string;
  imageUrl: string;
  titleEn: string | null;
  titleZh: string | null;
  category: string;
  displayOrder: number;
  isPublished: boolean;
}

interface Props {
  items: GalleryRow[];
}

// Tetris layout pattern matching frontend TetrisGallery.tsx
const layouts = [
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
];

export default function GalleryListClient({ items }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  }, []);

  // Filter published items for preview grid
  const publishedItems = useMemo(
    () => items.filter((item) => item.isPublished).sort((a, b) => a.displayOrder - b.displayOrder),
    [items]
  );

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteGalleryItem(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.gallery.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<GalleryRow>[] = useMemo(() => {
    const getT = (row: GalleryRow) => locale === 'zh' ? row.titleZh : row.titleEn;
    return [
      {
        key: 'imageUrl',
        header: t.gallery.image,
        render: (row: GalleryRow) => (
          <span title={row.imageUrl} style={{ fontSize: '0.8125rem' }}>
            {row.imageUrl.length > 35 ? '...' + row.imageUrl.slice(-35) : row.imageUrl}
          </span>
        ),
      },
      {
        key: locale === 'zh' ? 'titleZh' : 'titleEn',
        header: locale === 'zh' ? t.gallery.titleZh : t.gallery.titleEn,
        sortable: true,
      },
      { key: 'category', header: t.gallery.categoryLabel, sortable: true },
      { key: 'displayOrder', header: t.gallery.displayOrder, sortable: true },
      {
        key: 'isPublished',
        header: t.gallery.published,
        render: (row: GalleryRow) => (
          <ToggleButton
            isActive={row.isPublished}
            isPending={pendingId === row.id}
            ariaLabel={`Toggle published for ${getT(row) ?? row.imageUrl}`}
            onClick={() => {
              setPendingId(row.id);
              startTransition(async () => {
                const result = await toggleGalleryItemPublished(row.id, row.isPublished);
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
      {/* Gallery Preview - Tetris Layout matching frontend */}
      <div
        style={{
          backgroundColor: SURFACE_ALT,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ color: NAVY, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          {t.common.preview} ({publishedItems.length} {t.gallery.published.toLowerCase()})
        </h2>
        {publishedItems.length === 0 ? (
          <p style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.common.noRecords}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {publishedItems.map((item, index) => {
              const layout = layouts[index % layouts.length];
              const title = locale === 'zh' ? item.titleZh : item.titleEn;
              const altText = title || item.category || `Gallery image ${index + 1}`;

              const hasFailed = failedImages.has(item.id);

              return (
                <Link
                  key={item.id}
                  href={`/admin/gallery/${item.id}`}
                  className={`${layout.col} ${layout.aspect} overflow-hidden relative group rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  style={{ boxShadow: neu(5), '--tw-ring-color': GOLD } as React.CSSProperties}
                  aria-label={`${t.common.edit} ${altText}`}
                >
                  {hasFailed ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: SURFACE_ALT }}
                    >
                      <span style={{ color: TEXT_MUTED, fontSize: '0.75rem' }}>
                        {t.common.imageLoadError || 'Image failed to load'}
                      </span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getAssetUrl(item.imageUrl)}
                      alt={altText}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-3 text-white">
                      {title && <h3 className="text-sm font-bold">{title}</h3>}
                      <p className="text-xs text-white/80">{item.category}</p>
                    </div>
                  </div>
                  {/* Edit indicator - visible on hover and focus */}
                  <div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: GOLD, color: '#fff' }}
                  >
                    {t.common.edit}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: CARD, borderRadius: '12px', padding: '1.5rem', boxShadow: neu(6) }}>
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => row.id}
          searchKeys={['titleEn', 'titleZh', 'category']}
          headerAction={
            <Link
              href="/admin/gallery/new"
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
              {t.gallery.addGalleryItem}
            </Link>
          }
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href={`/admin/gallery/${row.id}`}
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
      </div>
      <ConfirmDialog
        open={!!deleteId}
        title={t.gallery.deleteGalleryItem}
        message={t.gallery.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
