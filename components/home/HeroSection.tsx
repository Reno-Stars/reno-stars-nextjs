'use client';

import Image from 'next/image';
import { Shield, Star } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company } from '@/lib/types';
import { video, images, WORKSAFE_BC_LOGO } from '@/lib/data';
import { GOLD } from '@/lib/theme';
import LazyVideo from '@/components/LazyVideo';


interface HeroSectionProps {
  company: Company;
  translations: {
    transformYourSpace: string;
    professionalExcellenceDesc: string;
    getFreeQuote: string;
    callNow: string;
    yearsExperience: string;
    liabilityCoverage: string;
    rating: string;
  };
}

export default function HeroSection({ company, translations: t }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Poster image shown immediately for fast LCP */}
      <Image
        src={images.hero}
        alt="Vancouver home renovation showcase featuring modern kitchen and bathroom remodeling by Reno Stars"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />
      {/* Video loads lazily on desktop only, fades in over the image */}
      <LazyVideo
        src={video.hero}
        poster={images.hero}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl space-y-5">
          <h1 id="hero-title" className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            {t.transformYourSpace}
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-white/80">
            {t.professionalExcellenceDesc}
          </p>
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
            {/* Years of Experience badge */}
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5">
              <Shield className="w-4 h-4" style={{ color: GOLD }} />
              {company.yearsExperience}+ {t.yearsExperience}
            </span>
            {/* WorkSafe BC badge */}
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5">
              <Image src={WORKSAFE_BC_LOGO} alt="WorkSafe BC" width={120} height={32} className="h-4 w-auto object-contain rounded-sm" />
              {t.liabilityCoverage}
            </span>
            {/* Star rating */}
            <span className="text-sm font-medium text-white/70 flex items-center gap-1.5" role="img" aria-label={`5/5 ${t.rating}`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-3.5 h-3.5" style={{ fill: GOLD, color: GOLD }} />
              ))}
              <span>{t.rating}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD}00)` }} />
    </section>
  );
}
