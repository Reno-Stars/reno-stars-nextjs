'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Shield, Star } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company } from '@/lib/types';
import { video, images, WORKSAFE_BC_LOGO } from '@/lib/data';
import { GOLD } from '@/lib/theme';
import LazyVideo from '@/components/LazyVideo';
import OptimizedImage from '@/components/OptimizedImage';

interface HeroSectionProps {
  company: Company;
  googleRating?: number;
  translations: {
    transformYourSpace: string;
    professionalExcellenceDesc: string;
    getFreeQuote: string;
    callNow: string;
    yearsExperience: string;
    liabilityCoverage: string;
    wcbCoverage: string;
    rating: string;
    realEstateTitle: string;
    realEstateDesc: string;
  };
}

const SLIDE_DURATION = 6000;

export default function HeroSection({ company, googleRating, translations: t }: HeroSectionProps) {
  const posterSrc = company.heroImageUrl || images.hero;
  const videoSrc = company.heroVideoUrl || video.hero;

  const slides = useMemo(() => [
    {
      title: t.transformYourSpace,
      description: t.professionalExcellenceDesc,
    },
    {
      title: t.realEstateTitle,
      description: t.realEstateDesc,
    },
  ], [t]);

  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % slides.length;
      currentRef.current = next;
      setCurrent(next);
    }, SLIDE_DURATION);
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    currentRef.current = index;
    setCurrent(index);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Only trigger if horizontal swipe is dominant and exceeds threshold
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) {
      goTo((currentRef.current + 1) % slides.length);
    } else {
      goTo((currentRef.current - 1 + slides.length) % slides.length);
    }
  }, [goTo, slides.length]);

  return (
    <section aria-label={t.transformYourSpace} className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Poster image shown immediately for fast LCP */}
      <OptimizedImage
        src={posterSrc}
        alt="Vancouver home renovation showcase featuring modern kitchen and bathroom remodeling by Reno Stars"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        placeholder="empty"
        aria-hidden="true"
      />
      {/* Video loads lazily on desktop only, fades in over the image */}
      <LazyVideo
        src={videoSrc}
        poster={posterSrc}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 space-y-5">
        <div className="max-w-2xl space-y-5">
          {/* Slide content — all slides stacked via grid; tallest sets height */}
          <div aria-live="polite" className="grid" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {slides.map((s, i) => {
              const active = i === current;
              return (
                <div
                  key={i}
                  className="space-y-4 transition-all duration-700 ease-out"
                  style={{
                    gridArea: '1 / 1',
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateY(0)' : 'translateY(16px)',
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                  aria-hidden={!active}
                >
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                    {s.title}
                  </h1>
                  <p className="text-base lg:text-lg leading-relaxed text-white/80">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/contact"
              className="px-5 sm:px-7 py-3.5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 text-white hover:brightness-110"
              style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}55` }}
            >
              {t.getFreeQuote}
            </Link>
            <a href={`tel:${company.phone}`}
              className="px-5 sm:px-7 py-3.5 rounded-xl text-base font-semibold cursor-pointer border border-white/30 text-white/90 hover:text-white hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              {t.callNow}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-x-4 gap-y-2">
          <span className="whitespace-nowrap text-sm font-medium text-white/70 flex items-center gap-1.5">
            <Shield className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
            {company.yearsExperience}+ {t.yearsExperience}
          </span>
          <span className="whitespace-nowrap text-sm font-medium text-white/70 flex items-center gap-1.5">
            <Shield className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
            {t.liabilityCoverage}
          </span>
          <span className="whitespace-nowrap text-sm font-medium text-white/70 flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORKSAFE_BC_LOGO} alt="WorkSafe BC" width={120} height={32} className="h-4 w-auto object-contain rounded-sm shrink-0" />
            {t.wcbCoverage}
          </span>
          <span className="whitespace-nowrap text-sm font-medium text-white/70 flex items-center gap-1.5" role="img" aria-label={`${googleRating ?? 5}/5 ${t.rating}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 shrink-0" style={{ fill: GOLD, color: GOLD }} />
            ))}
            <span>{googleRating ? `${googleRating} ${t.rating}` : t.rating}</span>
          </span>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2" role="tablist" aria-label="Hero slides">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={slides[i].title}
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === current ? '2rem' : '0.5rem',
                backgroundColor: i === current ? GOLD : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD}00)` }} />
    </section>
  );
}
