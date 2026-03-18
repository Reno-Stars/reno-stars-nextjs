import FaqForm from '../FaqForm';
import { createFaq } from '@/app/actions/admin/faqs';
import { getAllServiceAreasAdmin } from '@/lib/db/queries';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewFaqPage() {
  const areas = await getAllServiceAreasAdmin();
  const serviceAreas = areas.map((a) => ({ id: a.id, nameEn: a.nameEn, nameZh: a.nameZh }));

  return (
    <div>
      <AdminPageHeader titleKey="faqs.addNewFaq" backHref="/admin/faqs" backLabelKey="nav.faqs" />
      <FaqForm action={createFaq} serviceAreas={serviceAreas} isNew />
    </div>
  );
}
