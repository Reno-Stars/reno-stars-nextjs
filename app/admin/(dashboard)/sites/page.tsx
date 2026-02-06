import { getAllSitesAdmin } from '@/lib/db/queries';
import SitesListClient from './SitesListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function SitesAdminPage() {
  const sites = await getAllSitesAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="sites.title" actionKey="sites.newSite" actionHref="/admin/sites/new" />
      <SitesListClient sites={sites} />
    </div>
  );
}
