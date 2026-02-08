'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { toggleServiceAreaActive, deleteServiceArea } from '@/app/actions/admin/service-areas';
import { GOLD, TEXT_MID } from '@/lib/theme';

interface ServiceAreaRow {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  displayOrder: number;
  isActive: boolean;
}

interface Props {
  areas: ServiceAreaRow[];
}

export default function ServiceAreasListClient({ areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteServiceArea(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.serviceAreas.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<ServiceAreaRow>[] = useMemo(() => {
    const getN = (row: ServiceAreaRow) => locale === 'zh' ? row.nameZh : row.nameEn;
    return [
      { key: 'slug', header: t.serviceAreas.slug, sortable: true },
      { key: locale === 'zh' ? 'nameZh' : 'nameEn', header: locale === 'zh' ? t.serviceAreas.nameZh : t.serviceAreas.nameEn, sortable: true },
      { key: 'displayOrder', header: t.serviceAreas.displayOrder, sortable: true },
      {
        key: 'isActive',
        header: t.serviceAreas.isActive,
        render: (row: ServiceAreaRow) => (
          <ToggleButton
            isActive={row.isActive}
            isPending={pendingId === row.id}
            ariaLabel={`Toggle active for ${getN(row)}`}
            onClick={() => {
              setPendingId(row.id);
              startTransition(async () => {
                const result = await toggleServiceAreaActive(row.id, row.isActive);
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
        data={areas}
        getRowKey={(row) => row.id}
        searchKeys={['slug', 'nameEn', 'nameZh']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/admin/service-areas/${row.id}`}
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
        title={t.serviceAreas.deleteServiceArea}
        message={t.serviceAreas.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
