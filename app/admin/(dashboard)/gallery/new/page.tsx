import GalleryItemForm from '../GalleryItemForm';
import { createGalleryItem } from '@/app/actions/admin/gallery';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewGalleryItemPage() {
  return (
    <div>
      <AdminPageHeader titleKey="gallery.addGalleryItem" backHref="/admin/gallery" backLabelKey="nav.gallery" />
      <GalleryItemForm action={createGalleryItem} isNew />
    </div>
  );
}
