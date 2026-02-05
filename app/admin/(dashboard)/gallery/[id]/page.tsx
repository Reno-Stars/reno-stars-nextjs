import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import GalleryItemForm from '../GalleryItemForm';
import { updateGalleryItem } from '@/app/actions/admin/gallery';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryItemPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);
  const item = rows[0];
  if (!item) notFound();

  const boundAction = updateGalleryItem.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="gallery.editGalleryItem" />
      <GalleryItemForm
        action={boundAction}
        initialData={{
          imageUrl: item.imageUrl,
          titleEn: item.titleEn ?? '',
          titleZh: item.titleZh ?? '',
          category: item.category,
          displayOrder: item.displayOrder,
          isPublished: item.isPublished,
        }}
      />
    </div>
  );
}
