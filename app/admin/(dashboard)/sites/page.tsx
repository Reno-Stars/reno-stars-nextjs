import { getAllSitesAdmin, getAllProjectsBySiteAdmin } from '@/lib/db/queries';
import SitesListClient from './SitesListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function SitesAdminPage() {
  const [sites, projectsBySite] = await Promise.all([
    getAllSitesAdmin(),
    getAllProjectsBySiteAdmin(),
  ]);

  return (
    <div>
      <AdminPageHeader titleKey="sites.title" actionKey="sites.newSite" actionHref="/admin/sites/new" />
      <SitesListClient sites={sites} projectsBySite={projectsBySite} />
    </div>
  );
}
