import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { CARD, GOLD, NAVY, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';
import type { Locale } from '@/i18n/config';
import { getServiceAreasFromDb } from '@/lib/db/queries';
import { getLocalizedArea } from '@/lib/data/areas';

/**
 * Hub of clickable area-page links on the homepage. Internal-link audit
 * (2026-04-30) found the homepage had zero outbound links to /areas/*,
 * starving the 14 city pages of authority transfer. Adding this section
 * funnels homepage page-rank to the area-page cluster.
 *
 * Server component: pulls localized area names from DB so /vi/, /ja/, etc.
 * render the city tiles in the matching script. The DB localizations jsonb
 * carries name{Locale} for every supported language (backfilled 2026-04).
 *
 * Order matches GSC impression volume — Vancouver, Burnaby, Coquitlam,
 * Surrey, Richmond first because those carry the highest commercial-query
 * impressions.
 */

const ORDER = [
  'vancouver',
  'burnaby',
  'coquitlam',
  'surrey',
  'richmond',
  'north-vancouver',
  'west-vancouver',
  'new-westminster',
  'maple-ridge',
  'port-coquitlam',
  'port-moody',
  'delta',
  'langley',
  'white-rock',
];

interface AreasLinkSectionProps {
  locale: Locale;
}

export default async function AreasLinkSection({ locale }: AreasLinkSectionProps) {
  const [t, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'areas' }),
    getServiceAreasFromDb(),
  ]);

  const localized = ORDER.map((slug) => {
    const area = areas.find((a) => a.slug === slug);
    if (!area) return null;
    return { slug, name: getLocalizedArea(area, locale).name };
  }).filter((a): a is { slug: string; name: string } => a !== null);

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: TEXT }}>
          {t('linkSectionTitle')}
        </h2>
        <p className="text-base text-center mb-8 max-w-2xl mx-auto" style={{ color: TEXT }}>
          {t('linkSectionSubtitle')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {localized.map((a) => (
            <Link
              key={a.slug}
              href={`/areas/${a.slug}` as '/areas/burnaby'}
              className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
            >
              {a.name}
            </Link>
          ))}
        </div>
        {/* "See all service areas" tagline-link to the /areas/ directory
            page. Pre-fix audit (2026-05-31, this same daily branch)
            found the canonical /areas/ aggregation page had ZERO body-
            content inbound links site-wide — a major gap given /services/
            has 4 inbound. The 14 city tiles above link to specific
            /areas/<slug>/ pages, but until this commit there was no
            link to the directory page itself. Adding one closes the
            site-architecture gap that left the topical "renovation
            services in Vancouver areas" hub starved of internal-link
            equity. Mirrors how /services/ is linked from /areas/page
            via cta.viewAllServices in the Contextual Internal Links
            chip row. */}
        <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
          <Link
            href="/areas"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            See all service areas →
          </Link>
        </p>
      </div>
    </section>
  );
}
