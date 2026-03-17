import { SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';
import Marquee from './Marquee';

interface LocalizedPartner {
  name: string;
  logo: string;
  url?: string;
  isHiddenVisually: boolean;
}

interface PartnersSectionProps {
  partners: LocalizedPartner[];
  translations: {
    title: string;
    subtitle: string;
    srTitle: string;
  };
}

export default function PartnersSection({ partners, translations: t }: PartnersSectionProps) {
  // Filter out partners that should not be rendered at all
  // isHiddenVisually partners are rendered but with sr-only class
  if (partners.length === 0) return null;

  // Visible partners for the carousel (non-hidden)
  const visiblePartners = partners.filter((p) => !p.isHiddenVisually);
  // Hidden partners for SEO (sr-only)
  const hiddenPartners = partners.filter((p) => p.isHiddenVisually);

  // Repeat items so one "set" always fills the viewport (prevents visible duplicates).
  // LOGO_WIDTH = 160px card + gap-8 (32px).
  const MIN_TRACK_WIDTH = 2000;
  const LOGO_WIDTH = 192;
  const repeatCount = visiblePartners.length > 0
    ? Math.max(1, Math.ceil(MIN_TRACK_WIDTH / (visiblePartners.length * LOGO_WIDTH)))
    : 1;

  // Duration scales with the full first half (repeatCount sets) so speed feels consistent
  const SECONDS_PER_CARD = 4;
  const duration = visiblePartners.length * repeatCount * SECONDS_PER_CARD;

  return (
    <section
      id="partners"
      aria-labelledby="partners-title"
      className="py-14"
      style={{ backgroundColor: SURFACE }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="partners-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>
          {t.title}
        </h2>
        <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
      </div>

      {visiblePartners.length > 0 && (
        <>
          <div
            className="overflow-hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label={t.title}
          >
            <div id="partners-track" className="flex items-center gap-8 w-max py-4">
              {visiblePartners.map((partner, i) => (
                <PartnerLogo key={i} partner={partner} />
              ))}
            </div>
          </div>
          <Marquee trackId="partners-track" repeatCount={repeatCount} duration={duration} />
        </>
      )}

      {/* Hidden partners for SEO - screen reader only */}
      {hiddenPartners.length > 0 && (
        <div className="sr-only">
          <h3>{t.srTitle}</h3>
          <ul>
            {hiddenPartners.map((partner) => (
              <li key={partner.name}>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    {partner.name}
                  </a>
                ) : (
                  partner.name
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PartnerLogo({ partner }: { partner: LocalizedPartner }) {
  const content = (
    <div
      className="shrink-0 rounded-xl p-4 flex items-center justify-center transition-transform duration-300 hover:scale-105"
      style={{
        boxShadow: neu(4),
        backgroundColor: CARD,
        width: 160,
        height: 100,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logo}
        alt={partner.name}
        className="max-w-full max-h-full object-contain"
        loading="lazy"
      />
    </div>
  );

  if (partner.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={partner.name}
        className="focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl"
      >
        {content}
      </a>
    );
  }

  return content;
}
