import TestimonialForm from '../TestimonialForm';
import { createTestimonial } from '@/app/actions/admin/testimonials';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminPageHeader titleKey="testimonials.newTestimonial" />
      <TestimonialForm action={createTestimonial} submitLabel="Create Testimonial" />
    </div>
  );
}
