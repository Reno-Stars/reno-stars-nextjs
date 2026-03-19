import { getAllDesignsAdmin } from '@/lib/db/queries';
import DesignsListClient from './DesignsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function DesignsAdminPage() {
  const items = await getAllDesignsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="designs.title" />
      <DesignsListClient items={items} />
    </div>
  );
}
