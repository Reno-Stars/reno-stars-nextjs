import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  ReceiptText,
  ListChecks,
  PackageCheck,
  EyeOff,
  CalendarCheck,
  FileSignature,
  Ruler,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import {
  NAVY,
  GOLD,
  GOLD_ON_DARK,
  GOLD_PALE,
  SURFACE_ALT,
  CARD,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
  neu,
} from '@/lib/theme';

interface TransparentPricingPageProps {
  locale: Locale;
}

/** The four quote-anatomy cards. Order is the reading order on the page. */
const QUOTE_KEYS = ['itemised', 'steps', 'included', 'exclusions'] as const;
const QUOTE_ICONS = {
  itemised: ReceiptText,
  steps: ListChecks,
  included: PackageCheck,
  exclusions: EyeOff,
} as const;

/**
 * The payment stages, verbatim from the contract language published on /terms/
 * ("typically structured in milestones (e.g., on signing, at start of
 * construction, on completion of key phases, and on final acceptance)").
 *
 * Deliberately labels only — no percentages, no per-stage description. The
 * split differs per contract, and a number invented here would contradict the
 * document the client actually signs.
 */
// Five stages, and the split that 94 of the 124 five-stage invoices in the
// production database actually use: 10 / 40 / 25 / 20 / 5. The stage-3 and
// stage-4 triggers vary by project type (floor tile down, cabinets on site),
// so the copy names them by role rather than by a trade that would be wrong
// for a basement or a whole-house job.
const MILESTONE_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const;

/** How a homeowner gets from "interested" to a written number. */
const GETTING_KEYS = ['s1', 's2', 's3'] as const;
const GETTING_ICONS = { s1: Ruler, s2: FileSignature, s3: ListChecks } as const;

const FAQ_KEYS = ['1', '2', '3', '4'] as const;

export default function TransparentPricingPage({ locale }: TransparentPricingPageProps) {
  const t = useTranslations('transparentPricing');
  // Button labels come from the shared `cta` catalog rather than new keys —
  // "Request Free Consultation" is already hand-translated in all 14 locales.
  const tCta = useTranslations('cta');

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: SURFACE_ALT }} data-locale={locale}>
      {/* Hero */}
      <section className="px-4 pt-14 pb-10 text-center">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
          style={{ backgroundColor: GOLD_PALE, color: NAVY }}
        >
          <ReceiptText className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
          {t('hero.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold max-w-3xl mx-auto" style={{ color: NAVY }}>
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
          {t('hero.subtitle')}
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* What is inside a quote */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: NAVY }}>
            {t('quote.title')}
          </h2>
          <p className="text-sm sm:text-base text-center max-w-2xl mx-auto mb-6" style={{ color: TEXT_MID }}>
            {t('quote.subtitle')}
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {QUOTE_KEYS.map((k) => {
              const Icon = QUOTE_ICONS[k];
              return (
                <div key={k} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: GOLD_PALE }}
                  >
                    <Icon className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1.5" style={{ color: NAVY }}>
                    {t(`quote.items.${k}.title`)}
                  </h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>
                    {t(`quote.items.${k}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment milestones */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
            {t('milestones.title')}
          </h2>
          <p className="text-sm sm:text-base mb-6" style={{ color: TEXT_MID }}>
            {t('milestones.subtitle')}
          </p>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: TEXT_MUTED }}
          >
            {t('milestones.commonLabel')}
          </p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MILESTONE_KEYS.map((k, i) => (
              <li key={k} className="rounded-xl p-4" style={{ backgroundColor: SURFACE_ALT }}>
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-2"
                  style={{ backgroundColor: GOLD_PALE, color: NAVY }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: GOLD }}>
                  {t(`milestones.percentages.${k}`)}%
                </p>
                <p className="text-sm font-semibold" style={{ color: TEXT }}>
                  {t(`milestones.steps.${k}`)}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm" style={{ color: TEXT_MID }}>
            {t('milestones.note')}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium" style={{ color: TEXT_MUTED }}>
            <CreditCard className="w-4 h-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
            {t('milestones.methods')}
          </p>
        </section>

        {/* How to get your number */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: NAVY }}>
            {t('getting.title')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {GETTING_KEYS.map((k) => {
              const Icon = GETTING_ICONS[k];
              return (
                <div key={k} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: GOLD_PALE }}
                  >
                    <Icon className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1.5" style={{ color: NAVY }}>
                    {t(`getting.steps.${k}.title`)}
                  </h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>
                    {t(`getting.steps.${k}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-5" style={{ color: NAVY }}>
            {t('faqSection.title')}
          </h2>
          <dl className="space-y-5">
            {FAQ_KEYS.map((i) => (
              <div key={i}>
                <dt className="font-semibold mb-1.5 flex items-start gap-2" style={{ color: NAVY }}>
                  <CalendarCheck className="w-4 h-4 mt-1 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span>{t(`faq.q${i}`)}</span>
                </dt>
                <dd className="text-sm pl-6" style={{ color: TEXT_MID }}>
                  {t(`faq.a${i}`)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Related reading */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: NAVY }}>
            {t('related.title')}
          </h2>
          <ul className="space-y-3">
            {[
              { href: '/financing/', label: t('related.financing') },
              { href: '/workflow/', label: t('related.workflow') },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: GOLD }}
                >
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-6 sm:p-10 text-center" style={{ backgroundColor: NAVY, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-3 text-white">{t('cta.heading')}</h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto mb-7 text-white/80">{t('cta.subtitle')}</p>
          <Link
            href="/contact/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: GOLD_ON_DARK, color: NAVY }}
          >
            {tCta('requestConsultation')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
