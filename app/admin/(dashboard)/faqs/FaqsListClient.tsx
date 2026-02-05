'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleFaqActive, deleteFaq } from '@/app/actions/admin/faqs';
import { GOLD, TEXT_MID } from '@/lib/theme';

interface FaqRow {
  id: string;
  questionEn: string;
  questionZh: string;
  answerEn: string;
  answerZh: string;
  displayOrder: number;
  isActive: boolean;
}

interface Props {
  faqs: FaqRow[];
}

export default function FaqsListClient({ faqs }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const { locale } = useAdminLocale();

  const getQuestion = (row: FaqRow) => locale === 'zh' ? row.questionZh : row.questionEn;

  const handleDelete = (id: string, row: FaqRow) => {
    if (!confirm(`Delete FAQ: "${getQuestion(row)}"?`)) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteFaq(id);
      if (result.error) toast(result.error, 'error');
      else toast('FAQ deleted.', 'success');
      setPendingId(null);
    });
  };

  const columns: Column<FaqRow>[] = useMemo(() => [
    {
      key: locale === 'zh' ? 'questionZh' : 'questionEn',
      header: locale === 'zh' ? 'Question (ZH)' : 'Question (EN)',
      sortable: true,
      render: (row) => (
        <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getQuestion(row)}
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
          ariaLabel={`Toggle active for: ${getQuestion(row).slice(0, 50)}${getQuestion(row).length > 50 ? '...' : ''}`}
          onClick={() => {
            setPendingId(row.id);
            startTransition(async () => {
              const result = await toggleFaqActive(row.id, row.isActive);
              if (result.error) toast(result.error, 'error');
              setPendingId(null);
            });
          }}
        />
      ),
    },
  ], [locale, pendingId, toast]);

  return (
    <DataTable
      columns={columns}
      data={faqs}
      getRowKey={(row) => row.id}
      searchKeys={['questionEn', 'questionZh']}
      actions={(row) => (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href={`/admin/faqs/${row.id}`}
            style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(row.id, row)}
            disabled={pendingId === row.id}
            style={{
              background: 'none',
              border: 'none',
              color: TEXT_MID,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Delete
          </button>
        </div>
      )}
    />
  );
}
