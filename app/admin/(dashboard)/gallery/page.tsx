import { getAllGalleryItemsAdmin } from '@/lib/db/queries';
import GalleryListClient from './GalleryListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function GalleryAdminPage() {
  const items = await getAllGalleryItemsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="gallery.title" />
      <GalleryListClient items={items} />
    </div>
  );
}
