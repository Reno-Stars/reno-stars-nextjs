'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import { toggleSocialLinkActive } from '@/app/actions/admin/social-links';
import { GOLD, TEXT_MID } from '@/lib/theme';

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
  const [isPending, startTransition] = useTransition();
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
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleSocialLinkActive(row.id, row.isActive);
              if (result.error) toast(result.error, 'error');
            })
          }
          aria-label={`Toggle active for ${row.platform}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            color: row.isActive ? GOLD : TEXT_MID,
            fontSize: '0.8125rem',
          }}
        >
          {row.isActive ? 'Yes' : 'No'}
        </button>
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
