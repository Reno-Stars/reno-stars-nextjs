'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  ShieldCheck, HelpCircle, XCircle,
  ArrowRight, FileCheck, Users, Home, Zap, Droplets,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { ShareContext } from '@/lib/share/types';
import CTASection from '@/components/CTASection';
import ShareBar from '@/components/share/ShareBar';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT, STEP_RED, STEP_RED_LIGHT,
} from '@/lib/theme';

interface PermitGuidePageProps {
  locale: Locale;
  phone?: string;
  share: ShareContext;
}

export default function PermitGuidePage({ locale, phone, share }: PermitGuidePageProps) {
  const t = useTranslations('guides.permit');

  const stats = [
    { label: t('stats.buildingPermit'), value: t('stats.buildingPermitValue'), icon: Home },
    { label: t('stats.plumbingPermit'), value: t('stats.plumbingPermitValue'), icon: Droplets },
    { label: t('stats.electricalPermit'), value: t('stats.electricalPermitValue'), icon: Zap },
    { label: t('stats.demoPermit'), value: t('stats.demoPermitValue'), icon: ShieldCheck },
  ];

  const whenRequiredCols = [
    {
      key: 'always',
      icon: ShieldCheck,
      accent: STEP_RED,
      accentLight: STEP_RED_LIGHT,
      items: t.raw('whenRequired.always.items') as string[],
    },
    {
      key: 'sometimes',
      icon: HelpCircle,
      accent: STEP_ORANGE,
      accentLight: STEP_ORANGE_LIGHT,
      items: t.raw('whenRequired.sometimes.items') as string[],
    },
    {
      key: 'never',
      icon: XCircle,
      accent: STEP_GREEN,
      accentLight: STEP_GREEN_LIGHT,
      items: t.raw('whenRequired.never.items') as string[],
    },
  ];

  const municipalities = ['vancouver', 'burnaby', 'richmond', 'surrey', 'coquitlam'] as const;

  const processSteps = [
    { key: 'step1', icon: FileCheck },
    { key: 'step2', icon: Users },
    { key: 'step3', icon: Home },
    { key: 'step4', icon: ShieldCheck },
    { key: 'step5', icon: Zap },
    { key: 'step6', icon: FileCheck },
  ];

  const costs = [
    { key: 'kitchen' },
    { key: 'bathroom' },
    { key: 'basementSuite' },
    { key: 'deck' },
    { key: 'addition' },
  ];

  const consequenceItems = t.raw('consequences.items') as Array<{ title: string; description: string }>;
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
            {t('hero.description')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: GOLD_PALE }}>
                    <Icon size={16} style={{ color: GOLD }} />
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: GOLD }}>{stat.label}</div>
                  <div className="text-xs" style={{ color: TEXT_MUTED }}>{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* When Required */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('whenRequired.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('whenRequired.subtitle')}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {whenRequiredCols.map((col) => {
              const Icon = col.icon;
              return (
                <div key={col.key} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: col.accentLight }}>
                    <Icon size={20} style={{ color: col.accent }} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: TEXT }}>
                    {t(`whenRequired.${col.key}.title`)}
                  </h3>
                  <ul className="space-y-2">
                    {col.items.map((item: string, i: number) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: TEXT_MID }}>
                        <span style={{ color: col.accent }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Municipality Breakdown */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('municipalities.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('municipalities.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {municipalities.map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-1" style={{ color: GOLD }}>{t(`municipalities.${key}.title`)}</h3>
                <p className="text-sm mb-2" style={{ color: TEXT_MID }}>{t(`municipalities.${key}.description`)}</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>{t(`municipalities.${key}.fees`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('process.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('process.subtitle')}</p>
          <div className="space-y-4">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: GOLD }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1" style={{ color: TEXT }}>
                      {t(`process.${step.key}.title`)}
                    </h3>
                    <p className="text-sm" style={{ color: TEXT_MID }}>{t(`process.${step.key}.description`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('costs.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('costs.subtitle')}</p>
          <div className="space-y-3">
            {costs.map((c) => (
              <div key={c.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`costs.${c.key}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`costs.${c.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consequences */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('consequences.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('consequences.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {consequenceItems.map((item: { title: string; description: string }, i: number) => (
              <div key={i} className="rounded-xl p-5 border-l-4" style={{ backgroundColor: CARD, boxShadow: neu(), borderLeftColor: STEP_RED }}>
                <h3 className="font-bold mb-1" style={{ color: STEP_RED }}>{item.title}</h3>
                <p className="text-sm" style={{ color: TEXT_MID }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
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
            itemId="vancouver-renovation-permits-guide"
          />
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: TEXT }}>{t('related.title')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/guides/basement-suite-cost-vancouver" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {t('related.basementSuite')} <ArrowRight size={14} />
            </Link>
            <Link href="/guides/kitchen-renovation-cost-vancouver" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {t('related.kitchenGuide')} <ArrowRight size={14} />
            </Link>
            <Link href="/guides/bathroom-renovation-cost-vancouver" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: CARD, boxShadow: neu(), color: GOLD }}>
              {t('related.bathroomGuide')} <ArrowRight size={14} />
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
            Frequently Asked Questions — Vancouver Renovation Permits
          </h2>
          <div className="space-y-4">
            {(['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const).map((key) => (
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
            <strong>Planning your renovation?</strong>{' '}
            <Link href="/blog/how-to-choose-renovation-contractor-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>How to Choose a Contractor</Link>
            {' · '}
            <Link href="/blog/renovation-timeline-how-long-does-each-project-take" className="underline hover:no-underline" style={{ color: GOLD }}>Renovation Timeline</Link>
            {' · '}
            <Link href="/guides/basement-suite-cost-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>Basement Suite Cost Guide</Link>
            {' · '}
            <Link href="/guides/kitchen-renovation-cost-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>Kitchen Cost Guide</Link>
          </p>
        </div>
      </section>

      <CTASection heading={t('cta.heading')} subtitle={t('cta.subtitle')} phone={phone} />
    </main>
  );
}
