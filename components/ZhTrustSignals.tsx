import type { Locale } from '@/i18n/config';
import OptimizedImage from '@/components/OptimizedImage';
import { WECHAT_ID, brandDisplay } from '@/lib/company-config';
import { NAVY, GOLD, GOLD_PALE, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

/**
 * Chinese-market trust signals (competitor audit C3, 2026-07-10).
 *
 * The Chinese renovation audience buys on: license/insurance dollar figures,
 * warranty, review rating, and WeChat contact. These components surface those
 * signals prominently on zh / zh-Hant pages only — every other locale already
 * gets the equivalent EN trust badges (HeroSection badge row,
 * TrustBadgesSection) and renders nothing here.
 *
 * NO FABRICATION — every claim below already exists on the live site:
 * - 政府牌照注册  → "Licensed & Fully Insured (CGL + WCB)" (messages/en/footer.json
 *   `footer.licensedInsured`), "fully licensed" (messages/en/aboutPage.json a2)
 * - WCB工伤保险   → "Active WCB Coverage" (messages/en/stats.json `stats.wcbCoverage`)
 * - $500万商业责任险 → "$5M CGL Insurance" (`stats.liabilityCoverage`,
 *   COMPANY_STATS.liabilityCoverage = "$5M"); zh precedent "500 万加元 CGL 保险"
 * - 最长3年质保   → "Up to 3 Years Warranty" (`stats.fullCoverage`,
 *   COMPANY_STATS.warrantyYears = 3) — 最长 preserves the "up to" qualifier
 * - Google X.X星好评 → interpolated from the LIVE Google Places rating (same
 *   source as the hero star row); the segment is omitted when no rating is
 *   available so the line never claims a number we can't back.
 *
 * Brand: 聚星装修 / 聚星裝修 via brandDisplay() — owner rule (2026-07-09):
 * never literal-translate "Reno Stars"; always surface both names.
 */

const ZH_LOCALES = ['zh', 'zh-Hant'] as const;
type ZhLocale = (typeof ZH_LOCALES)[number];

function asZhLocale(locale: Locale): ZhLocale | null {
  return (ZH_LOCALES as readonly string[]).includes(locale) ? (locale as ZhLocale) : null;
}

const TRUST_SEGMENTS: Record<ZhLocale, readonly string[]> = {
  zh: ['政府牌照注册', 'WCB工伤保险', '$500万商业责任险', '最长3年质保'],
  'zh-Hant': ['政府牌照註冊', 'WCB工傷保險', '$500萬商業責任險', '最長3年質保'],
};

/** "Google 5.0星好评" — built from the live rating, never hardcoded. */
const RATING_SEGMENT: Record<ZhLocale, (rating: string) => string> = {
  zh: (rating) => `Google ${rating}星好评`,
  'zh-Hant': (rating) => `Google ${rating}星好評`,
};

/** The full trust line for a zh locale, or null for every other locale. */
export function zhTrustLine(locale: Locale, rating?: number): string | null {
  const zh = asZhLocale(locale);
  if (!zh) return null;
  const segments = [...TRUST_SEGMENTS[zh]];
  if (rating && rating > 0) segments.push(RATING_SEGMENT[zh](rating.toFixed(1)));
  return segments.join(' · ');
}

interface ZhTrustLineProps {
  locale: Locale;
  /** Live Google Places rating (same value the hero star row shows). */
  rating?: number;
}

/**
 * Slim navy trust band rendered directly under a page hero on zh/zh-Hant.
 * Renders nothing on all other locales. Pure (no hooks) so it works in both
 * server and client components.
 */
export default function ZhTrustLine({ locale, rating }: ZhTrustLineProps) {
  const line = zhTrustLine(locale, rating);
  if (!line) return null;
  return (
    <section aria-label={line} className="py-3 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
      <p className="max-w-7xl mx-auto text-center text-sm sm:text-base font-semibold tracking-wide text-white/95">
        <span aria-hidden className="mr-2" style={{ color: GOLD }}>✓</span>
        {line}
      </p>
    </section>
  );
}

const WECHAT_COPY: Record<ZhLocale, { title: string; scanHint: string; idLabel: string; qrAlt: string }> = {
  zh: {
    title: '微信咨询',
    scanHint: '扫码添加微信，中文免费咨询报价',
    idLabel: '微信号',
    qrAlt: '微信二维码',
  },
  'zh-Hant': {
    title: '微信諮詢',
    scanHint: '掃碼添加微信，中文免費諮詢報價',
    idLabel: '微信號',
    qrAlt: '微信二維碼',
  },
};

interface WeChatContactCardProps {
  locale: Locale;
  /** Compact inline strip (for CTA sections) instead of the full card. */
  compact?: boolean;
  /** Extra classes on the outer element (e.g. margins from the host layout). */
  className?: string;
}

/**
 * WeChat QR contact card for zh/zh-Hant users — reuses the existing
 * /wechat-qr.png asset and WECHAT_ID (footer SSOT). Renders nothing on all
 * other locales. Pure (no hooks) so it works in server and client components.
 */
export function WeChatContactCard({ locale, compact = false, className = '' }: WeChatContactCardProps) {
  const zh = asZhLocale(locale);
  if (!zh) return null;
  const copy = WECHAT_COPY[zh];
  const qrAlt = `${copy.qrAlt} — ${brandDisplay(locale)}`;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-4 rounded-xl p-3 pr-5 text-left ${className}`} style={{ boxShadow: neu(4), backgroundColor: CARD }}>
        <OptimizedImage
          src="/wechat-qr.png"
          alt={qrAlt}
          width={72}
          height={72}
          className="rounded-lg shrink-0 bg-white p-1"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: TEXT }}>
            {copy.title} · {brandDisplay(locale)}
          </p>
          <p className="text-sm" style={{ color: TEXT_MID }}>{copy.scanHint}</p>
          <p className="text-xs" style={{ color: TEXT_MUTED }}>{copy.idLabel}: {WECHAT_ID}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 flex items-start gap-4 ${className}`} style={{ boxShadow: neu(4), backgroundColor: CARD, borderLeft: `4px solid ${GOLD}` }}>
      <OptimizedImage
        src="/wechat-qr.png"
        alt={qrAlt}
        width={112}
        height={112}
        className="rounded-lg shrink-0 bg-white p-1"
      />
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD_PALE }}>
            {/* Simplified WeChat glyph — matches the footer icon language */}
            <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4" fill={GOLD}>
              <path d="M8.9 4C5.1 4 2 6.6 2 9.8c0 1.8 1 3.4 2.5 4.5l-.6 1.9 2.2-1.1c.6.2 1.2.3 1.9.3h.3a5 5 0 0 1-.2-1.4c0-3 2.9-5.4 6.4-5.4h.3C14.2 6 11.8 4 8.9 4zm-2.3 3.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.6 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM15.5 10c-3.1 0-5.6 2.1-5.6 4.7 0 2.6 2.5 4.7 5.6 4.7.6 0 1.1-.1 1.6-.2l1.9.9-.5-1.6c1.3-.9 2.1-2.2 2.1-3.8 0-2.6-2.5-4.7-5.1-4.7zm-2 2.6a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5zm4 0a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5z" />
            </svg>
          </span>
          <h3 className="text-base font-bold" style={{ color: TEXT }}>
            {copy.title} · {brandDisplay(locale)}
          </h3>
        </div>
        <p className="text-base mb-1" style={{ color: TEXT_MID }}>{copy.scanHint}</p>
        <p className="text-sm" style={{ color: TEXT_MUTED }}>{copy.idLabel}: {WECHAT_ID}</p>
      </div>
    </div>
  );
}
