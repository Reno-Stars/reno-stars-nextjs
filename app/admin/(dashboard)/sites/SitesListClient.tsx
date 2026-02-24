'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import ToggleButton from '@/components/admin/ToggleButton';
import { deleteSite, toggleSiteFeatured, toggleSitePublished, toggleSiteShowAsProject } from '@/app/actions/admin/sites';
import { CARD, GOLD, TEXT_MID, TEXT_MUTED, NAVY, SUCCESS, ERROR } from '@/lib/theme';
import type { ProjectSummary } from '@/lib/db/queries';

// Flat project row for the standalone tab
interface StandaloneProjectRow {
  id: string;
  slug: string;
  siteId: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  isPublished: boolean;
}

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
  projectsBySite: Record<string, ProjectSummary[]>;
  standaloneSiteId: string | null;
}

export default function SitesListClient({ sites, projectsBySite, standaloneSiteId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sites' | 'standalone'>('sites');
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
          <span onClick={(e) => e.stopPropagation()}>
            <ToggleButton
              isActive={row.showAsProject}
              isPending={pendingId === `show-${row.id}`}
              ariaLabel={`Toggle show as project for ${getT(row)}`}
              onClick={() => {
                setPendingId(`show-${row.id}`);
                startTransition(async () => {
                  const result = await toggleSiteShowAsProject(row.id, row.showAsProject);
                  if (result.error) toast(result.error, 'error');
                  setPendingId(null);
                });
              }}
            />
          </span>
        ),
      },
      {
        key: 'featured',
        header: t.sites.featured,
        render: (row: SiteRow) => (
          <span onClick={(e) => e.stopPropagation()}>
            <ToggleButton
              isActive={row.featured}
              isPending={pendingId === `feat-${row.id}`}
              ariaLabel={`Toggle featured for ${getT(row)}`}
              onClick={() => {
                setPendingId(`feat-${row.id}`);
                startTransition(async () => {
                  const result = await toggleSiteFeatured(row.id, row.featured);
                  if (result.error) toast(result.error, 'error');
                  setPendingId(null);
                });
              }}
            />
          </span>
        ),
      },
      {
        key: 'isPublished',
        header: t.sites.published,
        render: (row: SiteRow) => (
          <span onClick={(e) => e.stopPropagation()}>
            <ToggleButton
              isActive={row.isPublished}
              isPending={pendingId === `pub-${row.id}`}
              ariaLabel={`Toggle published for ${getT(row)}`}
              onClick={() => {
                setPendingId(`pub-${row.id}`);
                startTransition(async () => {
                  const result = await toggleSitePublished(row.id, row.isPublished);
                  if (result.error) toast(result.error, 'error');
                  setPendingId(null);
                });
              }}
            />
          </span>
        ),
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps -- toast is stable (useCallback with [] deps)
  }, [locale, t, pendingId, projectsBySite]);

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
      p.slug.toLowerCase().includes(query) ||
      p.serviceType.toLowerCase().includes(query)
    );
  }, [projectsBySite]);

  // Standalone projects: all projects from sites NOT shown as whole-house
  const standaloneProjects = useMemo<StandaloneProjectRow[]>(() => {
    const nonWholeSiteIds = new Set(sites.filter((s) => !s.showAsProject).map((s) => s.id));
    const rows: StandaloneProjectRow[] = [];
    for (const [siteId, projects] of Object.entries(projectsBySite)) {
      if (!nonWholeSiteIds.has(siteId)) continue;
      for (const p of projects) {
        rows.push({
          id: p.id,
          slug: p.slug,
          siteId: p.siteId,
          titleEn: p.titleEn,
          titleZh: p.titleZh,
          serviceType: p.serviceType,
          isPublished: p.isPublished,
        });
      }
    }
    return rows;
  }, [sites, projectsBySite]);

  const standaloneColumns: Column<StandaloneProjectRow>[] = useMemo(() => [
    { key: locale === 'zh' ? 'titleZh' : 'titleEn', header: locale === 'zh' ? t.projects.titleZh : t.projects.titleEn, sortable: true },
    { key: 'slug', header: t.projects.slug, sortable: true },
    {
      key: 'serviceType',
      header: t.projects.serviceType,
      sortable: true,
      render: (row: StandaloneProjectRow) => {
        const label = row.serviceType in t.projects.serviceTypes
          ? t.projects.serviceTypes[row.serviceType as keyof typeof t.projects.serviceTypes]
          : row.serviceType;
        return <span style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>{label}</span>;
      },
    },
    {
      key: 'isPublished',
      header: t.sites.published,
      render: (row: StandaloneProjectRow) => (
        <span style={{ color: row.isPublished ? SUCCESS : ERROR, fontSize: '0.8125rem' }}>
          {row.isPublished ? t.common.yes : t.common.no}
        </span>
      ),
    },
  ], [locale, t]);

  const filterStandaloneRow = useCallback((row: StandaloneProjectRow, query: string) => {
    return [row.titleEn, row.titleZh, row.slug, row.serviceType]
      .some((val) => val.toLowerCase().includes(query));
  }, []);

  const renderExpandedRow = useCallback((row: SiteRow) => {
    const siteProjects = projectsBySite[row.id] ?? [];
    if (siteProjects.length === 0) {
      return (
        <div style={{ padding: '1rem 1.5rem', color: TEXT_MUTED, fontSize: '0.8125rem' }}>
          {t.sites.noProjects}
        </div>
      );
    }

    const thStyle: React.CSSProperties = { padding: '0.375rem 0.5rem', color: TEXT_MID, fontWeight: 500, fontSize: '0.75rem', textAlign: 'left', borderBottom: '1px solid rgba(27,54,93,0.1)' };
    return (
      <div style={{ padding: '0.5rem 1.5rem 0.75rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th style={thStyle}>{locale === 'zh' ? t.projects.titleZh : t.projects.titleEn}</th>
              <th style={thStyle}>{t.projects.slug}</th>
              <th style={thStyle}>{t.projects.serviceType}</th>
              <th style={thStyle}>{t.sites.published}</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>{t.common.actions}</th>
            </tr>
          </thead>
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
                    {project.slug}
                  </td>
                  <td style={{ padding: '0.5rem', color: TEXT_MID }}>
                    {serviceLabel}
                  </td>
                  <td style={{ padding: '0.5rem', color: project.isPublished ? SUCCESS : ERROR }}>
                    {project.isPublished ? t.common.yes : t.common.no}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <Link
                      href={`/admin/sites/${row.id}?project=${project.id}`}
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

  const tabBaseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  };
  const activeTabStyle: React.CSSProperties = { ...tabBaseStyle, color: NAVY, backgroundColor: CARD, borderBottom: `2px solid ${GOLD}` };
  const inactiveTabStyle: React.CSSProperties = { ...tabBaseStyle, color: TEXT_MID, backgroundColor: 'transparent', borderBottom: '2px solid transparent' };

  return (
    <>
      {/* Page Header */}
      <AdminPageHeader
        titleKey="sites.title"
        actions={[
          ...(standaloneSiteId
            ? [{ labelKey: 'sites.newStandaloneProject', href: `/admin/sites/${standaloneSiteId}?new`, color: NAVY }]
            : []),
          { labelKey: 'sites.newSite', href: '/admin/sites/new' },
        ]}
      />

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid rgba(27,54,93,0.1)' }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sites'}
          aria-controls="tabpanel-sites"
          onClick={() => setActiveTab('sites')}
          style={activeTab === 'sites' ? activeTabStyle : inactiveTabStyle}
        >
          {t.sites.tabSites}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'standalone'}
          aria-controls="tabpanel-standalone"
          onClick={() => setActiveTab('standalone')}
          style={activeTab === 'standalone' ? activeTabStyle : inactiveTabStyle}
        >
          {t.sites.tabStandalone}
          <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: TEXT_MUTED }}>
            ({standaloneProjects.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Sites with expandable project rows */}
      {activeTab === 'sites' && (
        <div id="tabpanel-sites" role="tabpanel">
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
        </div>
      )}

      {/* Tab 2: Flat list of standalone projects (parent site not shown as whole house) */}
      {activeTab === 'standalone' && (
        <div id="tabpanel-standalone" role="tabpanel">
          <DataTable
            columns={standaloneColumns}
            data={standaloneProjects}
            getRowKey={(row) => row.id}
            filterRow={filterStandaloneRow}
            actions={(row) => (
              <Link
                href={`/admin/sites/${row.siteId}?project=${row.id}`}
                style={{ color: GOLD, fontSize: '0.8125rem', textDecoration: 'none' }}
              >
                {t.common.edit}
              </Link>
            )}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t.sites.deleteSite}
        message={t.sites.deleteMessage}
        items={deleteId ? (projectsBySite[deleteId] ?? []).map((p) => locale === 'zh' ? p.titleZh : p.titleEn) : []}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isPending}
      />
    </>
  );
}
