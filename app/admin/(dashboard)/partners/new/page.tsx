import PartnerForm from '../PartnerForm';
import { createPartner } from '@/app/actions/admin/partners';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewPartnerPage() {
  return (
    <div>
      <AdminPageHeader titleKey="partners.addNewPartner" />
      <PartnerForm action={createPartner} isNew />
    </div>
  );
}
