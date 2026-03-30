import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { services, serviceTags, serviceBenefits } from '@/lib/db/schema';
import type { DbServiceTag, DbServiceBenefit } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import ServiceForm from '../ServiceForm';
import { updateService } from '@/app/actions/admin/services';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const [serviceRows, tagRows, benefitRows] = await Promise.all([
    db.select().from(services).where(eq(services.id, id)).limit(1),
    db.select().from(serviceTags).where(eq(serviceTags.serviceId, id)).orderBy(asc(serviceTags.displayOrder)),
    db.select().from(serviceBenefits).where(eq(serviceBenefits.serviceId, id)).orderBy(asc(serviceBenefits.displayOrder)),
  ]);
  const service = serviceRows[0];
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader titleKey="services.editService" backHref="/admin/services" backLabelKey="nav.services" />
      <ServiceForm
        action={updateService.bind(null, service.id)}
        initialData={{
          slug: service.slug,
          titleEn: service.titleEn,
          titleZh: service.titleZh,
          descriptionEn: service.descriptionEn,
          descriptionZh: service.descriptionZh,
          longDescriptionEn: service.longDescriptionEn,
          longDescriptionZh: service.longDescriptionZh,
          iconUrl: service.iconUrl,
          imageUrl: service.imageUrl,
          displayOrder: service.displayOrder,
          showOnServicesPage: service.showOnServicesPage,
          isProjectType: service.isProjectType,
          tags: tagRows.map((t: DbServiceTag) => ({ id: t.id, en: t.tagEn, zh: t.tagZh })),
          benefits: benefitRows.map((b: DbServiceBenefit) => ({ id: b.id, en: b.benefitEn, zh: b.benefitZh })),
        }}
      />
    </div>
  );
}
