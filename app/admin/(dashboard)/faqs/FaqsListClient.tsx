'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
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
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteFaq(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.faqs.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<FaqRow>[] = useMemo(() => {
    const getQ = (row: FaqRow) => locale === 'zh' ? row.questionZh : row.questionEn;
    return [
      {
        key: locale === 'zh' ? 'questionZh' : 'questionEn',
        header: locale === 'zh' ? t.faqs.questionZh : t.faqs.questionEn,
        sortable: true,
        render: (row: FaqRow) => (
          <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getQ(row)}
          </span>
        ),
      },
      { key: 'displayOrder', header: t.faqs.displayOrder, sortable: true },
      {
        key: 'isActive',
        header: t.faqs.active,
        render: (row: FaqRow) => (
          <ToggleButton
            isActive={row.isActive}
            isPending={pendingId === row.id}
            ariaLabel={`Toggle active for: ${getQ(row).slice(0, 50)}${getQ(row).length > 50 ? '...' : ''}`}
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
    ];
  }, [locale, pendingId, toast, t]);

  return (
    <>
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
              {t.common.edit}
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{
                background: 'none',
                border: 'none',
                color: TEXT_MID,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t.common.delete}
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t.faqs.deleteFaq}
        message={t.faqs.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
