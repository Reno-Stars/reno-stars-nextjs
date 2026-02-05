'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleGalleryItemPublished } from '@/app/actions/admin/gallery';
import { GOLD } from '@/lib/theme';

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

export default function GalleryListClient({ items }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const { locale } = useAdminLocale();

  const columns: Column<GalleryRow>[] = useMemo(() => {
    const getT = (row: GalleryRow) => locale === 'zh' ? row.titleZh : row.titleEn;
    return [
      {
        key: 'imageUrl',
        header: 'Image',
        render: (row: GalleryRow) => (
          <span title={row.imageUrl} style={{ fontSize: '0.8125rem' }}>
            {row.imageUrl.length > 35 ? '…' + row.imageUrl.slice(-35) : row.imageUrl}
          </span>
        ),
      },
      {
        key: locale === 'zh' ? 'titleZh' : 'titleEn',
        header: locale === 'zh' ? 'Title (ZH)' : 'Title (EN)',
        sortable: true,
      },
      { key: 'category', header: 'Category', sortable: true },
      { key: 'displayOrder', header: 'Order', sortable: true },
      {
        key: 'isPublished',
        header: 'Published',
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
  }, [locale, pendingId, toast]);

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowKey={(row) => row.id}
      searchKeys={['titleEn', 'titleZh', 'category']}
      actions={(row) => (
        <Link
          href={`/admin/gallery/${row.id}`}
          style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
        >
          Edit
        </Link>
      )}
    />
  );
}
