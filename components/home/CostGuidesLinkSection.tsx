import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { CARD, GOLD, GOLD_PALE, NAVY, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';
import type { Locale } from '@/i18n/config';

/**
 * Hub of clickable cost-guide links on the homepage. Mirrors the
 * BlogPostPage (added 2026-04-30) + ServiceDetailPage + AreaPage (PR #96,
 * 2026-05-30) pattern that funnels traffic INTO the cost-guides at
 * /guides/<service>-renovation-cost-vancouver/.
 *
 * Per GSC queue 2026-05-30, the cost-guides sit at striking-distance
 * pos 8-14 for high-impression cost queries (300-750 impr/28d, 0% CTR).
 * The HOMEPAGE was the largest remaining inbound surface that had zero
 * cost-guide links — it's the #1-indexed page on the site and the
 * natural funnel-top for renovation cost research. Closing this gap
 * completes the topical-authority pyramid: every major surface (home,
 * area, service, blog) now links to the cost-guide cluster.
 *
 * Order matches GSC impression volume on the corresponding query — kitchen
 * + bathroom first (highest commercial intent), basement + whole-house
 * second (high value but lower volume), commercial + cabinet third (long-
 * tail). Server component (no client JS); zero impact on Core Web Vitals.
 *
 * 2026-06-02: Labels MOVED from English-only inline strings to next-intl
 * keys via the `costGuidesSection` namespace. 2026-06-02T08:30Z audit
 * (data/cross-locale-gap-root-cause-2026-06-02.md on hub) showed the
 * un-translated EN labels were a measurable contributor to the
 * cross-locale word-count gap on /zh/ + /ja/ rendered pages. Prior
 * 84-key cost estimate was reduced to ~17min via the gtx-translate
 * pipeline established for blog_posts + projects MT-backfill.
 */
const COST_GUIDE_SLUGS = [
  { slug: 'kitchen-renovation-cost-vancouver', labelKey: 'kitchen' },
  { slug: 'bathroom-renovation-cost-vancouver', labelKey: 'bathroom' },
  { slug: 'basement-renovation-cost-vancouver', labelKey: 'basement' },
  { slug: 'whole-house-renovation-cost-vancouver', labelKey: 'wholeHouse' },
  { slug: 'commercial-renovation-cost-vancouver', labelKey: 'commercial' },
  { slug: 'cabinet-refinishing-cost-vancouver', labelKey: 'cabinet' },
  // 2026-06-26: Added basement-suite guide — was the only guide missing from
  // this section. Now all 7 cost guides are linked from the homepage hub.
  { slug: 'basement-suite-cost-vancouver', labelKey: 'basementSuite' },
] as const;

export default async function CostGuidesLinkSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'costGuidesSection' });
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: TEXT }}>
          {t('title')}
        </h2>
        <p className="text-base text-center mb-8 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
          {t('subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COST_GUIDE_SLUGS.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}` as '/guides/kitchen-renovation-cost-vancouver'}
              className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
            >
              {t(`labels.${g.labelKey}`)}
            </Link>
          ))}
        </div>
        <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
          {t('financingPrompt')}{' '}
          <Link
            href="/financing"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            {t('financingCta')}
          </Link>
        </p>
        {/* 2026-06-26: Planning guide pills on the home page. The home page is
            the highest-equity page on the site — linking to the 6 key planning
            guide blog posts from here passes maximum PageRank to those posts.
            English-only inline strings (consistent with other EN-only inline
            patterns in this component pre-i18n-backfill). */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: `${NAVY}10` }}>
          <p className="text-xs font-bold uppercase tracking-wider text-center mb-4" style={{ color: TEXT_MID }}>
            Free Renovation Planning Guides
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {([
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'How to Choose a Contractor' },
              { href: '/blog/renovation-cost-vancouver-2026-complete-guide', label: 'Renovation Costs 2026' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: 'Renovation Timeline' },
              { href: '/blog/renovation-permits-bc-guide', label: 'BC Permits Guide' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'Renovation Financing' },
              { href: '/blog/strata-renovation-rules-vancouver', label: 'Strata Rules BC' },
            ] as const).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD_PALE, color: NAVY }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
