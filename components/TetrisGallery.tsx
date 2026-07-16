'use client';

import { CSSProperties, KeyboardEvent } from 'react';
import { Link } from '@/navigation';
import OptimizedImage from '@/components/OptimizedImage';

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
            <OptimizedImage
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

        // The inner element (link or div) carries the visual card; the grid child
        // is a role="listitem" wrapper so role="list" always has valid listitem
        // children (previously the linked <a> cells sat directly under role="list",
        // failing the "list must contain listitems" a11y/agentic-browsing audit).
        // Aspect ratio lives on the listitem wrapper (the grid item) so the cell
        // is sized by the grid exactly as before; the inner link/div fills it with
        // w-full h-full. Putting aspect-[2/1] on the inner block collapsed the wide
        // col-span-2 cells to zero height (empty cards).
        const innerClassName = `w-full h-full overflow-hidden relative group block ${cardClassName} ${(isInteractive || hasLink) ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold' : ''}`;

        const inner = hasLink ? (
          <Link href={item.href!} className={innerClassName} style={cardStyle} aria-label={altText}>
            {content}
          </Link>
        ) : (
          <div
            className={innerClassName}
            style={cardStyle}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={isInteractive ? () => onItemClick?.(item, index) : undefined}
            onKeyDown={isInteractive ? (e) => handleKeyDown(e, item, index) : undefined}
            aria-label={altText}
          >
            {content}
          </div>
        );

        return (
          <div key={`${item.image}-${item.title}`} role="listitem" className={`${layout.col} ${layout.aspect}`}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
