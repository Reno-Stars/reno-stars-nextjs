import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  Trophy,
  Inbox,
  Building2,
  CalendarDays,
  Link2,
  ShieldCheck,
  HardHat,
  BadgeCheck,
  Hammer,
  Star,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { awardsByYear, type Award } from '@/lib/awards';
import { COMPANY_STATS } from '@/lib/company-config';
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

interface AwardsPageProps {
  locale: Locale;
  /** Live archive. Empty until Reno Stars actually wins something. */
  awards: readonly Award[];
  /** From `getCompanyFromDb()` — same source the About page and footer read. */
  yearsExperience: string;
  projectsCompleted: string;
  liabilityCoverage: string;
  /** Live Google Business Profile rating, from the reviews cache. */
  googleRating: number;
  googleReviewCount: number;
}

const CRITERIA_KEYS = ['issuer', 'year', 'link'] as const;
const CRITERIA_ICONS = { issuer: Building2, year: CalendarDays, link: Link2 } as const;

export default function AwardsPage({
  locale,
  awards,
  yearsExperience,
  projectsCompleted,
  liabilityCoverage,
  googleRating,
  googleReviewCount,
}: AwardsPageProps) {
  const t = useTranslations('awards');
  // Credential LABELS are the site-wide ones from `stats` — one wording for
  // "Active WCB Coverage" across every page that claims it.
  const tStats = useTranslations('stats');
  const tCta = useTranslations('cta');

  const grouped = awardsByYear(awards);

  /**
   * Everything here is read from a source of truth rather than typed in:
   * years/projects/coverage come from `lib/company-config.ts` via the company
   * record, the rating comes from the Google reviews cache. Nothing on this
   * page asserts a number that is not already published elsewhere on the site.
   */
  const credentials = [
    {
      key: 'liability',
      icon: ShieldCheck,
      value: t('verified.liability', { amount: liabilityCoverage }),
      note: t('verified.liabilityNote'),
    },
    {
      key: 'wcb',
      icon: HardHat,
      value: tStats('wcbCoverage'),
      note: t('verified.wcbNote'),
    },
    {
      key: 'warranty',
      icon: BadgeCheck,
      value: t('verified.warranty', { years: COMPANY_STATS.warrantyYears }),
      note: t('verified.warrantyNote'),
    },
    {
      key: 'years',
      icon: CalendarDays,
      value: `${yearsExperience}+ ${tStats('years')}`,
      note: t('verified.yearsNote'),
    },
    {
      key: 'projects',
      icon: Hammer,
      value: `${projectsCompleted} ${tStats('projects')}`,
      note: t('verified.projectsNote'),
    },
  ];

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: SURFACE_ALT }} data-locale={locale}>
      {/* Hero */}
      <section className="px-4 pt-14 pb-10 text-center">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
          style={{ backgroundColor: GOLD_PALE, color: NAVY }}
        >
          <Trophy className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
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
        {grouped.length === 0 ? (
          /* Empty archive — the honest state, not a placeholder for fake badges. */
          <section
            className="rounded-2xl p-6 sm:p-10 text-center"
            style={{ backgroundColor: CARD, boxShadow: neu(6) }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: GOLD_PALE }}
            >
              <Inbox className="w-6 h-6" style={{ color: GOLD }} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: NAVY }}>
              {t('empty.title')}
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
              {t('empty.body')}
            </p>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: NAVY }}>
              {t('list.title')}
            </h2>
            <div className="space-y-8">
              {grouped.map(({ year, items }) => (
                <div key={year}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: NAVY }}>
                    {year}
                  </h3>
                  <ul className="space-y-4">
                    {items.map((award) => (
                      <li
                        key={award.id}
                        id={award.id}
                        className="rounded-2xl p-6 scroll-mt-24"
                        style={{ backgroundColor: CARD, boxShadow: neu(5) }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: GOLD_PALE }}
                          >
                            <Trophy className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold" style={{ color: NAVY }}>
                              {award.title}
                            </p>
                            <p className="text-sm mt-1" style={{ color: TEXT_MID }}>
                              {`${t('list.issuedBy')}: ${award.issuer}`}
                            </p>
                            {award.note ? (
                              <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
                                {award.note}
                              </p>
                            ) : null}
                            {award.url ? (
                              <a
                                href={award.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                                style={{ color: GOLD }}
                              >
                                {t('list.announcement')}
                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What will appear here — the editorial bar, stated in public. */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: NAVY }}>
            {t('criteria.title')}
          </h2>
          <ul className="space-y-3">
            {CRITERIA_KEYS.map((k) => {
              const Icon = CRITERIA_ICONS[k];
              return (
                <li key={k} className="flex items-start gap-2.5">
                  <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: TEXT_MID }}>
                    {t(`criteria.${k}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Verifiable credentials */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: NAVY }}>
            {t('verified.title')}
          </h2>
          <p className="text-sm sm:text-base text-center max-w-2xl mx-auto mb-6" style={{ color: TEXT_MID }}>
            {t('verified.subtitle')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {credentials.map(({ key, icon: Icon, value, note }) => (
              <div key={key} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: GOLD_PALE }}
                >
                  <Icon className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
                </div>
                <p className="font-semibold mb-1.5" style={{ color: TEXT }}>
                  {value}
                </p>
                <p className="text-sm" style={{ color: TEXT_MID }}>
                  {note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The one form of outside recognition that is actually ours today. */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: NAVY }}>
            {t('reviews.title')}
          </h2>
          {/* Guarded like every other consumer (ReviewsPage, TestimonialsSection,
              AreaPage, NearMePage): getGoogleReviews() returns rating 0 / count 0
              when the Places key is absent AND the cache row is empty — the exact
              state the 2026-08-14 migration produced. Unguarded, a section headed
              "recognition we do have" would publicly advertise "0 out of 5 on
              Google, from 0 reviews". */}
          {googleReviewCount > 0 && (
            <p className="inline-flex items-center gap-2 font-semibold mb-2" style={{ color: TEXT }}>
              <Star className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
              {t('reviews.rating', { rating: googleRating, count: googleReviewCount })}
            </p>
          )}
          <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
            {t('reviews.body')}
          </p>
          <Link
            href="/reviews/"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t('reviews.link')}
          </Link>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-6 sm:p-10 text-center" style={{ backgroundColor: NAVY, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-3 text-white">{t('cta.heading')}</h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto mb-7 text-white/80">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-xl mx-auto">
            <Link
              href="/projects/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: GOLD_ON_DARK, color: NAVY }}
            >
              {tCta('viewOurWork')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-white/25 text-white transition-transform hover:scale-[1.02]"
            >
              {tCta('requestConsultation')}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
