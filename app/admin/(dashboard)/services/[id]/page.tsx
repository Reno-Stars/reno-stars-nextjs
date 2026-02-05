import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import ServiceEditForm from './ServiceEditForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
      <AdminPageHeader titleKey="services.editService" />
      <ServiceEditForm service={service} />
    </div>
  );
}
