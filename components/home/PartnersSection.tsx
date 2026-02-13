import { SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

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

  // Duration scales with number of cards so speed feels consistent
  const SECONDS_PER_CARD = 4;
  const duration = visiblePartners.length * SECONDS_PER_CARD;

  return (
    <section
      id="partners"
      aria-labelledby="partners-title"
      className="py-14"
      style={{ backgroundColor: SURFACE }}
    >
      {/* Duration is computed from partners.length (trusted server data), safe to inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-partners {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .partners-track {
          animation: scroll-partners ${duration}s linear infinite;
        }
        .partners-scroll:hover .partners-track,
        .partners-scroll:focus-within .partners-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .partners-track { animation: none; }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="partners-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>
          {t.title}
        </h2>
        <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
      </div>

      {visiblePartners.length > 0 && (
        <div
          className="partners-scroll overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={t.title}
        >
          <div className="partners-track flex items-center gap-8 w-max px-4 py-4">
            {/* Render twice for seamless loop */}
            {[0, 1].map((pass) =>
              visiblePartners.map((partner, i) => (
                <PartnerLogo key={`${pass}-${i}`} partner={partner} />
              ))
            )}
          </div>
        </div>
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
