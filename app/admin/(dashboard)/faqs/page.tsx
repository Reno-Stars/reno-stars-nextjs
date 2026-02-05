import { getAllFaqsAdmin } from '@/lib/db/queries';
import FaqsListClient from './FaqsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function FaqsAdminPage() {
  const faqs = await getAllFaqsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="faqs.title" actionKey="faqs.addFaq" actionHref="/admin/faqs/new" />
      <FaqsListClient faqs={faqs} />
    </div>
  );
}
