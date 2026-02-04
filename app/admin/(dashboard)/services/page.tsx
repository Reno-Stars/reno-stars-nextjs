import { getAllServicesAdmin } from '@/lib/db/queries';
import ServicesListClient from './ServicesListClient';
import { NAVY } from '@/lib/theme';

export default async function ServicesAdminPage() {
  const services = await getAllServicesAdmin();

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Services
      </h1>
      <ServicesListClient services={services} />
    </div>
  );
}
