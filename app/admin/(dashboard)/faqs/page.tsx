import { getAllFaqsAdmin, getAllServiceAreasAdmin } from '@/lib/db/queries';
import FaqsListClient from './FaqsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function FaqsAdminPage() {
  const [faqs, areas] = await Promise.all([getAllFaqsAdmin(), getAllServiceAreasAdmin()]);
  const serviceAreas = areas.map((a) => ({ id: a.id, nameEn: a.nameEn, nameZh: a.nameZh }));

  return (
    <div>
      <AdminPageHeader titleKey="faqs.title" actionKey="faqs.addFaq" actionHref="/admin/faqs/new" />
      <FaqsListClient faqs={faqs} serviceAreas={serviceAreas} />
    </div>
  );
}
