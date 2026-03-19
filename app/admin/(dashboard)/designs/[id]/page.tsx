import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { designs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import DesignEditClient from './DesignEditClient';
import { updateDesignItem } from '@/app/actions/admin/designs';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDesignItemPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const rows = await db.select().from(designs).where(eq(designs.id, id)).limit(1);
  const item = rows[0];
  if (!item) notFound();

  const boundAction = updateDesignItem.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="designs.editDesignItem" backHref="/admin/designs" backLabelKey="nav.designs" />
      <DesignEditClient
        id={id}
        action={boundAction}
        initialData={{
          imageUrl: item.imageUrl,
          titleEn: item.titleEn ?? '',
          titleZh: item.titleZh ?? '',
          displayOrder: item.displayOrder,
          isPublished: item.isPublished,
        }}
      />
    </div>
  );
}
