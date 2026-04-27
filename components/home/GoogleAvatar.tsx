'use client';

import { useState } from 'react';
import { NAVY } from '@/lib/theme';

export default function GoogleAvatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: NAVY }}>
        {name.charAt(0) || '?'}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
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
