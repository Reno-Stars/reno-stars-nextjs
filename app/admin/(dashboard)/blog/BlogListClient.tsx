'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { deleteBlogPost, toggleBlogPostPublished } from '@/app/actions/admin/blog';
import { GOLD, TEXT_MID, SUCCESS, ERROR } from '@/lib/theme';

interface BlogRow {
  id: string;
  slug: string;
  titleEn: string;
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

  const columns: Column<BlogRow>[] = [
    { key: 'titleEn', header: 'Title (EN)', sortable: true },
    { key: 'slug', header: 'Slug', sortable: true },
    { key: 'author', header: 'Author' },
    {
      key: 'isPublished',
      header: 'Published',
      render: (row) => (
        <button
          type="button"
          onClick={() => startTransition(async () => {
            const result = await toggleBlogPostPublished(row.id, row.isPublished);
            if (result.error) toast(result.error, 'error');
          })}
          aria-label={`Toggle published for ${row.titleEn}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}
        >
          {row.isPublished ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Date',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteBlogPost(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast('Blog post deleted.');
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={posts}
        getRowKey={(row) => row.id}
        searchKeys={['titleEn', 'slug', 'author']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/blog/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
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
        title="Delete Blog Post"
        message="This will permanently delete the blog post."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
