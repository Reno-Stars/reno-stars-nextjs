import { Link } from '@/navigation';
import type { Service } from '@/lib/types';
import { GOLD, SURFACE, TEXT, NAVY, CARD, neu } from '@/lib/theme';

/**
 * AnswerBlockSection — placed immediately after the hero so the page's first
 * ~200 words contain an explicit question, a crisp answer, and a citable list
 * of services. Designed for both AI/LLM answer-engine extraction (GEO) and
 * Google's E-E-A-T evaluation, which both reward content rooted in a clear
 * answerable Q + named entities + chunkable passages.
 *
 * Content is sourced from real DB / config data only:
 * - `foundingYear` from the company row → drives the answer template.
 * - `services` from the services table → drives the citable list.
 * No fabricated stats, prices, or claims.
 *
 * Added 2026-05-26 per Hongming greenlight #3 (homepage AI-citability refactor).
 */
interface AnswerBlockSectionProps {
  /** Year the company was founded (from `companies.foundingYear`) */
  foundingYear: number;
  /** Pre-localized services for the citable list (slug + label only). */
  services: { slug: string; title: string }[];
  translations: {
    /** "What does Reno Stars do?" */
    question: string;
    /** Answer template — uses `{year}` ICU placeholder. */
    answer: string;
    /** Heading above the citable services list. */
    servicesTitle: string;
    /** ARIA label template — uses `{service}` placeholder. */
    viewServiceLabel: string;
  };
}

export default function AnswerBlockSection({
  foundingYear,
  services,
  translations: t,
}: AnswerBlockSectionProps) {
  const answer = t.answer.replace('{year}', String(foundingYear));
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-title"
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: SURFACE }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl p-6 md:p-10"
          style={{ boxShadow: neu(5), backgroundColor: CARD }}
        >
          <h2
            id="what-we-do-title"
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: NAVY }}
          >
            {t.question}
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed mb-8"
            style={{ color: TEXT }}
          >
            {answer}
          </p>

          {services.length > 0 && (
            <>
              <h3
                id="services-at-a-glance"
                className="text-lg md:text-xl font-semibold mb-3"
                style={{ color: NAVY }}
              >
                {t.servicesTitle}
              </h3>
              <ul
                aria-labelledby="services-at-a-glance"
                className="flex flex-wrap gap-2.5 sm:gap-3 list-none p-0"
              >
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm md:text-base font-medium transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ boxShadow: neu(3), backgroundColor: CARD, color: NAVY }}
                      aria-label={t.viewServiceLabel.replace('{service}', s.title)}
                    >
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: GOLD }}
                      />
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
