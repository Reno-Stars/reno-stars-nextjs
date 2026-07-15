'use client';

import { useState, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal } from 'lucide-react';
import { CARD, TEXT, neu } from '@/lib/theme';
import type { ShareTarget } from '@/lib/share/types';
import ShareButton from './ShareButton';

interface ShareRailProps {
  visible: ShareTarget[];
  overflow: ShareTarget[];
  hrefFor: (target: ShareTarget) => string;
  copiedId: string | null;
  onActivate: (target: ShareTarget, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * The sticky icon rail beside the article.
 *
 * `fixed` rather than positioned against the article container: the article is
 * `max-w-4xl`, so container-relative placement collides with the text at
 * narrower desktop widths. Gated at `xl` so there is provably gutter to sit in.
 *
 * Uses logical `start-*` so it flips to the right edge automatically under
 * `dir="rtl"` (fa, ar) — see isRtl() in i18n/config.
 */
export default function ShareRail({ visible, overflow, hrefFor, copiedId, onActivate }: ShareRailProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? [...visible, ...overflow] : visible;

  return (
    <aside
      aria-labelledby="share-rail-heading"
      // max-h + scroll so a long list can never overflow a short laptop
      // viewport; the padding keeps the neumorphic shadows from being clipped.
      className="hidden xl:flex fixed top-1/2 -translate-y-1/2 start-4 z-40 flex-col gap-2 max-h-[80vh] overflow-y-auto p-2"
    >
      <h2 id="share-rail-heading" className="sr-only">{t('share.heading')}</h2>

      {shown.map((target) => (
        <ShareButton
          key={target.id}
          target={target}
          href={hrefFor(target)}
          showLabel={false}
          copied={copiedId === target.id}
          onActivate={onActivate}
        />
      ))}

      {overflow.length > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          aria-label={t('share.more', { count: overflow.length })}
          className="w-11 h-11 inline-flex items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          style={{ backgroundColor: CARD, color: TEXT, boxShadow: neu(3) }}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
