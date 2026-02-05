'use client';

import { Hammer, Bath, Home, ArrowDown, Paintbrush, Building2, type LucideIcon } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Service } from '@/lib/types';
import { GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

const serviceIcons: Record<string, LucideIcon> = {
  kitchen: Hammer,
  bathroom: Bath,
  'whole-house': Home,
  basement: ArrowDown,
  painting: Paintbrush,
  commercial: Building2,
};

interface ServicesSectionProps {
  services: Service[];
  locale: Locale;
  translations: {
    title: string;
    subtitle: string;
  };
}

export default function ServicesSection({ services, locale, translations: t }: ServicesSectionProps) {
  return (
    <section id="services" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const Icon = serviceIcons[service.slug] || Hammer;
            return (
              <Link key={service.slug} href={`/services/${service.slug}`}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group block"
                style={{ boxShadow: neu(5), backgroundColor: CARD }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: GOLD_PALE }}
                  >
                    <Icon className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold mb-1 transition-colors" style={{ color: TEXT }}>{service.title[locale]}</h3>
                    <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>{service.description[locale]}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
