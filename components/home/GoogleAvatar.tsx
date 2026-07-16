'use client';

import { useState } from 'react';
import { NAVY } from '@/lib/theme';
import { buildOptimizedUrl, ALLOWED_IMAGE_HOSTS } from '@/lib/image';

// Route allowed-host avatars (R2-cached or lh3 Google) through the WebP optimizer:
// resizes the 128px source down to the 36px display size and serves a ~3 KB WebP
// with a 1-yr immutable cache instead of the raw ~30 KB uncached JPG. Unknown
// hosts fall back to the raw src unchanged.
function optimize(src: string): { src: string; srcSet?: string; sizes?: string } {
  try {
    if (ALLOWED_IMAGE_HOSTS.includes(new URL(src).hostname)) {
      return {
        src: buildOptimizedUrl(src, 108, 65),
        srcSet: `${buildOptimizedUrl(src, 72, 65)} 72w, ${buildOptimizedUrl(src, 108, 65)} 108w`,
        sizes: '36px',
      };
    }
  } catch { /* malformed URL — use raw */ }
  return { src };
}

export default function GoogleAvatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: NAVY }}>
        {name.charAt(0) || '?'}
      </div>
    );
  }

  const img = optimize(src);

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
