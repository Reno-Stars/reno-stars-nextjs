'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Locale } from '@/i18n/config';
import { resolveTargets, splitVisible } from '@/lib/share/resolve';
import { useShare } from '@/hooks/useShare';
import type { ShareContentType, ShareContext } from '@/lib/share/types';
import ShareRail from './ShareRail';
import ShareRow from './ShareRow';

// ssr:false + dynamic: `qrcode` never enters the main bundle, and the 12
// locales whose matrix row has no WeChat button never download it at all.
const WeChatQrModal = dynamic(() => import('./WeChatQrModal'), { ssr: false });

interface ShareBarProps {
  locale: Locale;
  /** `url` must be the page's canonical — see buildAlternates() at the call site. */
  context: ShareContext;
  contentType: ShareContentType;
  /** Slug; becomes GA4's item_id. */
  itemId: string;
}

/**
 * The share bar. The only export any page should import.
 *
 * Renders both affordances on desktop: the rail catches the reader mid-scroll,
 * the row catches them at the end of the article. Below `xl` the rail is
 * display:none and the row carries it alone.
 */
export default function ShareBar({ locale, context, contentType, itemId }: ShareBarProps) {
  // `context` is a required prop, but tsconfig excludes tests/ from typecheck
  // and nothing stops a future JS caller — so a missing context must degrade to
  // "no share bar" rather than throw. A project page that renders without share
  // buttons is a small loss; one that 500s is a real one.
  const ctx: ShareContext = context ?? { url: '', title: '' };

  const { env, activate, hrefFor, copiedId, qrOpen, closeQr } = useShare({
    ctx,
    contentType,
    itemId,
  });

  const targets = useMemo(() => resolveTargets(locale, ctx, env), [locale, ctx, env]);
  const { visible, overflow } = useMemo(() => splitVisible(targets, env), [targets, env]);

  // Found by mode, not by id, so ShareBar stays ignorant of which platform
  // happens to use a QR.
  const qrTarget = useMemo(() => targets.find((t) => t.mode === 'qr'), [targets]);

  // Hooks above run unconditionally; the bail-out comes after them.
  if (!ctx.url || targets.length === 0) return null;

  const shared = { visible, overflow, hrefFor, copiedId, onActivate: activate };

  return (
    <>
      <ShareRail {...shared} />
      <ShareRow {...shared} />
      {qrOpen && qrTarget && <WeChatQrModal url={hrefFor(qrTarget)} onClose={closeQr} />}
    </>
  );
}
