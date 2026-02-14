import { getAllSitesAdmin, getAllProjectsBySiteAdmin } from '@/lib/db/queries';
import { STANDALONE_SITE_SLUG } from '@/lib/admin/constants';
import SitesListClient from './SitesListClient';

export default async function SitesAdminPage() {
  const [sites, projectsBySite] = await Promise.all([
    getAllSitesAdmin(),
    getAllProjectsBySiteAdmin(),
  ]);

  // Find the standalone projects container site for the "New Standalone Project" button
  const standaloneSite = sites.find((s) => s.slug === STANDALONE_SITE_SLUG);

  return (
    <SitesListClient
      sites={sites}
      projectsBySite={projectsBySite}
      standaloneSiteId={standaloneSite?.id ?? null}
    />
  );
}
