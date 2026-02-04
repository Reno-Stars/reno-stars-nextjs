'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { deleteProject, toggleProjectFeatured, toggleProjectPublished } from '@/app/actions/admin/projects';
import { GOLD, NAVY, TEXT_MID, SUCCESS, ERROR } from '@/lib/theme';

interface ProjectRow {
  id: string;
  slug: string;
  titleEn: string;
  serviceType: string;
  locationCity: string | null;
  featured: boolean;
  isPublished: boolean;
  [key: string]: unknown;
}

interface Props {
  projects: ProjectRow[];
}

export default function ProjectsListClient({ projects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const columns: Column<ProjectRow>[] = [
    { key: 'titleEn', header: 'Title (EN)', sortable: true },
    { key: 'serviceType', header: 'Type', sortable: true },
    { key: 'locationCity', header: 'City', sortable: true },
    {
      key: 'featured',
      header: 'Featured',
      render: (row) => (
        <button
          type="button"
          onClick={() => startTransition(async () => {
            const result = await toggleProjectFeatured(row.id, row.featured);
            if (result.error) toast(result.error, 'error');
          })}
          aria-label={`Toggle featured for ${row.titleEn}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.featured ? GOLD : TEXT_MID, fontSize: '0.8125rem' }}
        >
          {row.featured ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'isPublished',
      header: 'Published',
      render: (row) => (
        <button
          type="button"
          onClick={() => startTransition(async () => {
            const result = await toggleProjectPublished(row.id, row.isPublished);
            if (result.error) toast(result.error, 'error');
          })}
          aria-label={`Toggle published for ${row.titleEn}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}
        >
          {row.isPublished ? 'Yes' : 'No'}
        </button>
      ),
    },
  ];

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
        searchKeys={['titleEn', 'slug', 'locationCity', 'serviceType']}
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
