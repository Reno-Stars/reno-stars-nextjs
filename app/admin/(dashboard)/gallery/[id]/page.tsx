import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import GalleryItemForm from '../GalleryItemForm';
import { updateGalleryItem } from '@/app/actions/admin/gallery';
import { NAVY } from '@/lib/theme';

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
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Gallery Item
      </h1>
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
