'use client';

import { useState, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { CARD, TEXT, GOLD, neu, neuIn } from '@/lib/theme';
import type { ShareTarget } from '@/lib/share/types';
import { BRAND_HEX } from './ShareIcons';

/** Targets whose own label already reads as an action ("Copy link", "Email").
 *  Wrapping these in "Share on …" produces nonsense like "Share on Copy link". */
const SELF_LABELLING = new Set(['copy', 'native', 'email', 'sms']);

interface ShareButtonProps {
  target: ShareTarget;
  href: string;
  /** Render the text label beside the icon (row) or icon-only (rail). */
  showLabel: boolean;
  copied: boolean;
  onActivate: (target: ShareTarget, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * One share button. Knows about icons, labels and press states — nothing about
 * which platforms exist or who should see them. Always a real `<a href>`: works
 * with JS disabled, survives right-click and middle-click, and `nofollow` keeps
 * ~20 outbound links per page from leaking link equity.
 */
export default function ShareButton({ target, href, showLabel, copied, onActivate }: ShareButtonProps) {
  const t = useTranslations();
  const [active, setActive] = useState(false);
  const Icon = target.icon;

  const label = t(target.labelKey);
  const ariaLabel = copied
    ? t('share.copied')
    : SELF_LABELLING.has(target.id)
      ? label
      : t('share.shareOn', { platform: label });

  return (
    <a
      href={href}
      target={target.mode === 'newTab' ? '_blank' : undefined}
      rel="noopener nofollow"
      aria-label={ariaLabel}
      onClick={(e) => onActivate(target, e)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 ${
        showLabel ? 'px-3 py-2 text-sm font-medium' : 'w-11 h-11'
      }`}
      style={{
        backgroundColor: CARD,
        // Icons sit monochrome navy at rest and tint to the brand colour on
        // hover: 18 brand colours at once would shout over the warm palette.
        color: copied ? GOLD : active ? BRAND_HEX[target.id] ?? TEXT : TEXT,
        boxShadow: active ? neuIn(3) : neu(3),
        // @ts-expect-error -- custom property for the focus ring
        '--tw-ring-color': GOLD,
      }}
    >
      {copied ? (
        <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
      ) : (
        <Icon className="w-5 h-5 shrink-0" />
      )}
      {showLabel && <span>{copied ? t('share.copied') : label}</span>}
    </a>
  );
}
