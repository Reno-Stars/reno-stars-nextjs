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

      {/* CTA */}
      <CTASection
        heading={t("cta.heading")}
        subtitle={t("cta.subtitle")}
      />
    </main>
  );
}
