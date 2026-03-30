'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { DollarSign, Bath, Home, ArrowDownToLine, Building2, Paintbrush, Landmark, ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT, STEP_GREEN, STEP_GREEN_LIGHT, STEP_RED, STEP_RED_LIGHT,
} from '@/lib/theme';

interface GuidesIndexPageProps {
  locale: Locale;
}

const GUIDES = [
  {
    slug: 'kitchen-renovation-cost-vancouver',
    icon: DollarSign,
    titleKey: 'guides.index.kitchen.title',
    descKey: 'guides.index.kitchen.description',
    accent: STEP_TEAL,
    accentLight: STEP_TEAL_LIGHT,
  },
  {
    slug: 'bathroom-renovation-cost-vancouver',
    icon: Bath,
    titleKey: 'guides.index.bathroom.title',
    descKey: 'guides.index.bathroom.description',
    accent: STEP_ORANGE,
    accentLight: STEP_ORANGE_LIGHT,
  },
  {
    slug: 'whole-house-renovation-cost-vancouver',
    icon: Home,
    titleKey: 'guides.index.wholeHouse.title',
    descKey: 'guides.index.wholeHouse.description',
    accent: NAVY,
    accentLight: '#E8EBF0',
  },
  {
    slug: 'basement-renovation-cost-vancouver',
    icon: ArrowDownToLine,
    titleKey: 'guides.index.basement.title',
    descKey: 'guides.index.basement.description',
    accent: STEP_GREEN,
    accentLight: STEP_GREEN_LIGHT,
  },
  {
    slug: 'commercial-renovation-cost-vancouver',
    icon: Building2,
    titleKey: 'guides.index.commercial.title',
    descKey: 'guides.index.commercial.description',
    accent: GOLD,
    accentLight: GOLD_PALE,
  },
  {
    slug: 'cabinet-refinishing-cost-vancouver',
    icon: Paintbrush,
    titleKey: 'guides.index.cabinet.title',
    descKey: 'guides.index.cabinet.description',
    accent: STEP_RED,
    accentLight: STEP_RED_LIGHT,
  },
  {
    slug: 'basement-suite-cost-vancouver',
    icon: Landmark,
    titleKey: 'guides.index.basementSuite.title',
    descKey: 'guides.index.basementSuite.description',
    accent: NAVY,
    accentLight: '#E8EBF0',
  },
];

export default function GuidesIndexPage({ locale: _locale }: GuidesIndexPageProps) {
  const t = useTranslations();

  return (
    <main>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
            {t('guides.index.hero.title')}
          </h1>
          <p className="text-lg" style={{ color: TEXT_MID }}>
            {t('guides.index.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            const card = (
              <div
                key={guide.slug}
                className="rounded-2xl p-6 transition-transform hover:scale-[1.02] h-full flex flex-col"
                style={{
                  backgroundColor: CARD,
                  ...neu,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: guide.accentLight }}
                >
                  <Icon size={24} style={{ color: guide.accent }} />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: TEXT }}>
                  {t(guide.titleKey)}
                </h2>
                <p className="text-sm mb-4 flex-1" style={{ color: TEXT_MID }}>
                  {t(guide.descKey)}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: GOLD }}>
                    {t('guides.index.readGuide')} <ArrowRight size={16} />
                  </span>
              </div>
            );

            return (
              <Link key={guide.slug} href={`/guides/${guide.slug}` as '/guides/kitchen-renovation-cost-vancouver'}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading={t('guides.index.cta.heading')}
        subtitle={t('guides.index.cta.subtitle')}
      />
    </main>
  );
}
