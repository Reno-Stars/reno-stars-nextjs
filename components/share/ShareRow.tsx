'use client';

import { useState, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { CARD, GOLD, TEXT, SH_DARK, neu } from '@/lib/theme';
import type { ShareTarget } from '@/lib/share/types';
import ShareButton from './ShareButton';

interface ShareRowProps {
  visible: ShareTarget[];
  overflow: ShareTarget[];
  hrefFor: (target: ShareTarget) => string;
  copiedId: string | null;
  onActivate: (target: ShareTarget, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * The labelled horizontal row that closes out an article — the shape from the
 * reference design, rebuilt on the warm neumorphic palette rather than copied.
 */
export default function ShareRow({ visible, overflow, hrefFor, copiedId, onActivate }: ShareRowProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? [...visible, ...overflow] : visible;

  return (
    <section aria-labelledby="share-row-heading" className="mt-10">
      <div className="w-10 h-px mb-3" style={{ backgroundColor: SH_DARK }} aria-hidden="true" />
      <h2
        id="share-row-heading"
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: GOLD }}
      >
        {t('share.heading')}
      </h2>

      <div id="share-row-targets" className="flex flex-wrap gap-2">
        {shown.map((target) => (
          <ShareButton
            key={target.id}
            target={target}
            href={hrefFor(target)}
            showLabel
            copied={copiedId === target.id}
            onActivate={onActivate}
          />
        ))}

        {overflow.length > 0 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-controls="share-row-targets"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{ backgroundColor: CARD, color: TEXT, boxShadow: neu(3) }}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{t('share.more', { count: overflow.length })}</span>
          </button>
        )}
      </div>
    </section>
  );
}
