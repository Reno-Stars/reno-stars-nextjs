import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import TestimonialForm from '../TestimonialForm';
import { updateTestimonial } from '@/app/actions/admin/testimonials';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: PageProps) {
  const { id } = await params;
  const rows = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  const testimonial = rows[0];
  if (!testimonial) notFound();

  const boundAction = updateTestimonial.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="testimonials.editTestimonial" />
      <TestimonialForm
        action={boundAction}
        submitLabel="Update Testimonial"
        initialData={{
          name: testimonial.name,
          textEn: testimonial.textEn,
          textZh: testimonial.textZh,
          rating: testimonial.rating,
          location: testimonial.location ?? '',
          isFeatured: testimonial.isFeatured,
          verified: testimonial.verified,
        }}
      />
    </div>
  );
}
