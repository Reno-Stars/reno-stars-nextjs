import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projects, projectImages, projectScopes, houses, type DbProject, type DbProjectImage, type DbProjectScope } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import EditProjectClient from './EditProjectClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const rows: DbProject[] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = rows[0];
  if (!project) notFound();

  const [images, scopes, houseRows] = await Promise.all([
    db.select().from(projectImages).where(eq(projectImages.projectId, id)).orderBy(projectImages.displayOrder) as Promise<DbProjectImage[]>,
    db.select().from(projectScopes).where(eq(projectScopes.projectId, id)).orderBy(projectScopes.displayOrder) as Promise<DbProjectScope[]>,
    // Fetch houses for house selection
    db.select({
      id: houses.id,
      titleEn: houses.titleEn,
      titleZh: houses.titleZh,
    }).from(houses),
  ]);

  const initialData = {
    id: project.id,
    slug: project.slug,
    titleEn: project.titleEn,
    titleZh: project.titleZh,
    descriptionEn: project.descriptionEn,
    descriptionZh: project.descriptionZh,
    serviceType: project.serviceType,
    categoryEn: project.categoryEn ?? '',
    categoryZh: project.categoryZh ?? '',
    locationCity: project.locationCity ?? '',
    budgetRange: project.budgetRange ?? '',
    durationEn: project.durationEn ?? '',
    durationZh: project.durationZh ?? '',
    spaceTypeEn: project.spaceTypeEn ?? '',
    spaceTypeZh: project.spaceTypeZh ?? '',
    heroImageUrl: project.heroImageUrl ?? '',
    challengeEn: project.challengeEn ?? '',
    challengeZh: project.challengeZh ?? '',
    solutionEn: project.solutionEn ?? '',
    solutionZh: project.solutionZh ?? '',
    badgeEn: project.badgeEn ?? '',
    badgeZh: project.badgeZh ?? '',
    featured: project.featured,
    isPublished: project.isPublished,
    houseId: project.houseId,
    displayOrderInHouse: project.displayOrderInHouse,
    images: images.map((img: DbProjectImage) => ({
      url: img.imageUrl,
      altEn: img.altTextEn ?? '',
      altZh: img.altTextZh ?? '',
      isBefore: img.isBefore,
    })),
    scopes: scopes.map((s: DbProjectScope) => ({
      en: s.scopeEn,
      zh: s.scopeZh,
    })),
  };

  return (
    <div>
      <AdminPageHeader titleKey="projects.editProject" />
      <EditProjectClient
        id={id}
        initialData={initialData}
        houses={houseRows}
      />
    </div>
  );
}
