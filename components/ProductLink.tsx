'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { GOLD, GOLD_PALE } from '@/lib/theme';

interface ProductLinkProps {
  product: { url: string; image_url?: string; label: string };
  /** Size variant - 'sm' for modal, 'md' for detail page */
  size?: 'sm' | 'md';
}

/**
 * Product link with hover image preview.
 * Shows a larger preview of the product image when hovering.
 */
export default function ProductLink({ product, size = 'md' }: ProductLinkProps) {
  const [showPreview, setShowPreview] = useState(false);

  const isSmall = size === 'sm';

  return (
    <div className="relative">
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center ${isSmall ? 'rounded-lg' : 'rounded-xl'} font-medium transition-colors hover:brightness-95`}
        style={{
          backgroundColor: GOLD_PALE,
          color: GOLD,
          gap: isSmall ? '0.5rem' : '0.75rem',
          padding: isSmall ? '0.375rem 0.75rem' : '0.625rem 1rem',
          fontSize: isSmall ? '0.75rem' : '0.875rem',
        }}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        {product.image_url && (
          <div
            className="rounded overflow-hidden flex-shrink-0 bg-white"
            style={{
              width: isSmall ? '1.5rem' : '2.5rem',
              height: isSmall ? '1.5rem' : '2.5rem',
              borderRadius: isSmall ? '0.25rem' : '0.5rem',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image_url} alt={product.label} className="w-full h-full object-cover" />
          </div>
        )}
        <span className={`flex-1 ${isSmall ? 'truncate' : ''}`}>{product.label}</span>
        <ExternalLink className={`flex-shrink-0 ${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </a>

      {/* Hover preview - positioned above the link */}
      {showPreview && product.image_url && (
        <div
          className="absolute left-0 bottom-full mb-2 z-[100] p-2 rounded-xl pointer-events-none"
          style={{ backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.label}
            className="object-contain rounded-lg"
            style={{ width: isSmall ? '10rem' : '12rem', height: isSmall ? '10rem' : '12rem' }}
          />
        </div>
      )}
    </div>
  );
}
