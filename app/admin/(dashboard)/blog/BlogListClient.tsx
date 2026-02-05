'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteBlogPost, toggleBlogPostPublished } from '@/app/actions/admin/blog';
import { GOLD, TEXT_MID, SUCCESS, ERROR } from '@/lib/theme';

interface BlogRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  author: string | null;
  isPublished: boolean;
  publishedAt: string | Date | null;
}

interface Props {
  posts: BlogRow[];
}

export default function BlogListClient({ posts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const columns: Column<BlogRow>[] = useMemo(() => [
    { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? t.blog.titleZh : t.blog.titleEn, sortable: true },
    { key: 'slug', header: t.blog.slug, sortable: true },
    { key: 'author', header: t.blog.author },
    {
      key: 'isPublished',
      header: t.blog.publishedLabel,
      render: (row) => (
        <button
          type="button"
          onClick={() => startTransition(async () => {
            const result = await toggleBlogPostPublished(row.id, row.isPublished);
            if (result.error) toast(result.error, 'error');
          })}
          aria-label={`Toggle published for ${locale === 'zh' ? row.titleZh : row.titleEn}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}
        >
          {row.isPublished ? t.common.yes : t.common.no}
        </button>
      ),
    },
    {
      key: 'publishedAt',
      header: t.blog.date,
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ], [locale, toast, t]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteBlogPost(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.blog.deleted);
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={posts}
        getRowKey={(row) => row.id}
        searchKeys={['titleEn', 'titleZh', 'slug', 'author']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/blog/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
              {t.common.edit}
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{ background: 'none', border: 'none', color: ERROR, cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              {t.common.delete}
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t.blog.deleteBlogPost}
        message={t.blog.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
