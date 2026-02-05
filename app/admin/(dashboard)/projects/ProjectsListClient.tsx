'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { deleteProject, toggleProjectFeatured, toggleProjectPublished, toggleWholeHouse } from '@/app/actions/admin/projects';
import { GOLD, TEXT_MID, SUCCESS, ERROR, NAVY } from '@/lib/theme';

interface ProjectRow {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  locationCity: string | null;
  featured: boolean;
  isPublished: boolean;
  isWholeHouse: boolean;
  parentProjectId: string | null;
}

interface Props {
  projects: ProjectRow[];
}

export default function ProjectsListClient({ projects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { locale } = useAdminLocale();

  // Build a map of parent IDs to their titles for quick lookup
  const parentMap = useMemo(() => {
    const map = new Map<string, { titleEn: string; titleZh: string }>();
    projects.forEach((p) => {
      if (p.isWholeHouse) {
        map.set(p.id, { titleEn: p.titleEn, titleZh: p.titleZh });
      }
    });
    return map;
  }, [projects]);

  const columns: Column<ProjectRow>[] = useMemo(() => {
    const getT = (row: ProjectRow) => locale === 'zh' ? row.titleZh : row.titleEn;
    return [
      { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? 'Title (ZH)' : 'Title (EN)', sortable: true },
      { key: 'serviceType', header: 'Type', sortable: true },
      { key: 'locationCity', header: 'City', sortable: true },
      {
        key: 'isWholeHouse',
        header: 'Container',
        render: (row: ProjectRow) => (
          <button
            type="button"
            onClick={() => startTransition(async () => {
              const result = await toggleWholeHouse(row.id, row.isWholeHouse);
              if (result.error) toast(result.error, 'error');
            })}
            aria-label={`Toggle whole house for ${getT(row)}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isWholeHouse ? NAVY : TEXT_MID, fontSize: '0.8125rem', fontWeight: row.isWholeHouse ? 600 : 400 }}
          >
            {row.isWholeHouse ? '🏠 Yes' : 'No'}
          </button>
        ),
      },
      {
        key: 'parentProjectId',
        header: 'Parent',
        render: (row: ProjectRow) => {
          if (!row.parentProjectId) return <span style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>—</span>;
          const parent = parentMap.get(row.parentProjectId);
          if (!parent) return <span style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>—</span>;
          const parentTitle = locale === 'zh' ? parent.titleZh : parent.titleEn;
          return (
            <Link
              href={`/admin/projects/${row.parentProjectId}`}
              style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
            >
              {parentTitle.length > 20 ? parentTitle.slice(0, 20) + '…' : parentTitle}
            </Link>
          );
        },
      },
      {
        key: 'featured',
        header: 'Featured',
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
            {row.featured ? 'Yes' : 'No'}
          </button>
        ),
      },
      {
        key: 'isPublished',
        header: 'Published',
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
            {row.isPublished ? 'Yes' : 'No'}
          </button>
        ),
      },
    ];
  }, [locale, toast, parentMap]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteProject(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast('Project deleted.');
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
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteId(row.id)}
              style={{ background: 'none', border: 'none', color: ERROR, cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Delete
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        message="This will permanently delete the project and all its images and scopes."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
