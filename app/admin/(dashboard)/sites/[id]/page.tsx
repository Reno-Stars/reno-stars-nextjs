import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projectSites, siteImagePairs, siteExternalProducts, type DbSite, type DbSiteImagePair, type DbSiteExternalProduct } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SiteDetailClient from './SiteDetailClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getAllServiceAreasAdmin, getProjectsWithDetailsBySite } from '@/lib/db/queries';
import { mapDbImagePairToForm } from '@/lib/admin/form-utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSitePage({ params }: PageProps) {
  const { id } = await params;

  const [rows, serviceAreas, projectsWithDetails, siteImagePairRows, siteEpRows, allSiteRows] = await Promise.all([
    db.select().from(projectSites).where(eq(projectSites.id, id)).limit(1) as Promise<DbSite[]>,
    getAllServiceAreasAdmin(),
    getProjectsWithDetailsBySite(id),
    db.select().from(siteImagePairs).where(eq(siteImagePairs.siteId, id)).orderBy(siteImagePairs.displayOrder) as Promise<DbSiteImagePair[]>,
    db.select().from(siteExternalProducts).where(eq(siteExternalProducts.siteId, id)).orderBy(siteExternalProducts.displayOrder) as Promise<DbSiteExternalProduct[]>,
    db.select({ id: projectSites.id, titleEn: projectSites.titleEn, titleZh: projectSites.titleZh, poNumber: projectSites.poNumber }).from(projectSites),
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
    budgetRange: site.budgetRange ?? '',
    durationEn: site.durationEn ?? '',
    durationZh: site.durationZh ?? '',
    spaceTypeEn: site.spaceTypeEn ?? '',
    badgeEn: site.badgeEn ?? '',
    badgeZh: site.badgeZh ?? '',
    poNumber: site.poNumber ?? '',
    excerptEn: site.excerptEn ?? '',
    excerptZh: site.excerptZh ?? '',
    metaTitleEn: site.metaTitleEn ?? '',
    metaTitleZh: site.metaTitleZh ?? '',
    metaDescriptionEn: site.metaDescriptionEn ?? '',
    metaDescriptionZh: site.metaDescriptionZh ?? '',
    focusKeywordEn: site.focusKeywordEn ?? '',
    focusKeywordZh: site.focusKeywordZh ?? '',
    seoKeywordsEn: site.seoKeywordsEn ?? '',
    seoKeywordsZh: site.seoKeywordsZh ?? '',
    showAsProject: site.showAsProject,
    featured: site.featured,
    isPublished: site.isPublished,
    imagePairs: siteImagePairRows.map(mapDbImagePairToForm),
    externalProducts: siteEpRows.map((ep) => ({
      url: ep.url,
      imageUrl: ep.imageUrl ?? '',
      labelEn: ep.labelEn,
      labelZh: ep.labelZh,
    })),
  };

  return (
    <div>
      <AdminPageHeader titleKey="sites.editSite" viewHref={`/en/projects/${site.slug}`} />
      <SiteDetailClient site={siteData} projects={projectsWithDetails} cities={cities} allSites={allSiteRows} />
    </div>
  );
}
