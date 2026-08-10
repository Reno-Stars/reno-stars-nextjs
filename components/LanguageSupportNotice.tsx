'use client';

import { useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { hasNativeSupport, type Locale } from '@/i18n/config';
import { CARD, TEXT_MID, neu } from '@/lib/theme';

interface LanguageSupportNoticeProps {
  locale: Locale;
  /**
   * Server-resolved language names — computed by the two ICU-formatting
   * helpers in lib/i18n/language-names.ts, in the Server Component (Node's
   * full ICU), never here. Browser Intl.DisplayNames/Intl.ListFormat coverage
   * is inconsistent across engines/OS builds and silently mis-resolves for
   * some locales (verified for `pa`: the display-name helper returned the raw
   * string 'en' instead of a formatted name, and the list-format helper
   * resolved to 'en-US'). This component must not import from
   * @/lib/i18n/language-names — see the regression test.
   */
  language: string;
  supported: string;
  className?: string;
}

/**
 * Tells a visitor, in their own language, that nobody on the team speaks it —
 * and which languages the team does cover. Renders nothing for en/zh/zh-Hant.
 *
 * Honesty before the form, not after: every locale is fully translated and
 * indexed, which reads as a promise of service in that language. This is the
 * correction, placed where the visitor is about to act on that assumption.
 *
 * `locale` is a prop rather than useLocale() to match WeChatContactCard next to
 * it, and because tests/setup.ts hard-mocks useLocale() to 'en'.
 *
 * Neutral TEXT_MID, not GOLD: gold is this design system's promotional accent
 * and this is not a promotion.
 */
export default function LanguageSupportNotice({
  locale,
  language,
  supported,
  className = '',
}: LanguageSupportNoticeProps) {
  const t = useTranslations('contact');

  if (hasNativeSupport(locale)) return null;

  return (
    <div
      className={`rounded-xl p-5 mb-6 flex items-start gap-3 ${className}`}
      style={{
        boxShadow: neu(4),
        backgroundColor: CARD,
        // Logical property, not borderLeft — fa and ar render RTL.
        borderInlineStart: `4px solid ${TEXT_MID}`,
      }}
    >
      <Languages
        size={20}
        aria-hidden="true"
        style={{ color: TEXT_MID, flexShrink: 0, marginTop: '0.15rem' }}
      />
      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
        {t('languageSupportNotice', { language, supported })}
      </p>
    </div>
  );
}
