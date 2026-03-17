import GalleryItemForm from '../GalleryItemForm';
import { createGalleryItem } from '@/app/actions/admin/gallery';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getGalleryCategoryOptions } from '@/lib/admin/gallery-categories';

export default async function NewGalleryItemPage() {
  const categoryOptions = await getGalleryCategoryOptions();

  return (
    <div>
      <AdminPageHeader titleKey="gallery.addGalleryItem" backHref="/admin/gallery" backLabelKey="nav.gallery" />
      <GalleryItemForm action={createGalleryItem} categoryOptions={categoryOptions} isNew />
    </div>
  );
}
