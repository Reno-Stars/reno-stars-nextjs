'use client';

import { GalleryItem } from '@/lib/data';
import { CSSProperties, KeyboardEvent } from 'react';

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

interface TetrisGalleryProps {
  items: GalleryItem[];
  cardClassName?: string;
  cardStyle?: CSSProperties;
  imageClassName?: string;
  overlayClassName?: string;
  onItemClick?: (item: GalleryItem, index: number) => void;
}

export default function TetrisGallery({ items, cardClassName = '', cardStyle = {}, imageClassName = '', overlayClassName = '', onItemClick }: TetrisGalleryProps) {
  const handleKeyDown = (e: KeyboardEvent, item: GalleryItem, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick?.(item, index);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" role="list" aria-label="Project gallery">
      {items.map((item, index) => {
        const layout = layouts[index % layouts.length];
        const altText = item.title || item.category || `Gallery image ${index + 1}`;

        return (
          <div
            key={index}
            className={`${layout.col} ${layout.aspect} overflow-hidden cursor-pointer relative group ${cardClassName} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8922A]`}
            style={cardStyle}
            role="listitem"
            tabIndex={0}
            onClick={() => onItemClick?.(item, index)}
            onKeyDown={(e) => handleKeyDown(e, item, index)}
            aria-label={altText}
          >
            <img
              src={item.image}
              alt={altText}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageClassName}`}
              loading="lazy"
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
