"use client";

import { useTranslations } from "next-intl";
import {
  CreditCard,
  Home,
  Landmark,
  PiggyBank,
  Calculator,
  CheckCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Link } from "@/navigation";
import CTASection from "@/components/CTASection";
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
  STEP_TEAL,
  STEP_TEAL_LIGHT,
  STEP_ORANGE,
  STEP_ORANGE_LIGHT,
  STEP_GREEN,
  STEP_GREEN_LIGHT,
  STEP_RED,
  STEP_RED_LIGHT,
} from "@/lib/theme";

interface FinancingPageProps {
  locale: Locale;
}

export default function FinancingPage({ locale: _locale }: FinancingPageProps) {
  const t = useTranslations("financing");
  const tCta = useTranslations("cta");

  const financingOptions = [
    {
      key: "heloc",
      icon: Home,
      accent: STEP_TEAL,
      accentLight: STEP_TEAL_LIGHT,
    },
    {
      key: "personalLoan",
      icon: CreditCard,
      accent: STEP_ORANGE,
      accentLight: STEP_ORANGE_LIGHT,
    },
    {
      key: "refinance",
      icon: Landmark,
      accent: STEP_GREEN,
      accentLight: STEP_GREEN_LIGHT,
    },
    {
      key: "savings",
      icon: PiggyBank,
      accent: STEP_RED,
      accentLight: STEP_RED_LIGHT,
    },
  ];

  const budgetTips = [
    { key: "prioritize", icon: CheckCircle },
    { key: "contingency", icon: CheckCircle },
    { key: "phased", icon: CheckCircle },
    { key: "quotes", icon: CheckCircle },
    { key: "permits", icon: CheckCircle },
    { key: "roi", icon: CheckCircle },
  ];

  const costRanges = [
    { key: "bathroom", range: "$10,000 – $60,000" },
    { key: "kitchen", range: "$15,000 – $72,000" },
    { key: "basement", range: "$25,000 – $80,000" },
    { key: "wholeHouse", range: "$50,000 – $200,000+" },
    { key: "commercial", range: "$8,000 – $360,000+" },
  ];

  return (
    <main>
      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: SURFACE }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: NAVY }}
          >
            {t("hero.title")}
          </h1>
          <p
            className="text-lg mb-8"
            style={{ color: TEXT_MID }}
          >
            {t("hero.subtitle")}
          </p>
          {/* Trust signals below hero subtitle. Three pivots feeding
              the financing-page conversion path — before a reader
              borrows money to renovate they want to evaluate the
              business along three dimensions:
              (1) /reviews/ — 5/5 rollout complete (siblings 7a8d289
                  ServiceDetailPage, 62350e1 AreaPage, 8503156
                  HomePage, 7f354b7 BlogPostPage). Reviews drive the
                  high-friction borrowing decision.
              (2) /about/ — 5/5 rollout complete (siblings e1b3193
                  Home, 5260a96 Service, b115e67 Area, d0b9572 Blog).
                  Company credibility.
              (3) /showroom/ — added on seo/daily-2026-06-01 as the
                  5th and FINAL surface in the /showroom/ inbound
                  rollout (siblings: HomePage ShowroomSection
                  baseline, AreaPage 50ed7e1, ServiceDetailPage
                  d308538, BlogPostPage e72b6f2). Pre-rollout audit
                  found /showroom/ had ONLY 1 inbound site-wide.
                  "Visit our showroom" is high-conversion local-SEO
                  trust signal — pre-borrowing readers often want to
                  see physical evidence before committing to a quote.
                  CLOSES /showroom/ rollout 5/5 and marks the 5-of-5-
                  rollouts milestone on seo/daily-2026-06-01.
              All three share one paragraph separated by `·` so the
              hero stays compact — same density pattern as the chips
              row in AreaPage Contextual Internal Links and the
              BlogPostPage secondary CTA (e72b6f2). */}
          <p className="text-sm mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1" style={{ color: TEXT_MID }}>
            <Link
              href="/reviews"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              See what our 70+ Vancouver renovation clients say →
            </Link>
            <span aria-hidden="true" className="hidden sm:inline" style={{ color: TEXT_MUTED }}>·</span>
            <Link
              href="/about"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              {tCta('aboutTagline')}
            </Link>
            <span aria-hidden="true" className="hidden sm:inline" style={{ color: TEXT_MUTED }}>·</span>
            <Link
              href="/showroom"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              {tCta('showroomTagline')}
            </Link>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: t("stats.avgKitchen"), value: "$30K" },
              { label: t("stats.avgBathroom"), value: "$25K" },
              { label: t("stats.financingOptions"), value: "4+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <div
                  className="text-lg md:text-xl font-bold"
                  style={{ color: GOLD }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: TEXT_MUTED }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: SURFACE_ALT }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2 text-center"
            style={{ color: TEXT }}
          >
            {t("options.title")}
          </h2>
          <p
            className="text-center mb-8"
            style={{ color: TEXT_MID }}
          >
            {t("options.subtitle")}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {financingOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: CARD, boxShadow: neu() }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: option.accentLight }}
                  >
                    <Icon
                      size={20}
                      style={{ color: option.accent }}
                    />
                  </div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: TEXT }}
                  >
                    {t(`options.${option.key}.title`)}
                  </h3>
                  <div
                    className="text-sm font-semibold mb-2"
                    style={{ color: GOLD }}
                  >
                    {t(`options.${option.key}.rate`)}
                  </div>
                  <p
                    className="text-sm mb-3"
                    style={{ color: TEXT_MID }}
                  >
                    {t(`options.${option.key}.description`)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: STEP_GREEN_LIGHT,
                        color: STEP_GREEN,
                      }}
                    >
                      {t(`options.${option.key}.pro`)}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: STEP_RED_LIGHT,
                        color: STEP_RED,
                      }}
                    >
                      {t(`options.${option.key}.con`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* /workflow/ inbound CTA — CLOSES the /workflow/ inbound
              rollout 5/5 (siblings: AreaPage processLinkText baseline,
              ServiceDetailPage 0e6a6e8, HomePage ServicesSection
              568128d, BlogPostPage be1d0d5). Pre-fix FinancingPage had
              ZERO /workflow/ body refs. Semantic fit: this section
              answers "how to pay"; the natural next question after
              choosing a financing option is "what happens once I'm
              approved?" — exactly what /workflow/ documents (7-step
              quote → handover process). Bridges the payment-to-
              execution flow on the financing money page. */}
          <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
            Approved? See{' '}
            <Link
              href="/workflow"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              how our renovation process delivers your project →
            </Link>
          </p>
          {/* /areas/ aggregation link — CLOSES /areas/ inbound rollout
              5/5 on the seo/daily-2026-06-02 daily branch. Sibling
              commits: HomePage AreasLinkSection adbe51b (PR #103),
              AreaPage Contextual Internal Links chip 3f7920a (PR #103),
              ServiceDetailPage Areas We Serve 1d5e88c (PR #103),
              BlogPostPage Related Areas 8f345f9 (this daily branch).
              Pre-rollout audit (2026-05-31) found /areas/ canonical
              directory had ZERO body refs site-wide. Semantic fit:
              financing-page readers planning their renovation often
              want to confirm we serve their specific area before
              committing to a quote — exactly what /areas/ answers.
              This marks the 6-of-6 INTERNAL-LINK ROLLOUTS MILESTONE
              now that all 6 dimensions (financing, reviews, about,
              workflow, showroom, areas) are at 5/5 across body
              content. */}
          <p className="text-center mt-2 text-sm" style={{ color: TEXT_MID }}>
            Wondering which areas we serve?{' '}
            <Link
              href="/areas"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              {tCta('serviceAreasTagline')}
            </Link>
          </p>
        </div>
      </section>

      {/* Cost Overview by Project Type */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: SURFACE }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2 text-center"
            style={{ color: TEXT }}
          >
            {t("costs.title")}
          </h2>
          <p
            className="text-center mb-8"
            style={{ color: TEXT_MID }}
          >
            {t("costs.subtitle")}
          </p>
          <div className="grid gap-3">
            {costRanges.map((cost) => (
              <div
                key={cost.key}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <div className="flex items-center gap-3">
                  <Calculator
                    size={18}
                    style={{ color: GOLD }}
                  />
                  <span
                    className="font-semibold"
                    style={{ color: TEXT }}
                  >
                    {t(`costs.${cost.key}`)}
                  </span>
                </div>
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                >
                  {cost.range}
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-xs text-center mt-4"
            style={{ color: TEXT_MUTED }}
          >
            {t("costs.disclaimer")}
          </p>
        </div>
      </section>

      {/* Budget Planning Tips */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: SURFACE_ALT }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2 text-center"
            style={{ color: TEXT }}
          >
            {t("tips.title")}
          </h2>
          <p
            className="text-center mb-8"
            style={{ color: TEXT_MID }}
          >
            {t("tips.subtitle")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {budgetTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.key}
                  className="rounded-xl p-5 flex gap-4"
                  style={{ backgroundColor: CARD, boxShadow: neu() }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon
                      size={20}
                      style={{ color: GOLD }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-bold mb-1"
                      style={{ color: TEXT }}
                    >
                      {t(`tips.${tip.key}.title`)}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: TEXT_MID }}
                    >
                      {t(`tips.${tip.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="py-14 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: SURFACE }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: TEXT }}
          >
            {t("faqSection.title")}
          </h2>
          <div className="space-y-4">
            {(["q1", "q2", "q3", "q4", "q5"] as const).map((key) => (
              <details
                key={key}
                className="rounded-xl p-5 group"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <summary
                  className="font-bold cursor-pointer list-none flex items-center justify-between"
                  style={{ color: TEXT }}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle
                      size={18}
                      style={{ color: GOLD }}
                    />
                    {t(`faq.${key}`)}
                  </span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-open:rotate-90"
                    style={{ color: GOLD }}
                  />
                </summary>
                <p
                  className="mt-3 text-sm"
                  style={{ color: TEXT_MID }}
                >
                  {t(`faq.${key}Answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Guides — the highest-intent inbound surface for the cost-guide
          cluster. A user reading /financing/ is explicitly thinking about
          how to PAY for a renovation; the most logical next step is "what
          does it actually cost?". Mirrors the BlogPostPage + AreaPage +
          HomePage cost-guide cross-link pattern. Closes the
          finance-page-to-cost-guide funnel gap. Labels EN-only matches the
          BlogPostPage precedent. */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            {tCta('realCostsTagline')}
          </h2>
          <p className="text-base text-center mb-8 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
            Before you finalize financing, know the real price tier — from 100+ completed Metro Vancouver projects.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { slug: "kitchen-renovation-cost-vancouver", label: "Kitchen Renovation Cost" },
              { slug: "bathroom-renovation-cost-vancouver", label: "Bathroom Renovation Cost" },
              { slug: "basement-renovation-cost-vancouver", label: "Basement Renovation Cost" },
              { slug: "whole-house-renovation-cost-vancouver", label: "Whole-House Renovation Cost" },
              { slug: "commercial-renovation-cost-vancouver", label: "Commercial Renovation Cost" },
              { slug: "cabinet-refinishing-cost-vancouver", label: "Cabinet Refinishing Cost" },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}` as "/guides/kitchen-renovation-cost-vancouver"}
                className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
              >
                {g.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2026-06-25: Blog cross-links from FinancingPage. Closes the loop
          from 200 blog posts → FinancingPage ← FinancingPage → related blog posts.
          Passes PageRank back to renovation-financing-vancouver-heloc,
          tax-credits, ROI, and contractor selection posts. */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center" style={{ color: TEXT }}>
            Related Guides
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'HELOC & Home Equity Loans' },
              { href: '/blog/basement-renovation-financing-bc-guide', label: 'BC Renovation Financing' },
              { href: '/blog/vancouver-renovation-tax-credits-rebates-2026', label: 'Tax Credits & Rebates' },
              { href: '/blog/rental-property-renovation-vancouver-roi', label: 'Rental Property ROI' },
              { href: '/blog/renovation-cost-vancouver-2026-complete-guide', label: '2026 Cost Guide' },
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'Choosing a Contractor' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href as '/blog/renovation-financing-vancouver-heloc'}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading={t("cta.heading")}
        subtitle={t("cta.subtitle")}
      />
    </main>
  );
}
