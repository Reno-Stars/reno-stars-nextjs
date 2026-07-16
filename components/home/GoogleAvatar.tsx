'use client';

import { useState } from 'react';
import { NAVY } from '@/lib/theme';
import { buildDisplayVariant } from '@/lib/image';

export default function GoogleAvatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: NAVY }}>
        {name.charAt(0) || '?'}
      </div>
    );
  }

  // Route allowed-host avatars (R2-cached or lh3 Google) through the WebP optimizer:
  // resizes the 128px source down to the 36px display size and serves a ~3 KB WebP
  // with a 1-yr immutable cache instead of the raw ~30 KB uncached JPG. Unknown
  // hosts fall back to the raw src unchanged.
  const img = buildDisplayVariant(src, { widths: [72, 108], sizes: '36px', quality: 65 });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={img.sizes}
      alt={name}
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className="w-9 h-9 rounded-full object-cover shrink-0"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
