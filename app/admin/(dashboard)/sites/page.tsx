import { getAllSitesAdmin, getAllProjectsBySiteAdmin, ensureStandaloneSite } from '@/lib/db/queries';
import SitesListClient from './SitesListClient';

export default async function SitesAdminPage() {
  const [sites, projectsBySite, standaloneSiteId] = await Promise.all([
    getAllSitesAdmin(),
    getAllProjectsBySiteAdmin(),
    ensureStandaloneSite(),
  ]);

  return (
    <SitesListClient
      sites={sites}
      projectsBySite={projectsBySite}
      standaloneSiteId={standaloneSiteId}
    />
  );
}
