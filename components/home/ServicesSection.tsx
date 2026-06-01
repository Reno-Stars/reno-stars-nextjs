import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Service } from '@/lib/types';
import { pickLocale } from '@/lib/utils';
import { GOLD, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

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
                      <img src={service.icon} alt="" loading="lazy" decoding="async" fetchPriority="low" className="w-5 h-5" style={{ filter: GOLD_ICON_FILTER }} />
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
        {/* /workflow/ inbound CTA — kicks /workflow/ rollout to 3/5
            (siblings: AreaPage processLinkText baseline, ServiceDetailPage
            0e6a6e8). HomePage is the #1-indexed page on the site;
            pre-fix it had ZERO body-content references to /workflow/.
            Semantic fit: this section answers WHAT we do; the natural
            next question is HOW does it happen — exactly what /workflow/
            documents (7-step quote → handover process). Adding a single
            tagline-link below the services grid is the lowest-noise
            insertion (mirrors the AboutSection /about/ CTA e1b3193 and
            TestimonialsSection /reviews/ CTA 8503156 patterns on this
            same homepage). */}
        <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
          <Link
            href="/workflow"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            See our renovation process step-by-step →
          </Link>
        </p>
      </div>
    </section>
  );
}
