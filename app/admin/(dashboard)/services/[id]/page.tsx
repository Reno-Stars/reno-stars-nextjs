import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  const service = rows[0];
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader titleKey="services.editService" />
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
          iconName: service.iconName,
          imageUrl: service.imageUrl,
          displayOrder: service.displayOrder,
        }}
      />
    </div>
  );
}
