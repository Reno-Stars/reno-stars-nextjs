"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { MapPin, Star, ShieldCheck, Clock, Phone, ArrowRight } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import type { Locale } from "@/i18n/config";
import type { ServiceArea } from "@/lib/types";
import {
  NAVY,
  GOLD,
  GOLD_PALE,
  SURFACE,
  SURFACE_ALT,
  CARD,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
  neu,
} from "@/lib/theme";

/**
 * "Renovation near me" landing page — anchors the generic "near me" query
 * cluster to Reno Stars brand, then routes visitors to the right area page
 * (/en/areas/<city>) or service page. Competitive target: Angi, HomeGuide,
 * Forbes near-me aggregators. We don't aggregate pros — we ARE the pros —
 * so the page is trust-signal + area-coverage first, lead-form second.
 */
/** Focal service on a room-specific near-me page. Maps 1:1 to the
 *  `nearMe.services.<key>` message keys. Undefined on the umbrella
 *  /renovation-near-me/ page. */
export type NearMeVariant = "kitchen" | "bathroom" | "wholeHouse" | "basement";

/** A real, published project surfaced on a near-me page, pre-localized to a
 *  flat shape by the server component (no client-side DB/i18n plumbing). */
export interface NearbyProject {
  slug: string;
  title: string;
  city: string;
  heroImage: string;
}

interface Props {
  locale: Locale;
  areas: ServiceArea[];
  /** Service-specific H1 override. If provided, replaces the generic
   *  t("hero.h1") text so each near-me sub-page targets a distinct
   *  service query rather than duplicating "Looking for a renovation
   *  company near you?" across all 5 URLs (op-d087a446b70a).
   */
  h1Override?: string;
  /** Live Google rating + count from getGoogleReviews() (SSOT). The reviews
   *  trust stat renders `${googleRating}★` from these; the hardcoded message
   *  is only a fallback when the props are absent (H3 — no stale literal). */
  googleRating?: number;
  reviewCount?: number;
  /** Focal service. When set, the page leads with a room-specific intro,
   *  features that room's service card first, and shows a REAL project grid —
   *  so the 4 room near-me pages are genuinely differentiated, not ~99%
   *  identical bodies leaning on rel=canonical alone. */
  variant?: NearMeVariant;
  /** Real published projects to surface. Empty on the umbrella page. */
  nearbyProjects?: NearbyProject[];
  /** true → nearbyProjects are the exact focal room; false → related work
   *  (honest framing when the room has no dedicated projects, e.g. basement —
   *  we truthfully show related crews' work near you, clearly labeled). */
  nearbyExact?: boolean;
}

