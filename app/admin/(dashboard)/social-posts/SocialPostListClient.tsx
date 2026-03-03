'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteSocialMediaPost, updateSocialPostStatus } from '@/app/actions/admin/social-posts';
import { GOLD, TEXT_MID, ERROR, NAVY } from '@/lib/theme';

interface SocialPostRow {
  id: string;
  titleEn: string;
  titleZh: string;
  status: string;
  blogPostId: string | null;
  projectId: string | null;
  siteId: string | null;
  scheduledAt: string | Date | null;
  createdAt: string | Date;
}

interface Props {
  posts: SocialPostRow[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: TEXT_MID,
  ready: GOLD,
  published: NAVY,
};

/** Extracted status cell to avoid pendingId in columns useMemo deps */
function StatusCell({
  row,
  statusOptions,
  statusLabel,
}: {
  row: SocialPostRow;
  statusOptions: { value: string; label: string }[];
  statusLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(row.status);
  const { toast } = useToast();

  // Sync optimistic state when server data updates (after revalidation)
  useEffect(() => { setOptimisticStatus(row.status); }, [row.status]);

  return (
    <select
      value={optimisticStatus}
      disabled={isPending}
      aria-label={statusLabel}
      onChange={(e) => {
        const newStatus = e.target.value;
        setOptimisticStatus(newStatus);
        startTransition(async () => {
          const result = await updateSocialPostStatus(row.id, newStatus);
          if (result.error) {
            setOptimisticStatus(row.status);
            toast(result.error, 'error');
          }
        });
      }}
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        color: STATUS_COLORS[optimisticStatus] ?? TEXT_MID,
        backgroundColor: 'transparent',
      }}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function SocialPostListClient({ posts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const statusOptions = useMemo(() => [
    { value: 'draft', label: t.socialPosts.statusDraft },
    { value: 'ready', label: t.socialPosts.statusReady },
    { value: 'published', label: t.socialPosts.statusPublished },
  ], [t]);

  const columns: Column<SocialPostRow>[] = useMemo(() => [
    {
      key: locale === 'zh' ? 'titleZh' : 'titleEn',
      header: locale === 'zh' ? t.socialPosts.titleZh : t.socialPosts.titleEn,
      sortable: true,
    },
    {
      key: 'blogPostId',
      header: t.socialPosts.source,
      render: (row) => {
        if (row.blogPostId) return <span style={{ fontSize: '0.8125rem' }}>{t.socialPosts.sourceBlog}</span>;
        if (row.projectId) return <span style={{ fontSize: '0.8125rem' }}>{t.socialPosts.sourceProject}</span>;
        if (row.siteId) return <span style={{ fontSize: '0.8125rem' }}>{t.socialPosts.sourceSite}</span>;
        return <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>—</span>;
      },
    },
    {
      key: 'status',
      header: t.socialPosts.status,
      render: (row) => (
        <StatusCell row={row} statusOptions={statusOptions} statusLabel={t.socialPosts.status} />
      ),
    },
    {
      key: 'scheduledAt',
      header: t.socialPosts.scheduledAt,
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
          {row.scheduledAt ? new Date(row.scheduledAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: t.socialPosts.date,
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ], [locale, t, statusOptions]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteSocialMediaPost(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.socialPosts.deleted);
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={posts}
        getRowKey={(row) => row.id}
        searchKeys={['titleEn', 'titleZh']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/social-posts/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
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
        title={t.socialPosts.deleteSocialPost}
        message={t.socialPosts.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
