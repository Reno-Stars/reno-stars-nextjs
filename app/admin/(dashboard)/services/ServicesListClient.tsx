'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteService } from '@/app/actions/admin/services';
import { GOLD, TEXT_MID } from '@/lib/theme';

interface ServiceRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  displayOrder: number;
}

interface Props {
  services: ServiceRow[];
}

export default function ServicesListClient({ services }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteService(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.services.deleted, 'success');
      setDeleteId(null);
    });
  };

  const columns: Column<ServiceRow>[] = useMemo(() => [
    { key: 'slug', header: t.services.slug, sortable: true },
    { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? t.services.titleZh : t.services.titleEn, sortable: true },
    { key: 'displayOrder', header: t.services.displayOrder, sortable: true },
  ], [locale, t]);

  return (
    <>
      <DataTable
        columns={columns}
        data={services}
        getRowKey={(row) => row.id}
        searchKeys={['slug', 'titleEn', 'titleZh']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/admin/services/${row.id}`}
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
        title={t.services.deleteService}
        message={t.services.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
