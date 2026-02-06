import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projectSites, type DbSite } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SiteDetailClient from './SiteDetailClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getAllServiceAreasAdmin, getProjectsWithDetailsBySite } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSitePage({ params }: PageProps) {
  const { id } = await params;

  const [rows, serviceAreas, projectsWithDetails] = await Promise.all([
    db.select().from(projectSites).where(eq(projectSites.id, id)).limit(1) as Promise<DbSite[]>,
    getAllServiceAreasAdmin(),
    getProjectsWithDetailsBySite(id),
  ]);

  const site = rows[0];
  if (!site) notFound();

  const cities = serviceAreas.map((area) => ({
    nameEn: area.nameEn,
    nameZh: area.nameZh,
  }));

  const siteData = {
    id: site.id,
    slug: site.slug,
    titleEn: site.titleEn,
    titleZh: site.titleZh,
    descriptionEn: site.descriptionEn,
    descriptionZh: site.descriptionZh,
    locationCity: site.locationCity ?? '',
    heroImageUrl: site.heroImageUrl ?? '',
    badgeEn: site.badgeEn ?? '',
    badgeZh: site.badgeZh ?? '',
    showAsProject: site.showAsProject,
    featured: site.featured,
    isPublished: site.isPublished,
  };

  return (
    <div>
      <AdminPageHeader titleKey="sites.editSite" />
      <SiteDetailClient site={siteData} projects={projectsWithDetails} cities={cities} />
    </div>
  );
}
