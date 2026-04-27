import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Service } from '@/lib/types';
import { pickLocale } from '@/lib/utils';
import { GOLD_PALE, GOLD_ICON_FILTER, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

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
    <section id="services" aria-labelledby="services-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 id="services-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            return (
              <Link key={service.slug} href={`/services/${service.slug}`}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group block"
                style={{ boxShadow: neu(5), backgroundColor: CARD }}
              >
                <div className="flex items-start gap-4">
                  {service.icon && (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={service.icon} alt="" className="w-5 h-5" style={{ filter: GOLD_ICON_FILTER }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-bold mb-1 transition-colors" style={{ color: TEXT }}>{pickLocale(service.title, locale)}</h3>
                    <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>{pickLocale(service.description, locale)}</p>
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
