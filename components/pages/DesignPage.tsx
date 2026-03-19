'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import type { Company, DesignItem } from '@/lib/types';
import { tetrisLayouts } from '@/components/TetrisGallery';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface DesignPageProps {
  locale: Locale;
  company: Company;
  designs: DesignItem[];
}

export default function DesignPage({ locale, company, designs }: DesignPageProps) {
  const t = useTranslations();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const localizedDesigns = useMemo(
    () => designs.map((d) => ({ image: d.image, title: d.title[locale] })),
    [designs, locale],
  );

  // Lightbox handlers
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) => prev !== null && prev > 0 ? prev - 1 : (localizedDesigns.length - 1));
  }, [localizedDesigns.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev + 1) % localizedDesigns.length : null);
  }, [localizedDesigns.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, goToPrev, goToNext]);

  const currentItem = lightboxIndex !== null ? localizedDesigns[lightboxIndex] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section.designInspirations')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('section.designSubtitle')}
          </p>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ color: NAVY }}>
            {t('design.seoTitle')}
          </h2>
          <div className="prose prose-lg max-w-none" style={{ color: TEXT_MID }}>
            <p className="mb-4 leading-relaxed">{t('design.seoParagraph1')}</p>
            <p className="mb-4 leading-relaxed">{t('design.seoParagraph2')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {(['designFeature1', 'designFeature2', 'designFeature3'] as const).map((key) => (
              <div key={key} className="rounded-xl p-6" style={{ boxShadow: neu(4), backgroundColor: SURFACE }}>
                <h3 className="font-semibold mb-2" style={{ color: NAVY }}>{t(`design.${key}Title`)}</h3>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>{t(`design.${key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Gallery Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{t('section.designInspirations')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" role="list" aria-label={t('section.designInspirations')}>
            {localizedDesigns.map((item, index) => {
              const layout = tetrisLayouts[index % tetrisLayouts.length];
              const altText = item.title || 'Design rendering';
              const isWide = layout.col === 'col-span-2';
              const sizes = isWide
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 50vw, 25vw';

              return (
                <div key={item.image} role="listitem" className={layout.col}>
                  <button
                    type="button"
                    className={`w-full ${layout.aspect} overflow-hidden relative group rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    style={{ boxShadow: neu(5), border: 'none', padding: 0, '--tw-ring-color': GOLD } as React.CSSProperties}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={altText}
                  >
                    <Image
                      src={item.image}
                      alt={altText}
                      fill
                      sizes={sizes}
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {item.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-end" aria-hidden="true">
                        <div className="p-2 sm:p-4 text-white">
                          <h3 className="text-sm sm:text-lg font-bold">{item.title}</h3>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        heading={t('projects.readyToTransform')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
        bg={SURFACE}
      />

      {/* Lightbox */}
      {currentItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.title || 'Design image'}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
            aria-label={t('lightbox.close')}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2"
            aria-label={t('lightbox.previous')}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2"
            aria-label={t('lightbox.next')}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 sm:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentItem.image}
              alt={currentItem.title || 'Design showcase'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {/* Caption */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            {currentItem.title && <p className="text-lg font-medium">{currentItem.title}</p>}
            <p className="text-xs text-white/40 mt-1">
              {lightboxIndex + 1} / {localizedDesigns.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
