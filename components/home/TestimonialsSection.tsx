'use client';

import { Star } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Testimonial } from '@/lib/types';
import { NAVY, GOLD, SURFACE, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  locale: Locale;
  translations: {
    title: string;
    subtitle: string;
  };
}

export default function TestimonialsSection({ testimonials, locale, translations: t }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="rounded-2xl p-5 relative" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
              <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
              <div className="pl-4">
                <div className="flex gap-0.5 mb-3" role="img" aria-label={`${testimonial.rating}/5`}>
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={`star-${j}`} className="w-3.5 h-3.5" aria-hidden="true" style={{ fill: GOLD, color: GOLD }} />
                  ))}
                </div>
                <p className="text-base leading-relaxed italic mb-4" style={{ color: TEXT_MID }}>&ldquo;{testimonial.text[locale]}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: NAVY }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: TEXT }}>{testimonial.name}</div>
                    <div className="text-sm" style={{ color: TEXT_MUTED }}>{testimonial.location}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
