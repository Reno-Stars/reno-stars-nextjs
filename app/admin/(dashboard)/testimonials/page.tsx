import { getAllTestimonialsAdmin } from '@/lib/db/queries';
import TestimonialsListClient from './TestimonialsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function TestimonialsAdminPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="testimonials.title" actionKey="testimonials.newTestimonial" actionHref="/admin/testimonials/new" />
      <TestimonialsListClient testimonials={testimonials} />
    </div>
  );
}
