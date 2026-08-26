'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  DollarSign, Clock, Home, ArrowRight,
  Ruler, Package, Wrench, Hammer,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { ShareContext } from '@/lib/share/types';
import CTASection from '@/components/CTASection';
import ShareBar from '@/components/share/ShareBar';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface KitchenCabinetGuidePageProps {
  locale: Locale;
  phone?: string;
  share: ShareContext;
}

export default function KitchenCabinetGuidePage({ locale, phone, share }: KitchenCabinetGuidePageProps) {
  const t = useTranslations('guides.kitchenCabinet');
  // Shared, already-translated guide link labels. Reused rather than adding a
  // second copy of "Cabinet Refinishing Cost" to this guide's own catalog.
  const tRelated = useTranslations('guides.relatedGuides');

  // Every key below MUST exist in messages/<locale>/guides/kitchenCabinet.json.
  // This page shipped in d4cfbb9e with a key set the catalog never had —
  // flatPackAssembly, raisedPanel, materials.laminate, laminateCountertop,
  // a whole `hardware` section and a whole `labourVsDiy` section — so it served
  // 44 raw key paths ("guides.kitchenCabinet.hardware.hinges.title") to real
  // visitors from the day it launched until 2026-08-26. The catalog was the
  // half that was right: it carries real prices, written once and translated
  // into all 14 locales. So the component was moved onto the catalog, not the
  // other way round — inventing cabinet prices to satisfy a key name is not an
  // option. scripts/ci/render-smoke.mjs now fails the build if this drifts.
  const stats = useMemo(() => ([
    { label: t('stats.avgCost'), value: t('stats.avgCostValue') },
    { label: t('stats.range'), value: t('stats.rangeValue') },
    { label: t('stats.linearFoot'), value: t('stats.linearFootValue') },
    { label: t('stats.timeline'), value: t('stats.timelineValue') },
  ]), [t]);

  const cabinetTypes = [
    { key: 'stock', accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT },
    { key: 'semiCustom', accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT },
    { key: 'custom', accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT },
  ];

  const doorStyles = [
    { key: 'shaker' },
    { key: 'slab' },
    { key: 'inset' },
    { key: 'raised' },
  ];

  const materials = [
    { key: 'thermofoil' },
    { key: 'solidWood' },
    { key: 'mdf' },
    { key: 'plywood' },
  ];

  const countertopCosts = [
    { key: 'laminate' },
    { key: 'quartz' },
    { key: 'granite' },
    { key: 'solidSurface' },
  ];

  const breakdownItems = [
    { key: 'cabinets' },
    { key: 'countertops' },
    { key: 'hardware' },
    { key: 'labour' },
    { key: 'misc' },
  ];

  const tips = ['tip1', 'tip2', 'tip3', 'tip4'] as const;

  return (
    <main>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg mb-8" style={{ color: TEXT_MID }}>
            {t('hero.subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="text-lg md:text-xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cabinet Types */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('cabinetTypes.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('cabinetTypes.subtitle')}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {cabinetTypes.map((ct) => (
              <div key={ct.key} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: ct.accentLight }}>
                  <Package size={20} style={{ color: ct.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{t(`cabinetTypes.${ct.key}.title`)}</h3>
                <div className="text-xl font-bold mb-3" style={{ color: GOLD }}>{t(`cabinetTypes.${ct.key}.price`)}</div>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`cabinetTypes.${ct.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Door Styles */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('doorStyles.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('doorStyles.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {doorStyles.map((ds) => (
              <div key={ds.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="flex-shrink-0 mt-1"><Home size={20} style={{ color: GOLD }} /></div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`doorStyles.${ds.key}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`doorStyles.${ds.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('materials.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('materials.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {materials.map((mat) => (
              <div key={mat.key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`materials.${mat.key}.title`)}</h3>
                <div className="text-sm font-semibold mb-1" style={{ color: GOLD }}>{t(`materials.${mat.key}.priceRange`)}</div>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`materials.${mat.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countertop Pairing */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('countertops.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('countertops.subtitle')}</p>
          <div className="space-y-3">
            {countertopCosts.map((ct) => (
              <div key={ct.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="flex-shrink-0 mt-1"><Ruler size={20} style={{ color: GOLD }} /></div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`countertops.${ct.key}.title`)}</h3>
                  <div className="text-sm font-semibold" style={{ color: GOLD }}>{t(`countertops.${ct.key}.priceRange`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full cost breakdown */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('breakdown.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('breakdown.subtitle')}</p>
          <div className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.key} className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD_PALE }}>
                  <Wrench size={20} style={{ color: GOLD }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`breakdown.${item.key}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`breakdown.${item.key}.description`)}</p>
                </div>
                <div className="text-base font-bold shrink-0 sm:text-right" style={{ color: GOLD }}>{t(`breakdown.${item.key}.range`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refinish or replace */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('vsReplace.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('vsReplace.subtitle')}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu() }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: STEP_TEAL_LIGHT }}>
                <Hammer size={20} style={{ color: STEP_TEAL }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{t('vsReplace.refinish.title')}</h3>
              <div className="text-lg font-bold mb-3" style={{ color: GOLD }}>{t('vsReplace.refinish.cost')}</div>
              <p className="text-sm flex gap-2 mb-2" style={{ color: TEXT_MID }}>
                <span style={{ color: STEP_TEAL }}>✓</span>{t('vsReplace.refinish.refinishPros')}
              </p>
              <p className="text-sm flex gap-2" style={{ color: TEXT_MID }}>
                <span style={{ color: STEP_ORANGE }}>!</span>{t('vsReplace.refinish.refinishCons')}
              </p>
            </div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu() }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: STEP_ORANGE_LIGHT }}>
                <Wrench size={20} style={{ color: STEP_ORANGE }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{t('vsReplace.replace.title')}</h3>
              <div className="text-lg font-bold mb-3" style={{ color: GOLD }}>{t('vsReplace.replace.cost')}</div>
              <p className="text-sm flex gap-2 mb-2" style={{ color: TEXT_MID }}>
                <span style={{ color: STEP_TEAL }}>✓</span>{t('vsReplace.replace.replacePros')}
              </p>
              <p className="text-sm flex gap-2" style={{ color: TEXT_MID }}>
                <span style={{ color: STEP_ORANGE }}>!</span>{t('vsReplace.replace.replaceCons')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>{t('tips.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tips.map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-2" style={{ color: TEXT }}>{t(`tips.${key}.title`)}</h3>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`tips.${key}.description`)}</p>
              </div>
            ))}
          </div>

          <ShareBar
            locale={locale}
            context={share}
            contentType="guide"
            itemId="kitchen-cabinet-renovation-cost-vancouver"
          />
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: TEXT }}>{t('related.title')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/guides/kitchen-renovation-cost-vancouver" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {t('related.kitchenGuide')} <ArrowRight size={14} />
            </Link>
            <Link href="/guides/cabinet-refinishing-cost-vancouver" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {tRelated('cabinetRefinishing')} <ArrowRight size={14} />
            </Link>
            <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {t('related.allGuides')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>
            Frequently Asked Questions — Kitchen Cabinet Renovation Cost Vancouver
          </h2>
          <div className="space-y-4">
            {(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const).map((key) => (
              <details key={key} className="rounded-xl p-5 group" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center" style={{ color: TEXT }}>
                  {t(`faq.${key}`)}
                  <span className="ml-4 shrink-0 text-lg" style={{ color: GOLD }}>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`faq.a${key.slice(1)}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Links */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: TEXT_MID }}>
            <strong>Planning your kitchen renovation?</strong>{' '}
            <Link href="/blog/how-to-choose-renovation-contractor-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>How to Choose a Contractor</Link>
            {' · '}
            <Link href="/blog/renovation-timeline-how-long-does-each-project-take" className="underline hover:no-underline" style={{ color: GOLD }}>Renovation Timeline</Link>
            {' · '}
            <Link href="/guides/kitchen-renovation-cost-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>Full Kitchen Cost Guide</Link>
            {' · '}
            <Link href="/guides/cabinet-refinishing-cost-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>Cabinet Refinishing Guide</Link>
          </p>
        </div>
      </section>

      <CTASection heading={t('cta.heading')} subtitle={t('cta.subtitle')} phone={phone} />
    </main>
  );
}
