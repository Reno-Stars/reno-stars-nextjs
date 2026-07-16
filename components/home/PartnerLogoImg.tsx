'use client';

import type { DisplayVariant } from '@/lib/image';

interface PartnerLogoImgProps {
  variant: DisplayVariant;
  rawSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Partner-logo <img> with an optimizer-failure fallback: if the /api/image
 * variant errors (optimizer down, source fetch failed), clear the srcSet and
 * swap to the raw R2 URL — mirroring OptimizedImage's fallback philosophy —
 * so a broken-image icon never renders in the marquee. PartnersSection is a
 * server component, so onError needs this small client boundary.
 */
export default function PartnerLogoImg({ variant, rawSrc, alt, width, height, className, loading }: PartnerLogoImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant.src}
      srcSet={variant.srcSet}
      sizes={variant.sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={(e) => {
        const img = e.currentTarget;
        // dataset flag guards the swap: if the raw URL also fails (or the
        // variant already WAS the raw src), don't loop on further errors.
        if (img.dataset.fallback || img.src === rawSrc) return;
        img.dataset.fallback = '1';
        img.srcset = '';
        img.removeAttribute('sizes');
        img.src = rawSrc;
      }}
    />
  );
}
