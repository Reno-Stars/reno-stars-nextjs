'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import { toggleGalleryItemPublished } from '@/app/actions/admin/gallery';
import { GOLD, TEXT_MID } from '@/lib/theme';

interface GalleryRow {
  id: string;
  imageUrl: string;
  titleEn: string | null;
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

  const columns: Column<GalleryRow>[] = [
    {
      key: 'imageUrl',
      header: 'Image',
      render: (row) => (
        <span title={row.imageUrl} style={{ fontSize: '0.8125rem' }}>
          {row.imageUrl.length > 35 ? '…' + row.imageUrl.slice(-35) : row.imageUrl}
        </span>
      ),
    },
    { key: 'titleEn', header: 'Title (EN)', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'displayOrder', header: 'Order', sortable: true },
    {
      key: 'isPublished',
      header: 'Published',
      render: (row) => {
        const isRowPending = pendingId === row.id;
        return (
          <button
            type="button"
            disabled={isRowPending}
            onClick={() => {
              setPendingId(row.id);
              startTransition(async () => {
                const result = await toggleGalleryItemPublished(row.id, row.isPublished);
                if (result.error) toast(result.error, 'error');
                setPendingId(null);
              });
            }}
            aria-label={`Toggle published for ${row.titleEn ?? row.imageUrl}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: isRowPending ? 'not-allowed' : 'pointer',
              color: row.isPublished ? GOLD : TEXT_MID,
              fontSize: '0.8125rem',
            }}
          >
            {row.isPublished ? 'Yes' : 'No'}
          </button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowKey={(row) => row.id}
      searchKeys={['titleEn', 'category']}
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
