import { getAllTrustBadgesAdmin } from '@/lib/db/queries';
import TrustBadgesListClient from './TrustBadgesListClient';
import { NAVY } from '@/lib/theme';

export default async function TrustBadgesAdminPage() {
  const badges = await getAllTrustBadgesAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Trust Badges</h1>
      </div>
      <TrustBadgesListClient badges={badges} />
    </div>
  );
}
