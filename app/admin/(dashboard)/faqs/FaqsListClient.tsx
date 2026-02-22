'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { useDragReorder } from '@/hooks/useDragReorder';
import { toggleFaqActive, deleteFaq, reorderFaqs } from '@/app/actions/admin/faqs';
import { GOLD, SURFACE_ALT, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

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
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const {
    draggedId, dragOverId, localOrder, isReordering,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
  } = useDragReorder<FaqRow>({
    items: faqs,
    getId: (item) => item.id,
    getDisplayOrder: (item) => item.displayOrder,
    isIncluded: (item) => item.isActive,
    onReorder: reorderFaqs,
    onSuccess: () => toast(t.common.savedSuccessfully, 'success'),
    onError: (err) => toast(err, 'error'),
  });

  const displayData = useMemo(
    () => localOrder ?? [...faqs].sort((a, b) => a.displayOrder - b.displayOrder),
    [localOrder, faqs],
  );

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
        render: (row: FaqRow) => (
          <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getQ(row)}
          </span>
        ),
      },
      { key: 'displayOrder', header: t.faqs.displayOrder },
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

  const activeFaqs = useMemo(
    () => displayData
      .filter((f) => f.isActive)
      .map((f) => ({
        id: f.id,
        question: locale === 'zh' ? f.questionZh : f.questionEn,
        answer: locale === 'zh' ? f.answerZh : f.answerEn,
      })),
    [displayData, locale],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={displayData}
        getRowKey={(row) => row.id}
        searchKeys={['questionEn', 'questionZh']}
        headerAction={isReordering ? (
          <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>{t.common.saving}</span>
        ) : undefined}
        dragReorder={{
          draggedId, dragOverId, isReordering,
          handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
        }}
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

      {/* Landing page preview */}
      {activeFaqs.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_MID, marginBottom: '1rem' }}>
            {t.faqs.landingPreview}
          </h3>
          <div
            style={{
              backgroundColor: SURFACE_ALT,
              borderRadius: 16,
              padding: '1.5rem',
            }}
          >
            <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      backgroundColor: CARD,
                      borderRadius: 16,
                      boxShadow: neu(4),
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`preview-faq-${faq.id}`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT, paddingRight: '1rem' }}>
                        {faq.question}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={GOLD}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          flexShrink: 0,
                          transition: 'transform 0.3s',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div id={`preview-faq-${faq.id}`} style={{ padding: '0 1.25rem 1rem', fontSize: '0.8125rem', lineHeight: 1.6, color: TEXT_MID }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
