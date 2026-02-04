import TestimonialForm from '../TestimonialForm';
import { createTestimonial } from '@/app/actions/admin/testimonials';
import { NAVY } from '@/lib/theme';

export default function NewTestimonialPage() {
  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        New Testimonial
      </h1>
      <TestimonialForm action={createTestimonial} submitLabel="Create Testimonial" />
    </div>
  );
}
