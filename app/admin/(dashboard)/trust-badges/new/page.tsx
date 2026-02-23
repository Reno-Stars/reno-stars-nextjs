import TrustBadgeForm from '../TrustBadgeForm';
import { createTrustBadge } from '@/app/actions/admin/trust-badges';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewTrustBadgePage() {
  return (
    <div>
      <AdminPageHeader titleKey="trustBadges.addNewTrustBadge" backHref="/admin/trust-badges" backLabelKey="nav.trustBadges" />
      <TrustBadgeForm action={createTrustBadge} isNew />
    </div>
  );
}
