import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { serviceAreas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import ServiceAreaForm from '../ServiceAreaForm';
import { updateServiceArea } from '@/app/actions/admin/service-areas';
import { NAVY } from '@/lib/theme';

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
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Service Area
      </h1>
      <ServiceAreaForm
        action={boundAction}
        initialData={{
          slug: area.slug,
          nameEn: area.nameEn,
          nameZh: area.nameZh,
          descriptionEn: area.descriptionEn ?? '',
          descriptionZh: area.descriptionZh ?? '',
          displayOrder: area.displayOrder,
          isActive: area.isActive,
        }}
      />
    </div>
  );
}
