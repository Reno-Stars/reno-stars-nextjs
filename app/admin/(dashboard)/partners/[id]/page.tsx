import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { partners } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import PartnerEditClient from './PartnerEditClient';
import { updatePartner } from '@/app/actions/admin/partners';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  const partner = rows[0];
  if (!partner) notFound();

  const boundAction = updatePartner.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="partners.editPartner" />
      <PartnerEditClient
        id={id}
        action={boundAction}
        initialData={{
          nameEn: partner.nameEn,
          nameZh: partner.nameZh,
          logoUrl: partner.logoUrl,
          websiteUrl: partner.websiteUrl,
          displayOrder: partner.displayOrder,
          isActive: partner.isActive,
          isHiddenVisually: partner.isHiddenVisually,
        }}
      />
    </div>
  );
}
