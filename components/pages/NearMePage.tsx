"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { MapPin, Star, ShieldCheck, Clock, Phone, ArrowRight } from "lucide-react";
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
}

export default function NearMePage({ locale, areas, h1Override, googleRating, reviewCount }: Props) {
  const t = useTranslations("nearMe");

  // Live reviews rating for the trust stat — only when the SSOT actually has
  // reviews (guards against rendering a rating when the count is 0). Falls back
  // to the localized message when the live props are absent.
  const liveReviewsStat =
    googleRating && googleRating > 0 && reviewCount && reviewCount > 0
      ? `${googleRating.toFixed(1)}★`
      : null;

  const services = ["kitchen", "bathroom", "wholeHouse", "basement", "cabinet", "commercial"] as const;

  // Per-service hrefs — deep-link the 4 services that have dedicated
  // near-me sub-pages so each near-me page acquires inbound internal links
  // from its sister pages (2026-05-21 on-page scan flagged the 4 service
  // near-me pages as having weak_inbound_internal_links_within_audit_set).
  // cabinet + commercial fall back to /services/ since they don't have
  // near-me sub-pages.
  const serviceHref = (s: typeof services[number]): string => {
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
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10" style={{ color: TEXT_MID }}>
            {t("hero.subtitle")}
          </p>
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

      {/* Services */}
      <section className="py-16" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>
            {t("services.heading")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s}
                className="p-6 rounded-2xl"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
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
            ))}
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
