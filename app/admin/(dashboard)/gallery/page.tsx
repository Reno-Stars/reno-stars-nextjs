import { getAllGalleryItemsAdmin } from '@/lib/db/queries';
import GalleryListClient from './GalleryListClient';
import { NAVY } from '@/lib/theme';

export default async function GalleryAdminPage() {
  const items = await getAllGalleryItemsAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Gallery</h1>
      </div>
      <GalleryListClient items={items} />
    </div>
  );
}
