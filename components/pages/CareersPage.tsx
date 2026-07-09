"use client";

import { useTranslations } from "next-intl";
import {
  Hammer,
  Languages,
  ShieldCheck,
  TrendingUp,
  CalendarCheck,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  MapPin,
  Clock,
  Banknote,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  NAVY,
  GOLD,
  GOLD_PALE,
  SURFACE_ALT,
  CARD,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
  neu,
} from "@/lib/theme";
import { wechatId } from "@/components/Footer";

interface CareersPageProps {
  locale: Locale;
  phone: string;
  email: string;
}

const DUTY_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"] as const;
const REQ_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;
const WHY_KEYS = ["w1", "w2", "w3", "w4"] as const;
const WHY_ICONS = { w1: CalendarCheck, w2: ShieldCheck, w3: Languages, w4: TrendingUp } as const;

export default function CareersPage({ locale, phone, email }: CareersPageProps) {
  const t = useTranslations("careers");
  const telHref = `tel:+1${phone.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: SURFACE_ALT }} data-locale={locale}>
      {/* Hero */}
      <section className="px-4 pt-14 pb-10 text-center">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
          style={{ backgroundColor: GOLD_PALE, color: NAVY }}
        >
          <Hammer className="w-4 h-4" style={{ color: GOLD }} aria-hidden="true" />
          {t("hero.badge")}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold max-w-3xl mx-auto" style={{ color: NAVY }}>
          {t("hero.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
          {t("hero.subtitle")}
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Role summary card */}
        <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-5" style={{ color: NAVY }}>{t("role.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, label: t("role.typeLabel"), value: t("role.type") },
              { icon: MapPin, label: t("role.locationLabel"), value: t("role.location") },
              { icon: Banknote, label: t("role.payLabel"), value: t("role.pay") },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: SURFACE_ALT }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>{label}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: TEXT }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Duties + Requirements */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: NAVY }}>{t("duties.title")}</h2>
            <ul className="space-y-3">
              {DUTY_KEYS.map((k) => (
                <li key={k} className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: TEXT_MID }}>{t(`duties.items.${k}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: NAVY }}>{t("requirements.title")}</h2>
            <ul className="space-y-3">
              {REQ_KEYS.map((k) => (
                <li key={k} className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: TEXT_MID }}>{t(`requirements.items.${k}`)}</span>
                </li>
              ))}
            </ul>
            <p
              className="mt-5 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ backgroundColor: GOLD_PALE, color: NAVY }}
            >
              {t("requirements.languageHighlight")}
            </p>
          </section>
        </div>

        {/* Why us */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: NAVY }}>{t("whyUs.title")}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_KEYS.map((k) => {
              const Icon = WHY_ICONS[k];
              return (
                <div key={k} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu(5) }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: GOLD_PALE }}
                  >
                    <Icon className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1.5" style={{ color: NAVY }}>{t(`whyUs.items.${k}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`whyUs.items.${k}.body`)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Apply */}
        <section className="rounded-2xl p-6 sm:p-10 text-center" style={{ backgroundColor: NAVY, boxShadow: neu(6) }}>
          <h2 className="text-2xl font-bold mb-3 text-white">{t("apply.title")}</h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto mb-7 text-white/80">{t("apply.body")}</p>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto">
            <a
              href={telHref}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {t("apply.call")}: {phone}
            </a>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(t("apply.emailSubject"))}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-white/25 text-white transition-transform hover:scale-[1.02]"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {t("apply.email")}
            </a>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/70">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {t("apply.wechat")}: <span className="font-semibold text-white">{wechatId}</span> — {t("apply.wechatNote")}
          </p>
        </section>
      </div>
    </main>
  );
}
