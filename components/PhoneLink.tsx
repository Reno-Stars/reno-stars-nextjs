'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { trackPhoneClick } from '@/lib/analytics';

type PhoneLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** The `tel:` href, rendered exactly as passed. */
  href: string;
  /** Number reported as `phone_number`. Defaults to the href minus `tel:`. */
  phone?: string;
  /** Where on the page the link sits, reported as `link_location`. */
  trackingLocation?: string;
};

/**
 * Click-to-call link that records a GA4 `phone_click` (plus the Google Ads call
 * conversion) before the dialer opens. It renders the same `<a>` the caller
 * would have written: every anchor prop passes through untouched, and the two
 * tracking props are consumed here, so the server HTML is identical to a plain
 * `<a href="tel:…">` (onClick never reaches the markup).
 *
 * Navigation is never delayed or prevented — a `tel:` link does not unload the
 * page, and the event uses the beacon transport (lib/analytics.ts). gtag.js
 * stays deferred to first interaction (lib/analytics-loader.ts); the tap that
 * reaches this handler is itself that interaction, so `window.gtag` exists and
 * the event is queued until gtag.js finishes loading.
 */
export default function PhoneLink({ phone, trackingLocation, onClick, children, ...anchorProps }: PhoneLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    trackPhoneClick(phone ?? anchorProps.href.replace(/^tel:/i, ''), trackingLocation);
  };

  return (
    <a {...anchorProps} onClick={handleClick}>
      {children}
    </a>
  );
}
