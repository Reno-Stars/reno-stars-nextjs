import { getAllServiceAreasAdmin } from '@/lib/db/queries';
import ServiceAreasListClient from './ServiceAreasListClient';
import { NAVY } from '@/lib/theme';

export default async function ServiceAreasAdminPage() {
  const areas = await getAllServiceAreasAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Service Areas</h1>
      </div>
      <ServiceAreasListClient areas={areas} />
    </div>
  );
}
