import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projectSites, siteImages, siteImagePairs, type DbSite, type DbSiteImage, type DbSiteImagePair } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SiteDetailClient, { mapDbImagePairToForm } from './SiteDetailClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getAllServiceAreasAdmin, getProjectsWithDetailsBySite } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSitePage({ params }: PageProps) {
  const { id } = await params;

  const [rows, serviceAreas, projectsWithDetails, siteImageRows, siteImagePairRows] = await Promise.all([
    db.select().from(projectSites).where(eq(projectSites.id, id)).limit(1) as Promise<DbSite[]>,
    getAllServiceAreasAdmin(),
    getProjectsWithDetailsBySite(id),
    db.select().from(siteImages).where(eq(siteImages.siteId, id)).orderBy(siteImages.displayOrder) as Promise<DbSiteImage[]>,
    db.select().from(siteImagePairs).where(eq(siteImagePairs.siteId, id)).orderBy(siteImagePairs.displayOrder) as Promise<DbSiteImagePair[]>,
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
    images: siteImageRows.map((img) => ({
      url: img.imageUrl,
      altEn: img.altTextEn ?? '',
      altZh: img.altTextZh ?? '',
      isBefore: img.isBefore,
    })),
    imagePairs: siteImagePairRows.map(mapDbImagePairToForm),
  };

  return (
    <div>
      <AdminPageHeader titleKey="sites.editSite" viewHref={`/en/projects/${site.slug}`} />
      <SiteDetailClient site={siteData} projects={projectsWithDetails} cities={cities} />
    </div>
  );
}
