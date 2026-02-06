'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteSite, toggleSiteFeatured, toggleSitePublished, toggleSiteShowAsProject } from '@/app/actions/admin/sites';
import { GOLD, TEXT_MID, SUCCESS, ERROR } from '@/lib/theme';

interface SiteRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  locationCity: string | null;
  showAsProject: boolean;
  featured: boolean;
  isPublished: boolean;
}

interface Props {
  sites: SiteRow[];
}

export default function SitesListClient({ sites }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const columns: Column<SiteRow>[] = useMemo(() => {
    const getT = (row: SiteRow) => locale === 'zh' ? row.titleZh : row.titleEn;
    return [
      { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? t.sites.titleZh : t.sites.titleEn, sortable: true },
      { key: 'slug', header: t.sites.slug, sortable: true },
      { key: 'locationCity', header: t.sites.city, sortable: true },
      {
        key: 'showAsProject',
        header: t.sites.showAsProject,
        render: (row: SiteRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleSiteShowAsProject(row.id, row.showAsProject);
              if (result.error) toast(result.error, 'error');
            })}
            aria-label={`Toggle show as project for ${getT(row)}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.showAsProject ? GOLD : TEXT_MID, fontSize: '0.8125rem' }}
          >
            {row.showAsProject ? t.common.yes : t.common.no}
          </button>
        ),
      },
      {
        key: 'featured',
        header: t.sites.featured,
        render: (row: SiteRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleSiteFeatured(row.id, row.featured);
              if (result.error) toast(result.error, 'error');
            })}
            aria-label={`Toggle featured for ${getT(row)}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.featured ? GOLD : TEXT_MID, fontSize: '0.8125rem' }}
          >
            {row.featured ? t.common.yes : t.common.no}
          </button>
        ),
      },
      {
        key: 'isPublished',
        header: t.sites.published,
        render: (row: SiteRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleSitePublished(row.id, row.isPublished);
              if (result.error) toast(result.error, 'error');
            })}
            aria-label={`Toggle published for ${getT(row)}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}
          >
            {row.isPublished ? t.common.yes : t.common.no}
          </button>
        ),
      },
    ];
  }, [locale, toast, t]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteSite(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.sites.deleted);
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={sites}
        getRowKey={(row) => row.id}
        searchKeys={['titleEn', 'titleZh', 'slug', 'locationCity']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/sites/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
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
        title={t.sites.deleteSite}
        message={t.sites.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
