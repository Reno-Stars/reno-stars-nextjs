import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { serviceAreas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import ServiceAreaForm from '../ServiceAreaForm';
import { updateServiceArea } from '@/app/actions/admin/service-areas';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServiceAreaPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(serviceAreas).where(eq(serviceAreas.id, id)).limit(1);
  const area = rows[0];
  if (!area) notFound();

  const boundAction = updateServiceArea.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="serviceAreas.editServiceArea" backHref="/admin/service-areas" backLabelKey="nav.serviceAreas" />
      <ServiceAreaForm
        action={boundAction}
        initialData={{
          slug: area.slug,
          nameEn: area.nameEn,
          nameZh: area.nameZh,
          descriptionEn: area.descriptionEn ?? '',
          descriptionZh: area.descriptionZh ?? '',
          contentEn: area.contentEn ?? '',
          contentZh: area.contentZh ?? '',
          highlightsEn: area.highlightsEn ?? '',
          highlightsZh: area.highlightsZh ?? '',
          metaTitleEn: area.metaTitleEn ?? '',
          metaTitleZh: area.metaTitleZh ?? '',
          metaDescriptionEn: area.metaDescriptionEn ?? '',
          metaDescriptionZh: area.metaDescriptionZh ?? '',
          displayOrder: area.displayOrder,
          isActive: area.isActive,
          localizations: (area.localizations ?? null) as Record<string, string> | null,
        }}
      />
    </div>
  );
}
