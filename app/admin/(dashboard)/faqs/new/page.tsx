import FaqForm from '../FaqForm';
import { createFaq } from '@/app/actions/admin/faqs';
import { NAVY } from '@/lib/theme';

export default function NewFaqPage() {
  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Add New FAQ
      </h1>
      <FaqForm action={createFaq} isNew />
    </div>
  );
}
