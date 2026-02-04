import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import ServiceEditForm from './ServiceEditForm';
import { NAVY } from '@/lib/theme';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  const service = rows[0];
  if (!service) notFound();

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Service: {service.slug}
      </h1>
      <ServiceEditForm service={service} />
    </div>
  );
}
