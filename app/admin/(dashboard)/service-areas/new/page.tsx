import ServiceAreaForm from '../ServiceAreaForm';
import { createServiceArea } from '@/app/actions/admin/service-areas';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewServiceAreaPage() {
  return (
    <div>
      <AdminPageHeader titleKey="serviceAreas.addNewServiceArea" backHref="/admin/service-areas" backLabelKey="nav.serviceAreas" />
      <ServiceAreaForm action={createServiceArea} isNew />
    </div>
  );
}
