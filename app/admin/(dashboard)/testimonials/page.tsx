import Link from 'next/link';
import { getAllTestimonialsAdmin } from '@/lib/db/queries';
import TestimonialsListClient from './TestimonialsListClient';
import { NAVY, GOLD } from '@/lib/theme';

export default async function TestimonialsAdminPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>Testimonials</h1>
        <Link
          href="/admin/testimonials/new"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: GOLD,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          New Testimonial
        </Link>
      </div>
      <TestimonialsListClient testimonials={testimonials} />
    </div>
  );
}
