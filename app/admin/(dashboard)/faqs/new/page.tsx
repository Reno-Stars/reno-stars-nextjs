import FaqForm from '../FaqForm';
import { createFaq } from '@/app/actions/admin/faqs';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewFaqPage() {
  return (
    <div>
      <AdminPageHeader titleKey="faqs.addNewFaq" />
      <FaqForm action={createFaq} isNew />
    </div>
  );
}
