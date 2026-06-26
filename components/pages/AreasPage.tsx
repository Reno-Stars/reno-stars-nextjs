'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import { getLocalizedArea } from '@/lib/data';
import type { Company, ServiceArea } from '@/lib/types';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface AreasPageProps {
  locale: Locale;
  areas: ServiceArea[];
  company: Company;
}

export default function AreasPage({ locale, areas, company }: AreasPageProps) {
  const t = useTranslations();

  const localizedAreas = useMemo(
    () => areas.map((area) => ({ ...getLocalizedArea(area, locale), slug: area.slug })),
    [areas, locale],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { label: t('areas.title') },
          ]} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('areas.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {t('areas.subtitle')}
          </p>
        </div>
      </section>

      {/* Area Cards */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{t('areas.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="rounded-xl p-6 group transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                  <h3 className="font-bold text-lg group-hover:text-gold transition-colors" style={{ color: TEXT }}>
                    {area.name}
                  </h3>
                </div>
                {area.description && (
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: TEXT_MID }}>
                    {area.description}
                  </p>
                )}
                <span className="text-sm font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                  {t('areas.viewProjects', { city: area.name })} <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2026-06-26: Planning guide cross-links. The /areas/ hub is a high-priority
          (0.8) page that Googlebot visits frequently. Linking to the 6 planning guide
          blog posts from here channels PageRank to those posts and gives users at the
          area-research stage a clear path to planning resources. */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <BookOpen size={18} style={{ color: GOLD }} />
            <h2 className="text-xl font-bold" style={{ color: TEXT }}>Renovation Planning Guides</h2>
          </div>
          <p className="text-center text-sm mb-6" style={{ color: TEXT_MID }}>
            Before you hire — read our free Metro Vancouver renovation guides.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'How to Choose a Contractor' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: '2026 Renovation Cost Guide' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: 'Renovation Timeline Guide' },
              { href: '/blog/renovation-permits-bc-guide', label: 'BC Renovation Permits Guide' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'Renovation Financing (HELOC)' },
              { href: '/blog/strata-renovation-rules-vancouver', label: 'Strata Renovation Rules BC' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href as '/blog/how-to-choose-renovation-contractor-vancouver'}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: CARD, boxShadow: neu(2) }}
              >
                <ChevronRight size={14} style={{ color: GOLD, flexShrink: 0 }} />
                <span className="text-sm font-semibold" style={{ color: TEXT }}>{label}</span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: TEXT_MUTED }}>
            All guides are free — no sign-up required.
          </p>
        </div>
      </section>

      <CTASection
        heading={t('cta.freeQuoteProject')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />
    </div>
  );
}
