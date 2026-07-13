import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { GOLD, TEXT, TEXT_MID } from '@/lib/theme';
import ReviewQuoteCard, { SEE_PROJECT_LABELS } from '@/components/reviews/ReviewQuoteCard';

/**
 * One review already resolved for the current locale, as rendered on the
 * /reviews hub group sections. Lives here (the shared section component) so the
 * page, ReviewsCityGroups and ReviewsTypeGroups all import ONE definition.
 */
export interface HubDisplayReview {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string | null;
  sourceUrl: string | null;
  /** Review platform ('google', 'yelp', …) — drives card branding (#29). */
  source: string | null;
  projectSlug: string | null;
  kind: 'project' | 'testimonial';
}

/** One rendered group (a city or a project type) inside a hub section. */
export interface ReviewGroupDisplay {
  /** Localized group heading (city display name / type display name). */
  heading: string;
  /** Link target for the heading (area page / service page), or null. */
  headingHref: string | null;
  /**
   * Indices into the section's shared `reviews` pool. Index references (rather
   * than inlined review objects) keep a review that appears in BOTH the city
   * and the type grouping from serializing its body twice into the RSC payload
   * (efficiency #27 — same technique the page already uses for googleIndices).
   */
  reviewIndices: number[];
}

/**
 * Shared /reviews hub group section — the single implementation behind
 * ReviewsCityGroups (grouped by city) and ReviewsTypeGroups (grouped by project
 * type), which were byte-identical apart from their heading icon, background
 * and per-group heading link target (dedup #16-21b). The caller passes the
 * shared review pool plus already-localized groups (heading + optional link +
 * index refs). No hooks — labels use the self-contained 14-locale map
 * technique. Deliberately NO Review schema markup (it lives on the project
 * pages only; duplicating the same reviews on a second entity risks spam).
 */
interface ReviewsGroupSectionProps {
  title: string;
  subtitle: string;
  /** Lucide heading icon (MapPin for city, Wrench for type). */
  icon: LucideIcon;
  /** Shared pool every group's `reviewIndices` point into. */
  reviews: HubDisplayReview[];
  groups: ReviewGroupDisplay[];
  locale: string;
  backgroundColor: string;
  /** id wired to the section's aria-labelledby + h2. */
  labelledById: string;
}

export default function ReviewsGroupSection({
  title,
  subtitle,
  icon: Icon,
  reviews,
  groups,
  locale,
  backgroundColor,
  labelledById,
}: ReviewsGroupSectionProps) {
  if (groups.length === 0) return null;

  const seeProject = SEE_PROJECT_LABELS[locale] ?? SEE_PROJECT_LABELS.en;

  return (
    <section className="py-14" style={{ backgroundColor }} aria-labelledby={labelledById}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 id={labelledById} className="text-2xl font-bold" style={{ color: TEXT }}>{title}</h2>
        </div>
        <p className="text-base mb-10" style={{ color: TEXT_MID }}>{subtitle}</p>

        {groups.map((group) => (
          <div key={group.heading} className="mb-10 last:mb-0">
            <h3 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
              {group.headingHref ? (
                <Link href={group.headingHref} className="hover:underline" style={{ color: TEXT }}>
                  {group.heading}
                </Link>
              ) : (
                group.heading
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.reviewIndices.map((ri, idx) => {
                const review = reviews[ri];
                return (
                  <ReviewQuoteCard
                    // idx guards against legitimate collisions (same author +
                    // same month-precision date); the list is static per render.
                    key={`${review.authorName}-${review.reviewDate ?? ''}-${idx}`}
                    review={review}
                    locale={locale}
                    kind={review.kind === 'testimonial' ? 'testimonial' : 'google'}
                    eyebrowTag="div"
                    footerExtra={
                      review.projectSlug ? (
                        <div className="mt-3">
                          <Link
                            href={`/${locale}/projects/${review.projectSlug}/`}
                            className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                            style={{ color: GOLD }}
                          >
                            {seeProject} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