export default function NearMePage({ locale, areas, h1Override, googleRating, reviewCount, variant, nearbyProjects = [], nearbyExact = true }: Props) {
  const t = useTranslations("nearMe");

  // Live reviews rating for the trust stat — only when the SSOT actually has
  // reviews (guards against rendering a rating when the count is 0). Falls back
  // to the localized message when the live props are absent.
  const liveReviewsStat =
    googleRating && googleRating > 0 && reviewCount && reviewCount > 0
      ? `${googleRating.toFixed(1)}★`
      : null;

  const allServices = ["kitchen", "bathroom", "wholeHouse", "basement", "cabinet", "commercial"] as const;
  // On a room-specific page, surface the focal room's card first so even the
  // shared "What we renovate" section differs page-to-page.
  const services = variant
    ? [variant, ...allServices.filter((s) => s !== variant)]
    : [...allServices];

  // Per-service hrefs — deep-link the 4 services that have dedicated
  // near-me sub-pages so each near-me page acquires inbound internal links
  // from its sister pages (2026-05-21 on-page scan flagged the 4 service
  // near-me pages as having weak_inbound_internal_links_within_audit_set).
  // cabinet + commercial fall back to /services/ since they don't have
  // near-me sub-pages.
  const serviceHref = (s: typeof allServices[number]): string => {
    switch (s) {
      case "kitchen": return `/${locale}/kitchen-renovation-near-me/`;
      case "bathroom": return `/${locale}/bathroom-renovation-near-me/`;
      case "wholeHouse": return `/${locale}/whole-house-renovation-near-me/`;
      case "basement": return `/${locale}/basement-renovation-near-me/`;
      default: return `/${locale}/services/`;
    }
  };

  return (
    <div style={{ backgroundColor: SURFACE, color: TEXT }}>
      {/* Hero */}
      <section className="relative py-20 md:py-28" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: GOLD_PALE, color: GOLD }}
          >
            <MapPin size={16} />
            <span className="text-sm font-semibold">{t("hero.eyebrow")}</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: NAVY }}
          >
            {h1Override ?? t("hero.h1")}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6" style={{ color: TEXT_MID }}>
            {t("hero.subtitle")}
          </p>
          {/* Room-specific lead: the real scope + price band for THIS service
              (localized in all 14 locales via nearMe.services.<variant>.desc),
              so each room page opens with distinct, truthful copy instead of
              the shared generic subtitle alone. */}
          {variant && (
            <p className="text-base md:text-lg max-w-3xl mx-auto mb-10 font-medium" style={{ color: NAVY }}>
              {t(`services.${variant}.desc`)}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/contact/`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold"
              style={{ backgroundColor: GOLD, color: "#fff" }}
            >
              {t("hero.ctaPrimary")} <ArrowRight size={18} />
            </Link>
            <a
              href="tel:+17789607999"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold border-2"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              <Phone size={18} /> 778-960-7999
            </a>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-14" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Star, key: "reviews" },
              { icon: ShieldCheck, key: "insured" },
              { icon: Clock, key: "experience" },
              { icon: MapPin, key: "coverage" },
            ].map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <Icon size={32} style={{ color: GOLD }} className="mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1" style={{ color: NAVY }}>
                  {key === "reviews" && liveReviewsStat ? liveReviewsStat : t(`trust.${key}.stat`)}
                </div>
                <div className="text-sm" style={{ color: TEXT_MUTED }}>
                  {t(`trust.${key}.label`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section className="py-16" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: NAVY }}>
            {t("areas.heading")}
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
            {t("areas.subtitle")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {areas.map((a) => (
              <Link
                key={a.slug}
                href={`/${locale}/areas/${a.slug}/`}
                className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition"
                style={{ backgroundColor: CARD, color: TEXT }}
              >
                <span className="font-medium">
                  {a.name[locale] || a.name.en}
                </span>
                <ArrowRight size={16} style={{ color: GOLD }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent projects near you — REAL published work, room-specific.
          This is the primary differentiator between the room near-me pages:
          the kitchen page shows kitchen photos/titles/links, the bathroom page
          shows bathroom ones, etc. When the focal room has no dedicated
          projects (e.g. basement), `nearbyExact` is false and we show related
          recent work under an honest "near you" heading — never claiming a
          project is something it isn't. */}
      {variant && nearbyProjects.length > 0 && (
        <section className="py-16" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-3" style={{ color: NAVY }}>
              {nearbyExact ? t("nearby.heading") : t("nearby.relatedHeading")}
            </h2>
            <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
              {nearbyExact ? t("nearby.subtitle") : t("nearby.relatedNote")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${locale}/projects/${p.slug}/`}
                  className="group rounded-2xl overflow-hidden transition hover:shadow-lg"
                  style={{ backgroundColor: CARD, boxShadow: neu() }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <OptimizedImage
                      src={p.heroImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 line-clamp-2" style={{ color: NAVY }}>
                      {p.title}
                    </h3>
                    {p.city && (
                      <span className="inline-flex items-center gap-1 text-sm" style={{ color: TEXT_MUTED }}>
                        <MapPin size={14} style={{ color: GOLD }} /> {p.city}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href={`/${locale}/projects/`}
                className="inline-flex items-center gap-2 font-semibold"
                style={{ color: GOLD }}
              >
                {t("nearby.viewAll")} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-16" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>
            {t("services.heading")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const isFocal = variant === s;
              return (
              <div
                key={s}
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: isFocal ? GOLD_PALE : CARD,
                  boxShadow: isFocal ? `0 0 0 2px ${GOLD}` : neu(),
                }}
              >
                <h3 className="text-xl font-bold mb-3" style={{ color: NAVY }}>
                  {t(`services.${s}.title`)}
                </h3>
                <p className="mb-4" style={{ color: TEXT_MID }}>
                  {t(`services.${s}.desc`)}
                </p>
                <Link
                  href={serviceHref(s)}
                  className="inline-flex items-center gap-1 font-semibold text-sm"
                  style={{ color: GOLD }}
                >
                  {t("services.learnMore")} <ArrowRight size={14} />
                </Link>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Reno Stars */}
      <section className="py-16" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>
            {t("why.heading")}
          </h2>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: GOLD, color: "#fff" }}
                >
                  {n}
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: NAVY }}>
                    {t(`why.point${n}.title`)}
                  </h3>
                  <p style={{ color: TEXT_MID }}>{t(`why.point${n}.body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>
            {t("faq.heading")}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <details
                key={n}
                className="p-5 rounded-xl"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <summary className="cursor-pointer font-semibold" style={{ color: NAVY }}>
                  {t(`faq.q${n}`)}
                </summary>
                <p className="mt-3" style={{ color: TEXT_MID }}>
                  {t(`faq.a${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {/* 2026-06-26: Planning guide pill-links before final CTA. Near-me pages
          attract high-intent users who are ready to hire. Planning guides
          (contractor vetting, timelines, permits) close the last research
          questions before they submit a quote request. */}
      <section className="py-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: TEXT_MID }}>
            Renovation Planning Guides
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {([
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'How to Choose a Contractor' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: 'Renovation Costs 2026' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: 'Renovation Timeline' },
              { href: '/blog/renovation-permits-bc-guide', label: 'BC Permits Guide' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'Financing Your Reno' },
              { href: '/blog/strata-renovation-rules-vancouver', label: 'Strata Rules BC' },
            ] as const).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD_PALE, color: NAVY }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: NAVY }}>
            {t("finalCta.heading")}
          </h2>
          <p className="text-lg mb-8" style={{ color: TEXT_MID }}>
            {t("finalCta.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/contact/`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold"
              style={{ backgroundColor: GOLD, color: "#fff" }}
            >
              {t("finalCta.quote")} <ArrowRight size={18} />
            </Link>
            <a
              href="tel:+17789607999"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold border-2"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              <Phone size={18} /> {t("finalCta.call")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
