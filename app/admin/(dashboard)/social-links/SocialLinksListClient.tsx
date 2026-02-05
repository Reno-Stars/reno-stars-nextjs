'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleSocialLinkActive } from '@/app/actions/admin/social-links';
import { GOLD } from '@/lib/theme';

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
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const columns: Column<SocialLinkRow>[] = [
    { key: 'platform', header: 'Platform', sortable: true },
    { key: 'label', header: 'Label', sortable: true },
    {
      key: 'url',
      header: 'URL',
      render: (row) => (
        <span title={row.url} style={{ fontSize: '0.8125rem' }}>
          {row.url.length > 40 ? row.url.slice(0, 40) + '…' : row.url}
        </span>
      ),
    },
    { key: 'displayOrder', header: 'Order', sortable: true },
    {
      key: 'isActive',
      header: 'Active',
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
    <DataTable
      columns={columns}
      data={socialLinks}
      getRowKey={(row) => row.id}
      searchKeys={['platform', 'label']}
      actions={(row) => (
        <Link
          href={`/admin/social-links/${row.id}`}
          style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
        >
          Edit
        </Link>
      )}
    />
  );
}
