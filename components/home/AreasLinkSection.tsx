import { Link } from '@/navigation';
import { CARD, NAVY, SURFACE_ALT, TEXT, neu } from '@/lib/theme';

/**
 * Hub of clickable area-page links on the homepage. Internal-link audit
 * (2026-04-30) found the homepage had zero outbound links to /areas/*,
 * starving the 14 city pages of authority transfer. Adding this section
 * funnels homepage page-rank to the area-page cluster, which is where
 * city-specific commercial queries land.
 *
 * Intentionally simple: tile grid, English-name labels (URL routing
 * handles locale prefix). Order matches GSC impression volume — Vancouver,
 * Burnaby, Coquitlam, Surrey, Richmond first because those carry the
 * highest commercial-query impressions.
 */

interface AreasLinkSectionProps {
  heading?: string;
  subheading?: string;
}

const AREAS: { slug: string; name: string }[] = [
  { slug: 'vancouver', name: 'Vancouver' },
  { slug: 'burnaby', name: 'Burnaby' },
  { slug: 'coquitlam', name: 'Coquitlam' },
  { slug: 'surrey', name: 'Surrey' },
  { slug: 'richmond', name: 'Richmond' },
  { slug: 'north-vancouver', name: 'North Vancouver' },
  { slug: 'west-vancouver', name: 'West Vancouver' },
  { slug: 'new-westminster', name: 'New Westminster' },
  { slug: 'maple-ridge', name: 'Maple Ridge' },
  { slug: 'port-coquitlam', name: 'Port Coquitlam' },
  { slug: 'port-moody', name: 'Port Moody' },
  { slug: 'delta', name: 'Delta' },
  { slug: 'langley', name: 'Langley' },
  { slug: 'white-rock', name: 'White Rock' },
];

export default function AreasLinkSection({
  heading = 'Service Areas Across Metro Vancouver',
  subheading = 'Click your city for renovation projects, neighbourhood specifics, and a free local quote.',
}: AreasLinkSectionProps) {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: TEXT }}>
          {heading}
        </h2>
        <p className="text-base text-center mb-8 max-w-2xl mx-auto" style={{ color: TEXT }}>
          {subheading}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {AREAS.map((a) => (
            <Link
              key={a.slug}
              href={`/areas/${a.slug}`}
              className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
            >
              {a.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
