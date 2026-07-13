'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { LocalizedService } from '@/lib/types';
import { NAVY, GOLD, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface AreaServiceCityLinksProps {
  /** Localized services to link — the SAME list the sibling card grid renders. */
  services: LocalizedService[];
  /** Localized city display name, e.g. "Burnaby". */
  cityName: string;
  /** City slug used to build the combo href, e.g. "burnaby". */
  citySlug: string;
}

/**
 * Hub → spoke internal-link band on the area page. Renders one keyword-rich
 * link per service to its /services/{service}/{city} combo page, e.g.
 * "Kitchen Renovation in Burnaby →".
 *
 * ADDITIVE — sits alongside the existing "Our Services in {area}" card grid and
 * does not replace it. Purpose: (a) give visitors a direct, exact-match path to
 * each service×city spoke, and (b) pass body-content link equity + exact-match
 * anchor text ("{service} in {city}") toward the spokes so they can hold rank
 * for "{service} {city}" queries.
 *
 * Every link targets a combo page that EXISTS: the parent passes the same
 * `services` list the sibling card grid links, and every service row in the DB
 * has show_on_services_page = true, so the [service-slug]/[city] route resolves
 * (it only 404s when show_on_services_page === false). Anchor text reuses the
 * existing `areas.serviceInArea` i18n key (localized in all 14 locales); the
 * heading/subtitle use `areas.renovationServicesIn(Subtitle)`.
 */
export default function AreaServiceCityLinks({ services, cityName, citySlug }: AreaServiceCityLinksProps) {
  const t = useTranslations('areas');
  if (services.length === 0) return null;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>
          {t('renovationServicesIn', { city: cityName })}
        </h2>
        <p className="text-sm mb-6 max-w-3xl" style={{ color: TEXT_MID }}>
          {t('renovationServicesInSubtitle', { city: cityName })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}/${citySlug}`}
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md group"
              style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
            >
              <span>{t('serviceInArea', { service: service.title, area: cityName })}</span>
              <ArrowRight
                className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: GOLD }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
