'use client';

import { CSSProperties, KeyboardEvent } from 'react';
import Image from 'next/image';

const layouts = [
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

interface LocalizedGalleryItem {
  image: string;
  title: string;
  category: string;
}

interface TetrisGalleryProps {
  items: LocalizedGalleryItem[];
  cardClassName?: string;
  cardStyle?: CSSProperties;
  imageClassName?: string;
  overlayClassName?: string;
  onItemClick?: (item: LocalizedGalleryItem, index: number) => void;
}

export default function TetrisGallery({ items, cardClassName = '', cardStyle = {}, imageClassName = '', overlayClassName = '', onItemClick }: TetrisGalleryProps) {
  const handleKeyDown = (e: KeyboardEvent, item: LocalizedGalleryItem, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick?.(item, index);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" role="list" aria-label="Project gallery">
      {items.map((item, index) => {
        const layout = layouts[index % layouts.length];
        const altText = item.title || item.category || 'Renovation project showcase';
        // col-span-2 items are twice as wide, need larger images
        const isWide = layout.col === 'col-span-2';
        const sizes = isWide
          ? '(max-width: 768px) 100vw, 50vw'
          : '(max-width: 768px) 50vw, 25vw';

        const isInteractive = !!onItemClick;

        return (
          <div
            key={`${item.image}-${item.title}`}
            className={`${layout.col} ${layout.aspect} overflow-hidden relative group ${cardClassName} ${isInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold' : ''}`}
            style={cardStyle}
            role="listitem"
            tabIndex={isInteractive ? 0 : undefined}
            onClick={isInteractive ? () => onItemClick(item, index) : undefined}
            onKeyDown={isInteractive ? (e) => handleKeyDown(e, item, index) : undefined}
            aria-label={altText}
          >
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
                <div className="p-4 text-white">
                  {item.title && <h3 className="text-lg font-bold">{item.title}</h3>}
                  {item.category && <p className="text-sm text-white/80">{item.category}</p>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
