'use client';

import { useMemo } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import type { Company } from '@/lib/types';
import ContactForm from '@/components/ContactForm';
import { GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

interface ContactSectionProps {
  company: Company;
  areasText: string;
  translations: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    serviceAreas: string;
  };
}

export default function ContactSection({ company, areasText, translations: t }: ContactSectionProps) {
  const contactInfo = useMemo(() => [
    { icon: Phone, title: t.phone, value: company.phone, href: `tel:${company.phone}` },
    { icon: Mail, title: t.email, value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, title: t.serviceAreas, value: areasText },
  ], [company.phone, company.email, t.phone, t.email, t.serviceAreas, areasText]);

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h2 id="contact-title" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            {contactInfo.map((c) => (
              <div key={c.title} className="rounded-xl p-5 flex items-start gap-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD_PALE }}>
                  <c.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>{c.title}</div>
                  {c.href ? (
                    <a href={c.href} className="text-base font-medium cursor-pointer transition-colors hover:underline" style={{ color: TEXT }}>{c.value}</a>
                  ) : (
                    <p className="text-base" style={{ color: TEXT_MID }}>{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 lg:p-8 h-fit" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
            <ContactForm large />
          </div>
        </div>
      </div>
    </section>
  );
}
