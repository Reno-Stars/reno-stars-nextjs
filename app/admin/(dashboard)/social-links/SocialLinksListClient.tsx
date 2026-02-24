'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleSocialLinkActive, deleteSocialLink } from '@/app/actions/admin/social-links';
import { GOLD, ERROR } from '@/lib/theme';

interface SocialLinkRow {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface Props {
  socialLinks: SocialLinkRow[];
}

export default function SocialLinksListClient({ socialLinks }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const t = useAdminTranslations();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteSocialLink(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.socialLinks.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<SocialLinkRow>[] = [
    { key: 'platform', header: t.socialLinks.platform, sortable: true },
    { key: 'label', header: t.socialLinks.label, sortable: true },
    {
      key: 'url',
      header: t.socialLinks.url,
      render: (row) => (
        <span title={row.url} style={{ fontSize: '0.8125rem' }}>
          {row.url.length > 40 ? row.url.slice(0, 40) + '…' : row.url}
        </span>
      ),
    },
    { key: 'displayOrder', header: t.socialLinks.displayOrder, sortable: true },
    {
      key: 'isActive',
      header: t.socialLinks.isActive,
      render: (row) => (
        <ToggleButton
          isActive={row.isActive}
          isPending={pendingId === row.id}
          ariaLabel={`Toggle active for ${row.platform}`}
          onClick={() => {
            setPendingId(row.id);
            startTransition(async () => {
              const result = await toggleSocialLinkActive(row.id, row.isActive);
              if (result.error) toast(result.error, 'error');
              setPendingId(null);
            });
          }}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={socialLinks}
        getRowKey={(row) => row.id}
        searchKeys={['platform', 'label']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link
              href={`/admin/social-links/${row.id}`}
              style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              {t.common.edit}
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{ background: 'none', border: 'none', color: ERROR, cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}
            >
              {t.common.delete}
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t.socialLinks.deleteSocialLink}
        message={t.socialLinks.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
