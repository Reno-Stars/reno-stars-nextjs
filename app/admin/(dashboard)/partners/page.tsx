import { getAllPartnersAdmin } from '@/lib/db/queries';
import PartnersListClient from './PartnersListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function PartnersAdminPage() {
  const partners = await getAllPartnersAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="partners.title" actionKey="partners.addPartner" actionHref="/admin/partners/new" />
      <PartnersListClient partners={partners} />
    </div>
  );
}
