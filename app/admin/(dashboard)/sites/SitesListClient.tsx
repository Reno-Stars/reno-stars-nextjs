'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteSite, toggleSiteFeatured, toggleSitePublished, toggleSiteShowAsProject } from '@/app/actions/admin/sites';
import { GOLD, TEXT_MID, TEXT_MUTED, NAVY, SUCCESS, ERROR } from '@/lib/theme';

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

interface ProjectSummary {
  id: string;
  siteId: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  isPublished: boolean;
  displayOrderInSite: number;
}

interface Props {
  sites: SiteRow[];
  projectsBySite: Record<string, ProjectSummary[]>;
}

export default function SitesListClient({ sites, projectsBySite }: Props) {
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
        key: '_projectCount',
        header: t.sites.projectsColumn,
        render: (row: SiteRow) => {
          const count = projectsBySite[row.id]?.length ?? 0;
          return (
            <span style={{ color: count > 0 ? NAVY : TEXT_MUTED, fontSize: '0.8125rem' }}>
              {count}
            </span>
          );
        },
      },
      {
        key: 'showAsProject',
        header: t.sites.showAsProject,
        render: (row: SiteRow) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startTransition(async () => {
                const result = await toggleSiteShowAsProject(row.id, row.showAsProject);
                if (result.error) toast(result.error, 'error');
              });
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              startTransition(async () => {
                const result = await toggleSiteFeatured(row.id, row.featured);
                if (result.error) toast(result.error, 'error');
              });
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              startTransition(async () => {
                const result = await toggleSitePublished(row.id, row.isPublished);
                if (result.error) toast(result.error, 'error');
              });
            }}
            aria-label={`Toggle published for ${getT(row)}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}
          >
            {row.isPublished ? t.common.yes : t.common.no}
          </button>
        ),
      },
    ];
  }, [locale, toast, t, projectsBySite]);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteSite(deleteId);
      if (result.error) toast(result.error, 'error');
      else toast(t.sites.deleted);
      setDeleteId(null);
    });
  };

  const filterRow = useCallback((row: SiteRow, query: string) => {
    // Match site's own fields
    const siteMatch = [row.titleEn, row.titleZh, row.slug, row.locationCity]
      .some((val) => val && val.toLowerCase().includes(query));
    if (siteMatch) return true;
    // Match any project inside the site
    const siteProjects = projectsBySite[row.id] ?? [];
    return siteProjects.some((p) =>
      p.titleEn.toLowerCase().includes(query) ||
      p.titleZh.toLowerCase().includes(query) ||
      p.serviceType.toLowerCase().includes(query)
    );
  }, [projectsBySite]);

  const renderExpandedRow = useCallback((row: SiteRow) => {
    const siteProjects = projectsBySite[row.id] ?? [];
    if (siteProjects.length === 0) {
      return (
        <div style={{ padding: '1rem 1.5rem', color: TEXT_MUTED, fontSize: '0.8125rem' }}>
          {t.sites.noProjects}
        </div>
      );
    }

    return (
      <div style={{ padding: '0.5rem 1.5rem 0.75rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <tbody>
            {siteProjects.map((project) => {
              const title = locale === 'zh' ? project.titleZh : project.titleEn;
              const serviceLabel = project.serviceType in t.projects.serviceTypes
                ? t.projects.serviceTypes[project.serviceType as keyof typeof t.projects.serviceTypes]
                : project.serviceType;
              return (
                <tr key={project.id} style={{ borderBottom: '1px solid rgba(27,54,93,0.06)' }}>
                  <td style={{ padding: '0.5rem 0.5rem 0.5rem 0', color: NAVY, fontWeight: 500 }}>
                    {title}
                  </td>
                  <td style={{ padding: '0.5rem', color: TEXT_MID }}>
                    {serviceLabel}
                  </td>
                  <td style={{ padding: '0.5rem', color: project.isPublished ? SUCCESS : ERROR }}>
                    {project.isPublished ? t.common.yes : t.common.no}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <Link
                      href={`/admin/sites/${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: GOLD, fontSize: '0.75rem', textDecoration: 'none' }}
                    >
                      {t.common.edit}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [projectsBySite, locale, t]);

  return (
    <>
      <DataTable
        columns={columns}
        data={sites}
        getRowKey={(row) => row.id}
        filterRow={filterRow}
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
        renderExpandedRow={renderExpandedRow}
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
