'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteProject, toggleProjectFeatured, toggleProjectPublished } from '@/app/actions/admin/projects';
import { GOLD, TEXT_MID, SUCCESS, ERROR } from '@/lib/theme';

interface ProjectRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  locationCity: string | null;
  featured: boolean;
  isPublished: boolean;
  houseId: string | null;
}

interface Props {
  projects: ProjectRow[];
}

export default function ProjectsListClient({ projects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();
  const t = useAdminTranslations();

  const columns: Column<ProjectRow>[] = useMemo(() => {
    const getT = (row: ProjectRow) => locale === 'zh' ? row.titleZh : row.titleEn;
    return [
      { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? t.projects.titleZh : t.projects.titleEn, sortable: true },
      { key: 'serviceType', header: t.projects.type, sortable: true },
      { key: 'locationCity', header: t.projects.city, sortable: true },
      {
        key: 'houseId',
        header: 'House',
        render: (row: ProjectRow) => (
          <span style={{ color: row.houseId ? GOLD : TEXT_MID, fontSize: '0.8125rem' }}>
            {row.houseId ? t.common.yes : '—'}
          </span>
        ),
      },
      {
        key: 'featured',
        header: t.projects.featured,
        render: (row: ProjectRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleProjectFeatured(row.id, row.featured);
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
        header: t.projects.published,
        render: (row: ProjectRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleProjectPublished(row.id, row.isPublished);
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
      const result = await deleteProject(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.projects.deleted);
      setDeleteId(null);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        getRowKey={(row) => row.id}
        searchKeys={['titleEn', 'titleZh', 'slug', 'locationCity', 'serviceType']}
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Link href={`/admin/projects/${row.id}`} style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}>
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
        title={t.projects.deleteProject}
        message={t.projects.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
