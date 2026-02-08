import { getAllServiceAreasAdmin } from '@/lib/db/queries';
import ServiceAreasListClient from './ServiceAreasListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ServiceAreasAdminPage() {
  const areas = await getAllServiceAreasAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="serviceAreas.title" actionKey="serviceAreas.addServiceArea" actionHref="/admin/service-areas/new" />
      <ServiceAreasListClient areas={areas} />
    </div>
  );
}
