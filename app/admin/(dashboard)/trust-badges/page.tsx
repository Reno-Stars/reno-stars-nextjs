import { getAllTrustBadgesAdmin } from '@/lib/db/queries';
import TrustBadgesListClient from './TrustBadgesListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function TrustBadgesAdminPage() {
  const badges = await getAllTrustBadgesAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="trustBadges.title" actionKey="trustBadges.addTrustBadge" actionHref="/admin/trust-badges/new" />
      <TrustBadgesListClient badges={badges} />
    </div>
  );
}
