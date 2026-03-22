'use client';

import { CSSProperties, KeyboardEvent } from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';

export const tetrisLayouts = [
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
  { col: '', aspect: 'aspect-square' },
  { col: 'col-span-2', aspect: 'aspect-[2/1]' },
  { col: '', aspect: 'aspect-square' },
];

export interface TetrisGalleryItem {
  image: string;
  title: string;
  category?: string;
  href?: string;
}

interface TetrisGalleryProps {
  items: TetrisGalleryItem[];
  cardClassName?: string;
  cardStyle?: CSSProperties;
  imageClassName?: string;
  overlayClassName?: string;
  onItemClick?: (item: TetrisGalleryItem, index: number) => void;
}

export default function TetrisGallery({ items, cardClassName = '', cardStyle = {}, imageClassName = '', overlayClassName = '', onItemClick }: TetrisGalleryProps) {
  const handleKeyDown = (e: KeyboardEvent, item: TetrisGalleryItem, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick?.(item, index);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" role="list" aria-label="Project gallery">
      {items.map((item, index) => {
        const layout = tetrisLayouts[index % tetrisLayouts.length];
        const altText = item.title || item.category || 'Renovation project showcase';
        const isWide = layout.col === 'col-span-2';
        const sizes = isWide
          ? '(max-width: 768px) 100vw, 50vw'
          : '(max-width: 768px) 50vw, 25vw';

        const isInteractive = !!onItemClick;
        const hasLink = !!item.href;

        const content = (
          <>
            <Image
              src={item.image}
              alt={altText}
              fill
              sizes={sizes}
              loading="lazy"
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${imageClassName}`}
            />
            {(item.title || item.category) && (
              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-end ${overlayClassName}`} aria-hidden="true">
                <div className="p-2 sm:p-4 text-white">
                  {item.title && <h3 className="text-sm sm:text-lg font-bold">{item.title}</h3>}
                  {item.category && item.category !== item.title && <p className="text-sm text-white/80">{item.category}</p>}
                </div>
              </div>
            )}
          </>
        );

        const className = `${layout.col} ${layout.aspect} overflow-hidden relative group ${cardClassName} ${(isInteractive || hasLink) ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold' : ''}`;

        if (hasLink) {
          return (
            <Link
              key={`${item.image}-${item.title}`}
              href={item.href!}
              className={className}
              style={cardStyle}
              role="listitem"
              aria-label={altText}
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={`${item.image}-${item.title}`}
            className={className}
            style={cardStyle}
            role="listitem"
            tabIndex={isInteractive ? 0 : undefined}
            onClick={isInteractive ? () => onItemClick?.(item, index) : undefined}
            onKeyDown={isInteractive ? (e) => handleKeyDown(e, item, index) : undefined}
            aria-label={altText}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
