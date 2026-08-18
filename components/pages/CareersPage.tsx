import { useTranslations } from "next-intl";
import { telHref } from '@/lib/phone';
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
  GraduationCap,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  NAVY,
  GOLD,
  GOLD_ON_DARK,
  GOLD_PALE,
  SURFACE_ALT,
  CARD,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
  neu,
} from "@/lib/theme";
import { WECHAT_ID, RECRUITING_EMAIL } from "@/lib/company-config";

interface CareersPageProps {
  locale: Locale;
  phone: string;
}

// Renovation Worker — the original role. Its keys stay at the top level of the
// `careers` namespace (role / duties / requirements) so the 13 translated
// locales keep the strings they already have; moving them would orphan every
// translation and send them back through machine translation.
export const DUTY_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"] as const;
export const REQ_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;

// Project Coordinator — added 2026-08-17, nested under `careers.coordinator`.
export const COORD_DUTY_KEYS = ["d1", "d2", "d3", "d4", "d5"] as const;
export const COORD_REQ_KEYS = ["r1", "r2", "r3", "r4", "r5"] as const;

const WHY_KEYS = ["w1", "w2", "w3", "w4"] as const;
const WHY_ICONS = { w1: CalendarCheck, w2: ShieldCheck, w3: Languages, w4: TrendingUp } as const;

interface RoleBlockProps {
  title: string;
  type: string;
  typeLabel: string;
  location: string;
  locationLabel: string;
  pay: string;
  payLabel: string;
  dutiesTitle: string;
  duties: string[];
  requirementsTitle: string;
  requirements: string[];
  /** Optional callout under the summary tiles (language preference, paid training…). */
  highlight?: string;
}

function RoleBlock({
  title,
  type,
  typeLabel,
  location,
  locationLabel,
  pay,
  payLabel,
  dutiesTitle,
  duties,
  requirementsTitle,
  requirements,
  highlight,
}: RoleBlockProps) {
  const facts = [
    { icon: Clock, label: typeLabel, value: type },
    { icon: MapPin, label: locationLabel, value: location },
    { icon: Banknote, label: payLabel, value: pay },
  ];

  return (
    <section className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: CARD, boxShadow: neu(6) }}>
      <h3 className="text-2xl font-bold mb-5" style={{ color: NAVY }}>{title}</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl p-4" style={{ backgroundColor: SURFACE_ALT }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-4 h-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>{label}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: TEXT }}>{value}</p>
          </div>
        ))}
      </div>

      {highlight && (
        <p
          className="mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ backgroundColor: GOLD_PALE, color: NAVY }}
        >
          <GraduationCap className="w-5 h-5 mt-px shrink-0" style={{ color: GOLD }} aria-hidden="true" />
          <span>{highlight}</span>
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-7">
        <div>
          <h4 className="text-lg font-bold mb-4" style={{ color: NAVY }}>{dutiesTitle}</h4>
          <ul className="space-y-3">
            {duties.map((duty) => (
              <li key={duty} className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                <span className="text-sm" style={{ color: TEXT_MID }}>{duty}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4" style={{ color: NAVY }}>{requirementsTitle}</h4>
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                <span className="text-sm" style={{ color: TEXT_MID }}>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function CareersPage({ locale, phone }: CareersPageProps) {
  const t = useTranslations("careers");
  const tel = telHref(phone);

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
        {/* Open roles */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center" style={{ color: NAVY }}>{t("openRoles.title")}</h2>

          <RoleBlock
            title={t("role.title")}
            type={t("role.type")}
            typeLabel={t("role.typeLabel")}
            location={t("role.location")}
            locationLabel={t("role.locationLabel")}
            pay={t("role.pay")}
            payLabel={t("role.payLabel")}
            dutiesTitle={t("duties.title")}
            duties={DUTY_KEYS.map((k) => t(`duties.items.${k}`))}
            requirementsTitle={t("requirements.title")}
            requirements={REQ_KEYS.map((k) => t(`requirements.items.${k}`))}
            highlight={t("requirements.languageHighlight")}
          />

          <RoleBlock
            title={t("coordinator.title")}
            type={t("coordinator.type")}
            typeLabel={t("role.typeLabel")}
            location={t("coordinator.location")}
            locationLabel={t("role.locationLabel")}
            pay={t("coordinator.pay")}
            payLabel={t("role.payLabel")}
            dutiesTitle={t("duties.title")}
            duties={COORD_DUTY_KEYS.map((k) => t(`coordinator.duties.items.${k}`))}
            requirementsTitle={t("requirements.title")}
            requirements={COORD_REQ_KEYS.map((k) => t(`coordinator.requirements.items.${k}`))}
            highlight={t("coordinator.highlight")}
          />
        </section>

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
              href={tel}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: GOLD_ON_DARK, color: NAVY }}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {t("apply.call")}: {phone}
            </a>
            <a
              href={`mailto:${RECRUITING_EMAIL}?subject=${encodeURIComponent(t("apply.emailSubject"))}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-white/25 text-white transition-transform hover:scale-[1.02]"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {t("apply.email")}
            </a>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/70">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {t("apply.wechat")}: <span className="font-semibold text-white">{WECHAT_ID}</span> — {t("apply.wechatNote")}
          </p>
        </section>
      </div>
    </main>
  );
}
