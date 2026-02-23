import FaqForm from '../FaqForm';
import { createFaq } from '@/app/actions/admin/faqs';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewFaqPage() {
  return (
    <div>
      <AdminPageHeader titleKey="faqs.addNewFaq" backHref="/admin/faqs" backLabelKey="nav.faqs" />
      <FaqForm action={createFaq} isNew />
    </div>
  );
}
