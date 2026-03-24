'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Shield, Star, Camera } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company } from '@/lib/types';
import { video, images, WORKSAFE_BC_LOGO } from '@/lib/data';
import { GOLD } from '@/lib/theme';
import LazyVideo from '@/components/LazyVideo';

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
      icon: null,
    },
    {
      title: t.realEstateTitle,
      description: t.realEstateDesc,
      icon: Camera,
    },
  ], [t]);

  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setVisible(false);
    fadeTimer.current = setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 300);
  }, []);

  // Clear any pending fade timeout on unmount
  useEffect(() => () => { if (fadeTimer.current) clearTimeout(fadeTimer.current); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [current, goTo, slides.length]);

  const slide = slides[current];

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Poster image shown immediately for fast LCP */}
      <Image
        src={posterSrc}
        alt="Vancouver home renovation showcase featuring modern kitchen and bathroom remodeling by Reno Stars"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />
      {/* Video loads lazily on desktop only, fades in over the image */}
      <LazyVideo
        src={videoSrc}
        poster={posterSrc}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl space-y-5">
          {/* Slide content — fades in/out on switch */}
          <div
            className="space-y-4 transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {slide.icon && (
              <span aria-hidden="true" className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full border border-white/20 text-white/80 backdrop-blur-sm"
                style={{ borderColor: `${GOLD}55`, color: GOLD }}>
                <slide.icon className="w-4 h-4" />
              </span>
            )}
            <h1 id="hero-title" className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              {slide.title}
            </h1>
            <p className="text-base lg:text-lg leading-relaxed text-white/80">
              {slide.description}
            </p>
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

          <div className="flex flex-wrap gap-4 pt-2">
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5">
              <Shield className="w-4 h-4" style={{ color: GOLD }} />
              {company.yearsExperience}+ {t.yearsExperience}
            </span>
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5">
              <Image src={WORKSAFE_BC_LOGO} alt="WorkSafe BC" width={120} height={32} className="h-4 w-auto object-contain rounded-sm" />
              {t.liabilityCoverage}
            </span>
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5" role="img" aria-label={`${googleRating ?? 5}/5 ${t.rating}`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-3.5 h-3.5" style={{ fill: GOLD, color: GOLD }} />
              ))}
              <span>{googleRating ? `${googleRating} ${t.rating}` : t.rating}</span>
            </span>
          </div>

          {/* Slide indicators */}
          <div className="flex gap-2 pt-1" role="tablist" aria-label="Hero slides">
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
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD}00)` }} />
    </section>
  );
}
