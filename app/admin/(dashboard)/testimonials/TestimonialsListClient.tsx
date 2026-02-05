'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { deleteTestimonial, toggleTestimonialFeatured } from '@/app/actions/admin/testimonials';
import { GOLD, TEXT_MID, ERROR } from '@/lib/theme';

interface TestimonialRow {
  id: string;
  name: string;
  textEn: string;
  textZh: string;
  rating: number;
  location: string | null;
  isFeatured: boolean;
  verified: boolean;
}

interface Props {
  testimonials: TestimonialRow[];
}

export default function TestimonialsListClient({ testimonials }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();

  const columns: Column<TestimonialRow>[] = useMemo(() => {
    const getTxt = (row: TestimonialRow) => locale === 'zh' ? row.textZh : row.textEn;
    return [
      { key: 'name', header: 'Name', sortable: true },
      {
        key: locale === 'zh' ? 'textZh' : 'textEn',
        header: locale === 'zh' ? 'Text (ZH)' : 'Text (EN)',
        render: (row: TestimonialRow) => (
          <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getTxt(row)}
          </span>
        ),
      },
      { key: 'rating', header: 'Rating', sortable: true },
      { key: 'location', header: 'Location', sortable: true },
      {
        key: 'isFeatured',
        header: 'Featured',
        render: (row: TestimonialRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleTestimonialFeatured(row.id, row.isFeatured);
              if (result.error) toast(result.error, 'error');
            })}
            aria-label={`Toggle featured for ${row.name}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isFeatured ? GOLD : TEXT_MID, fontSize: '0.8125rem' }}
          >
            {row.isFeatured ? 'Yes' : 'No'}
          </button>
        ),
      },
    ];
  }, [locale, toast]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteTestimonial(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast('Testimonial deleted.');
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={testimonials}
        getRowKey={(row) => row.id}
        searchKeys={['name', 'location', 'textEn', 'textZh']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/testimonials/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{ background: 'none', border: 'none', color: ERROR, cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Delete
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Testimonial"
        message="This will permanently delete the testimonial."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
