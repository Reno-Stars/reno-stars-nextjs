'use client';

import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import { X, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import type { LocalizedImagePair, LocalizedImageWithAlt } from '@/lib/types';
import { NAVY, GOLD, NAVY_90 } from '@/lib/theme';

interface ProjectFullscreenOverlayProps {
  /** Ref wired to useFullscreenModal (focus trap / scroll lock / keyboard nav). */
  overlayRef: React.RefObject<HTMLDivElement | null>;
  /** Project title — used for the dialog aria-label and image alt fallbacks. */
  title: string;
  displayImage?: LocalizedImageWithAlt;
  displayVideo?: string;
  currentPair?: LocalizedImagePair;
  showBefore: boolean;
  hasBothImages: boolean;
  imagePairs: LocalizedImagePair[];
  activePairIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Click on the image area — toggles before/after (images only). */
  onImageAreaClick: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onThumbClick: (e: React.MouseEvent, index: number) => void;
  stopPropagation: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * Fullscreen image/video lightbox for the project gallery. Extracted verbatim
 * from ProjectDetailPage (keeps that file under the 800-line cap); the parent
 * still owns the gallery state and passes handlers/derived values as props.
 * Render this only while the overlay is open — the parent guards on
 * `isFullscreen && (displayImage || displayVideo)`.
 */
export default function ProjectFullscreenOverlay({
  overlayRef,
  title,
  displayImage,
  displayVideo,
  currentPair,
  showBefore,
  hasBothImages,
  imagePairs,
  activePairIndex,
  onClose,
  onPrev,
  onNext,
  onImageAreaClick,
  onTouchStart,
  onTouchEnd,
  onThumbClick,
  stopPropagation,
  onPointerDown,
  onPointerUp,
  onPointerMove,
}: ProjectFullscreenOverlayProps) {
  const t = useTranslations();

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        aria-label={t('modal.close')}
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Before/After Badge in fullscreen */}
      {hasBothImages && !displayVideo && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <span
            className="px-3 py-1.5 text-sm rounded-lg font-semibold text-white"
            style={{ backgroundColor: showBefore ? NAVY : GOLD }}
          >
            {showBefore ? t('projects.beforeLabel') : t('projects.afterLabel')}
          </span>
          <span className="text-white/70 text-sm">
            {t('projects.clickToToggle')}
          </span>
        </div>
      )}

      {/* Previous arrow */}
      {imagePairs.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
          aria-label={t('projects.previousImage')}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Next arrow */}
      {imagePairs.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
          aria-label={t('projects.nextImage')}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Fullscreen image */}
      <div
        className={`relative w-full h-full max-w-[90vw] max-h-[80vh]${hasBothImages && !displayVideo ? ' cursor-pointer' : ''}`}
        onClick={onImageAreaClick}
        onTouchStart={displayVideo ? undefined : onTouchStart}
        onTouchEnd={displayVideo ? undefined : onTouchEnd}
      >
        {displayVideo ? (
          <video
            key={displayVideo}
            src={displayVideo}
            poster={displayImage?.src}
            controls
            playsInline
            preload="auto"
            aria-label={displayImage?.alt || title}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (currentPair?.afterImage || currentPair?.beforeImage) ? (
          <>
            {currentPair?.afterImage && (
              <div className="absolute inset-0" style={{ opacity: showBefore ? 0 : 1, transition: 'opacity 0.15s ease' }}>
                <OptimizedImage
                  src={currentPair.afterImage.src}
                  alt={currentPair.afterImage.alt || title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}
            {currentPair?.beforeImage && (
              <div className="absolute inset-0" style={{ opacity: showBefore ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                <OptimizedImage
                  src={currentPair.beforeImage.src}
                  alt={currentPair.beforeImage.alt || title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Thumbnail strip in fullscreen with horizontal scroll */}
      {imagePairs.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-[90vw] overflow-x-auto cursor-grab select-none touch-pan-x"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.5) transparent' }}
          onClick={stopPropagation}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerMove={onPointerMove}
        >
          <div className="flex gap-2 p-4">
            {imagePairs.map((pair, idx) => {
              const fsHasBothSides = (pair.beforeImage || pair.beforeVideo) && (pair.afterImage || pair.afterVideo);
              const fsThumbImage = pair.afterImage || pair.beforeImage;
              return (
              <button
                key={`fs-${fsThumbImage?.src || pair.afterVideo || pair.beforeVideo || idx}-${idx}`}
                onClick={(e) => onThumbClick(e, idx)}
                className="relative rounded-lg overflow-hidden shrink-0 transition-all duration-200"
                aria-label={`${t('projects.viewImage')} ${idx + 1} / ${imagePairs.length}`}
                aria-pressed={idx === activePairIndex}
                style={{
                  width: fsHasBothSides ? '100px' : '70px',
                  height: '70px',
                  outline: idx === activePairIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                  outlineOffset: '2px',
                  opacity: idx === activePairIndex ? 1 : 0.6,
                }}
              >
                {pair.beforeImage && pair.afterImage ? (
                  <div className="flex h-full">
                    <div className="relative w-1/2 h-full">
                      <OptimizedImage
                        src={pair.beforeImage.src}
                        alt={pair.beforeImage.alt || `${title} - ${t('projects.beforeLabel')}`}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                    <div className="w-px bg-white/80" />
                    <div className="relative w-1/2 h-full">
                      <OptimizedImage
                        src={pair.afterImage.src}
                        alt={pair.afterImage.alt || `${title} - ${t('projects.afterLabel')}`}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : fsThumbImage ? (
                  <div className="relative w-full h-full">
                    <OptimizedImage
                      src={fsThumbImage.src}
                      alt={fsThumbImage.alt || title}
                      fill
                      sizes="70px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: NAVY_90 }}>
                    <Video className="w-6 h-6 text-white/80" />
                  </div>
                )}
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
