import ServiceForm from '../ServiceForm';
import { createService } from '@/app/actions/admin/services';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewServicePage() {
  return (
    <div>
      <AdminPageHeader titleKey="services.addNewService" backHref="/admin/services" backLabelKey="nav.services" />
      <ServiceForm action={createService} isNew />
    </div>
  );
}
