import { getAllTrustBadgesAdmin } from '@/lib/db/queries';
import TrustBadgesListClient from './TrustBadgesListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function TrustBadgesAdminPage() {
  const badges = await getAllTrustBadgesAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="trustBadges.title" />
      <TrustBadgesListClient badges={badges} />
    </div>
  );
}
