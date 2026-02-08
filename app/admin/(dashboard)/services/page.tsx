import { getAllServicesAdmin } from '@/lib/db/queries';
import ServicesListClient from './ServicesListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ServicesAdminPage() {
  const services = await getAllServicesAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="services.title" actionKey="services.addService" actionHref="/admin/services/new" />
      <ServicesListClient services={services} />
    </div>
  );
}
