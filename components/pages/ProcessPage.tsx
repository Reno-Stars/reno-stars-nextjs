'use client';

import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useTranslations } from 'next-intl';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Phone, Mail, MapPin, Globe, Star, CheckSquare, Download, Loader2, Check, AlertCircle,
  MessageCircle, MessageSquare, Clipboard, Ruler, FileText, Eye, Handshake, PenTool,
  Users, Settings, ClipboardCheck, HeartHandshake, Shield, Headphones,
  type LucideIcon,
} from 'lucide-react';
import type { Company } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import {
  NAVY, NAVY_MID, NAVY_PALE, GOLD, SURFACE, SURFACE_LIGHT, SURFACE_DARK, CARD, TEXT, TEXT_MID, SH_DARK, neu,
  SUCCESS, ERROR,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT, STEP_RED, STEP_RED_LIGHT,
} from '@/lib/theme';
import { stepIllustrations, TreeSvg, HouseSvg } from '@/components/illustrations/process';

interface ProcessPageProps {
  company: Company;
  locale: Locale;
  googleRating?: number;
}

interface StepData {
  number: string;
  titleKey: string;
  subtitleKey: string;
  color: string;
  lightColor: string;
}

const stepIcons: Record<string, LucideIcon> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  wechat: MessageCircle,
  sms: Clipboard,
  ruler: Ruler,
  quote: FileText,
  site: Eye,
  contract: Handshake,
  meeting: Users,
  design: PenTool,
  team: Users,
  management: Settings,
  progress: ClipboardCheck,
  response: Headphones,
  inspection: CheckSquare,
  warranty: Shield,
  support: HeartHandshake,
};

const STEP_COUNT = 5;

// Road SVG constants
const ROAD_VIEWBOX_HEIGHT = 2400;
const ROAD_VIEWBOX_WIDTH = 1000;
/** How early (0–1) the animation starts before the section fully enters */
const SCROLL_LEAD = 0.3;
/** Fraction of viewport height at which a card starts revealing (measured from top) */
const CARD_REVEAL_VIEWPORT = 0.85;
/** SVG path data for the winding road (shared by border, surface, and dashed line) */
const ROAD_PATH_D = `M 700 0 C 700 150, 300 200, 300 400 C 300 600, 700 650, 700 850 C 700 1050, 300 1100, 300 1300 C 300 1500, 700 1550, 700 1750 C 700 1950, 300 2000, 300 2200 L 300 ${ROAD_VIEWBOX_HEIGHT}`;

// Step colors matching the zigzag infographic style
const stepColors = [
  { color: STEP_TEAL, lightColor: STEP_TEAL_LIGHT },
  { color: STEP_ORANGE, lightColor: STEP_ORANGE_LIGHT },
  { color: STEP_GREEN, lightColor: STEP_GREEN_LIGHT },
  { color: STEP_RED, lightColor: STEP_RED_LIGHT },
  { color: NAVY, lightColor: NAVY_PALE },
];

// Local path used instead of next/image for html-to-image PNG export compatibility
const LOGO_PATH = '/logo.png';

export default function ProcessPage({ company, locale, googleRating }: ProcessPageProps) {
  const t = useTranslations();

  const trustBadges = useMemo(() => [
    { type: 'stat' as const, value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { type: 'stat' as const, value: String(company.projectsCompleted), label: t('stats.projectsCompleted') },
    { type: 'rating' as const, label: googleRating ? `${googleRating} ${t('process.hero.googleReviews')}` : t('process.hero.googleReviews') },
  ], [company, t, googleRating]);

  const steps: StepData[] = useMemo(() => [
    { number: '01', titleKey: 'process.step1.title', subtitleKey: 'process.step1.subtitle', ...stepColors[0] },
    { number: '02', titleKey: 'process.step2.title', subtitleKey: 'process.step2.subtitle', ...stepColors[1] },
    { number: '03', titleKey: 'process.step3.title', subtitleKey: 'process.step3.subtitle', ...stepColors[2] },
    { number: '04', titleKey: 'process.step4.title', subtitleKey: 'process.step4.subtitle', ...stepColors[3] },
    { number: '05', titleKey: 'process.step5.title', subtitleKey: 'process.step5.subtitle', ...stepColors[4] },
  ], []);

  const footerStats = useMemo(() => [
    { type: 'stat' as const, value: `${company.yearsExperience}+`, label: t('process.footer.yearsIndustry') },
    { type: 'rating' as const, label: googleRating ? `${googleRating} ${t('process.footer.googleRating')}` : t('process.footer.googleRating') },
    { type: 'stat' as const, value: t('stats.fullCoverage'), label: t('process.footer.warrantyService') },
  ], [company, t, googleRating]);

  const posterRef = useRef<HTMLDivElement>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pdfStatusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [pdfDownloadStatus, setPdfDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCapturing, setIsCapturing] = useState(false);

  // Road scroll animation state
  const stepsRef = useRef<HTMLDivElement>(null);
  const roadBorderRef = useRef<SVGPathElement>(null);
  const roadSurfaceRef = useRef<SVGPathElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const rafIdRef = useRef<number>(0);
  const stepCardRefs = useRef<(HTMLDivElement | null)[]>(Array(STEP_COUNT).fill(null));
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>(() => Array(STEP_COUNT).fill(false));

  useEffect(() => {
    const section = stepsRef.current;
    if (!section) return;

    // Get total path length once the SVG is mounted
    const pathEl = roadSurfaceRef.current;
    const totalLength = pathEl?.getTotalLength() ?? 0;

    // Set initial dasharray/offset on border and surface paths
    [roadBorderRef.current, roadSurfaceRef.current].forEach(p => {
      if (p) {
        p.style.strokeDasharray = `${totalLength}`;
        p.style.strokeDashoffset = `${totalLength}`;
      }
    });

    const updateRoad = () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(1, Math.max(0,
        (windowH - rect.top) / (rect.height + windowH * SCROLL_LEAD),
      ));

      // Update road stroke dash offset for border and surface
      const offset = totalLength * (1 - progress);
      [roadBorderRef.current, roadSurfaceRef.current].forEach(p => {
        if (p) p.style.strokeDashoffset = `${offset}`;
      });
      // Dashed line: update clipPath rect height to reveal proportionally
      if (clipRectRef.current) {
        clipRectRef.current.setAttribute('height', `${Math.round(ROAD_VIEWBOX_HEIGHT * progress)}`);
      }

      // Determine which cards to reveal based on their viewport position
      const newVisible = stepCardRefs.current.map(cardEl => {
        if (!cardEl) return false;
        const cardRect = cardEl.getBoundingClientRect();
        return cardRect.top < windowH * CARD_REVEAL_VIEWPORT;
      });
      setVisibleSteps(prev => {
        if (prev.every((v, i) => v === newVisible[i])) return prev;
        return newVisible;
      });
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateRoad);
    };

    handleScroll(); // initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(statusTimerRef.current);
      clearTimeout(pdfStatusTimerRef.current);
    };
  }, []);

  const capturePoster = useCallback(async () => {
    if (!posterRef.current) throw new Error('Poster ref not available');

    // Force all elements visible synchronously
    flushSync(() => setIsCapturing(true));

    // Force road SVG fully drawn
    [roadBorderRef.current, roadSurfaceRef.current].forEach(p => {
      if (p) p.style.strokeDashoffset = '0';
    });
    if (clipRectRef.current) {
      clipRectRef.current.setAttribute('height', `${ROAD_VIEWBOX_HEIGHT}`);
    }

    // Lock all block containers to their computed pixel widths.
    // html-to-image renders in an SVG foreignObject where block elements
    // may not inherit full parent width, causing centering to break.
    const lockedEls: { el: HTMLElement; prev: string }[] = [];
    posterRef.current.querySelectorAll<HTMLElement>('section, [class*="max-w-"], [class*="flex-col"], [class*="flex-row"]').forEach(el => {
      lockedEls.push({ el, prev: el.style.width });
      el.style.width = `${el.offsetWidth}px`;
    });

    // Allow one paint frame for styles to apply
    await new Promise(r => requestAnimationFrame(r));
    try {
      return await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: SURFACE });
    } finally {
      // Restore original widths
      lockedEls.forEach(({ el, prev }) => { el.style.width = prev; });
      flushSync(() => setIsCapturing(false));
      // Restore road to current scroll position (only if still mounted)
      if (stepsRef.current) {
        window.dispatchEvent(new Event('scroll'));
      }
    }
  }, []);

  // PNG download
  const handleDownload = useCallback(async () => {
    if (!posterRef.current || isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('idle');
    try {
      const dataUrl = await capturePoster();

      const link = document.createElement('a');
      link.download = 'reno-stars-workflow-poster.png';
      link.href = dataUrl;
      link.click();

      setDownloadStatus('success');
      statusTimerRef.current = setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch {
      setDownloadStatus('error');
      statusTimerRef.current = setTimeout(() => setDownloadStatus('idle'), 3000);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, capturePoster]);

  // PDF download
  const handlePdfDownload = useCallback(async () => {
    if (!posterRef.current || isPdfDownloading) return;

    setIsPdfDownloading(true);
    setPdfDownloadStatus('idle');
    try {
      const dataUrl = await capturePoster();

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      });

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [imgWidth, imgHeight],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('reno-stars-workflow-poster.pdf');

      setPdfDownloadStatus('success');
      pdfStatusTimerRef.current = setTimeout(() => setPdfDownloadStatus('idle'), 3000);
    } catch {
      setPdfDownloadStatus('error');
      pdfStatusTimerRef.current = setTimeout(() => setPdfDownloadStatus('idle'), 3000);
    } finally {
      setIsPdfDownloading(false);
    }
  }, [isPdfDownloading, capturePoster]);

  return (
    <>
      <div ref={posterRef} className={`min-h-screen relative overflow-hidden${isCapturing ? ' poster-capturing' : ''}`} style={{ backgroundColor: SURFACE }}>
        {/* Decorative background elements - hidden on mobile */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden">
          <TreeSvg className="absolute top-[15%] left-[5%] w-12 h-16 opacity-20" />
          <TreeSvg className="absolute top-[25%] right-[8%] w-10 h-14 opacity-15" />
          <TreeSvg className="absolute top-[45%] left-[3%] w-14 h-20 opacity-20" />
          <HouseSvg className="absolute top-[35%] right-[5%] w-16 h-16 opacity-15" />
          <TreeSvg className="absolute top-[60%] right-[4%] w-12 h-16 opacity-20" />
          <HouseSvg className="absolute top-[70%] left-[6%] w-14 h-14 opacity-15" />
          <TreeSvg className="absolute top-[80%] left-[10%] w-10 h-14 opacity-15" />
          <TreeSvg className="absolute top-[85%] right-[10%] w-12 h-16 opacity-20" />
        </div>

        {/* Hero Section Animations */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.06; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.12; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heroStar {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.15) rotate(8deg); }
        }
        @keyframes heroDividerGrow {
          from { width: 0; }
          to { width: 100%; }
        }
        .hero-fade-up { animation: heroFadeUp 0.8s ease-out both; }
        .hero-fade-up-1 { animation: heroFadeUp 0.8s ease-out 0.1s both; }
        .hero-fade-up-2 { animation: heroFadeUp 0.8s ease-out 0.3s both; }
        .hero-fade-up-3 { animation: heroFadeUp 0.8s ease-out 0.5s both; }
        .hero-fade-up-4 { animation: heroFadeUp 0.8s ease-out 0.7s both; }
        .hero-fade-up-5 { animation: heroFadeUp 0.8s ease-out 0.9s both; }
        .hero-glow { animation: heroGlow 6s ease-in-out infinite; }
        .hero-float { animation: heroFloat 4s ease-in-out infinite; }
        .hero-float-delay { animation: heroFloat 5s ease-in-out 1s infinite; }
        .hero-star-pulse { animation: heroStar 3s ease-in-out infinite; }
        .hero-star-pulse-delay { animation: heroStar 4s ease-in-out 1.5s infinite; }
        .hero-divider-line {
          animation: heroDividerGrow 1s ease-out 0.6s both;
          overflow: hidden;
        }
        .poster-capturing [data-hero-animated="entrance"] {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
        .poster-capturing [data-hero-animated="decorative"] {
          animation: none !important;
        }
      `}</style>

        {/* Hero Section */}
      <section
        className="py-14 sm:py-18 lg:py-22 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${SURFACE_LIGHT} 0%, ${SURFACE} 40%, ${SURFACE_DARK} 100%)`,
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Warm radial glow behind content */}
          <div
            className="absolute top-1/2 left-1/2 w-[900px] h-[600px] rounded-full hero-glow" data-hero-animated="decorative"
            style={{ background: `radial-gradient(ellipse, rgba(200,146,42,0.1) 0%, transparent 70%)` }}
          />
          {/* Subtle grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
            <defs>
              <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={NAVY} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>
          {/* Diagonal gold accent lines */}
          <div
            className="hidden sm:block absolute -top-10 -left-10 w-[600px] h-[1px] origin-top-left rotate-[25deg] opacity-20"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
          <div
            className="hidden sm:block absolute -bottom-10 -right-10 w-[500px] h-[1px] origin-bottom-right rotate-[25deg] opacity-15"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
        </div>

        {/* Floating decorative stars */}
        <div className="hidden sm:block absolute top-8 left-10 hero-star-pulse" data-hero-animated="decorative" aria-hidden="true">
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <path d="M30 8 L33 22 L47 22 L36 30 L40 44 L30 36 L20 44 L24 30 L13 22 L27 22 Z" fill={GOLD} opacity="0.5" />
          </svg>
        </div>
        <div className="hidden sm:block absolute top-12 right-12 hero-star-pulse-delay" data-hero-animated="decorative" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            <path d="M20 4 L22 14 L32 14 L24 20 L27 30 L20 24 L13 30 L16 20 L8 14 L18 14 Z" fill={GOLD} opacity="0.4" />
          </svg>
        </div>
        <div className="hidden lg:block absolute bottom-16 left-16 hero-float-delay" data-hero-animated="decorative" aria-hidden="true">
          <svg viewBox="0 0 30 30" className="w-6 h-6">
            <path d="M15 3 L16.5 10 L24 10 L18 14.5 L20 22 L15 17.5 L10 22 L12 14.5 L6 10 L13.5 10 Z" fill={GOLD} opacity="0.3" />
          </svg>
        </div>
        <div className="hidden lg:block absolute bottom-20 right-20 hero-float" data-hero-animated="decorative" aria-hidden="true">
          <svg viewBox="0 0 60 60" className="w-14 h-14 opacity-15">
            <rect x="10" y="25" width="8" height="30" fill={NAVY} />
            <rect x="5" y="20" width="18" height="10" fill={NAVY} opacity="0.7" />
            <rect x="35" y="15" width="5" height="40" fill={GOLD} opacity="0.5" />
            <polygon points="37.5,10 30,20 45,20" fill={NAVY} opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Brand Logo - full color on warm background */}
          <div className="mb-8 hero-fade-up-1" data-hero-animated="entrance">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_PATH}
              alt={company.name}
              width={2227}
              height={300}
              className="w-3/4 sm:w-2/3 md:w-1/2 h-auto mx-auto"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(27,54,93,0.15))' }}
            />
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-6 hero-fade-up-2" data-hero-animated="entrance" aria-hidden="true">
            <div className="h-px w-12 sm:w-20 hero-divider-line" data-hero-animated="entrance" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <svg viewBox="0 0 20 20" className="w-4 h-4 hero-float" data-hero-animated="decorative" style={{ fill: GOLD }}>
              <path d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 16.5 L10 13 L6 16.5 L7.5 11 L3 7.5 L8.5 7.5 Z" />
            </svg>
            <div className="h-px w-12 sm:w-20 hero-divider-line" data-hero-animated="entrance" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 hero-fade-up-3" data-hero-animated="entrance" style={{ color: NAVY }}>
            {t('process.hero.title')}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl mb-8 sm:mb-10 uppercase tracking-wider sm:tracking-widest hero-fade-up-4" data-hero-animated="entrance" style={{ color: TEXT_MID }}>
            {t('process.hero.subtitle')}
          </p>

          {/* Trust Badges - stacked on mobile, flex on larger screens */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-4 md:gap-5 hero-fade-up-5" data-hero-animated="entrance">
            {trustBadges.map((badge, idx) => (
              <div
                key={badge.label}
                className="flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border transition-all duration-300 hover:scale-105 hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(27,54,93,0.06)',
                  borderColor: 'rgba(27,54,93,0.12)',
                  animationDelay: `${1.1 + idx * 0.15}s`,
                }}
              >
                {badge.type === 'rating' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 sm:gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                    <span className="text-sm sm:text-base" style={{ color: TEXT_MID }}>{badge.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base sm:text-lg md:text-xl" style={{ color: GOLD }}>{badge.value}</span>
                    <span className="text-sm sm:text-base" style={{ color: TEXT_MID }}>{badge.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative border */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, opacity: 0.3 }} />
      </section>

      {/* Steps Section */}
      <section ref={stepsRef} className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto relative">
          {/* Winding Road Path - scroll-animated */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox={`0 0 ${ROAD_VIEWBOX_WIDTH} ${ROAD_VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMin slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={STEP_TEAL} />
                <stop offset="20%" stopColor={STEP_ORANGE} />
                <stop offset="40%" stopColor={STEP_GREEN} />
                <stop offset="60%" stopColor={STEP_RED} />
                <stop offset="80%" stopColor={NAVY} />
                <stop offset="100%" stopColor={NAVY} />
              </linearGradient>
              <clipPath id="roadRevealClip">
                <rect ref={clipRectRef} x="0" y="0" width={ROAD_VIEWBOX_WIDTH} height="0" />
              </clipPath>
            </defs>

            {/* Road edge/border - outer glow effect */}
            <path ref={roadBorderRef} d={ROAD_PATH_D} fill="none" stroke={SH_DARK} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" />

            {/* Main road surface */}
            <path ref={roadSurfaceRef} d={ROAD_PATH_D} fill="none" stroke="url(#roadGradient)" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

            {/* White center dashed line - revealed by clipPath */}
            <path clipPath="url(#roadRevealClip)" d={ROAD_PATH_D} fill="none" stroke="white" strokeWidth="6" strokeDasharray="30,20" strokeLinecap="round" opacity="0.9" />

          </svg>

          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const stepNum = index + 1;
              const points = t.raw(`process.step${stepNum}.points`) as string[];
              const tags = t.raw(`process.step${stepNum}.tags`) as { icon: string; label: string }[];
              const Illustration = stepIllustrations[index];
              const isVisible = isCapturing || visibleSteps[index];

              return (
                <div
                  key={step.number}
                  ref={el => { stepCardRefs.current[index] = el; }}
                  className={`relative w-full lg:flex lg:items-center lg:gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? 'translateY(0) scale(1)'
                      : 'translateY(40px) scale(0.95)',
                    transition: isCapturing ? 'none' : 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  }}
                >
                  {/* Illustration Column */}
                  <div className={`lg:w-[22%] mb-4 lg:mb-0 shrink-0 flex justify-center ${isEven ? 'lg:justify-end' : 'lg:justify-start'}`}>
                    <div
                      className="rounded-2xl p-4 sm:p-5 aspect-square max-w-[120px] sm:max-w-[140px] lg:max-w-[160px] relative"
                      style={{ backgroundColor: step.lightColor, boxShadow: neu(4) }}
                    >
                      <Illustration />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="lg:w-[78%]">
                    <div
                      className="rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden"
                      style={{ boxShadow: neu(6), backgroundColor: CARD }}
                    >
                      {/* Colored accent bar */}
                      <div
                        className="absolute top-0 left-0 w-full h-1.5"
                        style={{ backgroundColor: step.color }}
                      />

                      {/* Step Label */}
                      <div className="mb-3 sm:mb-4">
                        <div
                          className="inline-block px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold"
                          style={{ backgroundColor: step.color, color: 'white' }}
                        >
                          {t('process.hero.stepLabel', { stepNum })}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT }}>
                        {t(step.titleKey)}
                      </h2>
                      <p className="text-sm sm:text-base uppercase tracking-wider mb-4 sm:mb-5" style={{ color: step.color }}>
                        {t(step.subtitleKey)}
                      </p>

                      {/* Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 sm:gap-y-2.5 mb-4 sm:mb-5">
                        {points.map((point, pointIdx) => (
                          <div key={point} className="flex items-start gap-2 sm:gap-2.5">
                            <span className="mt-0.5 text-base sm:text-lg font-semibold shrink-0" style={{ color: step.color }}>{pointIdx + 1}.</span>
                            <span className="text-base sm:text-lg leading-relaxed" style={{ color: TEXT_MID }}>{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 sm:gap-2.5">
                        {tags.map((tag) => {
                          const Icon = stepIcons[tag.icon] || CheckSquare;
                          return (
                            <div
                              key={tag.icon}
                              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
                              style={{ backgroundColor: step.lightColor }}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: step.color }} />
                              <span style={{ color: TEXT }}>{tag.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step number circle - centered below card */}
                  <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl"
                      style={{
                        backgroundColor: step.color,
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'scale(1)' : 'scale(0)',
                        transition: isCapturing ? 'none' : 'opacity 0.5s ease-out 0.2s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
                      }}
                    >
                      {stepNum}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tagline */}
          <div
            className="text-center mt-8 sm:mt-12 relative z-10"
            style={{
              opacity: (isCapturing || visibleSteps.at(-1)) ? 1 : 0,
              transform: (isCapturing || visibleSteps.at(-1)) ? 'translateY(0)' : 'translateY(20px)',
              transition: isCapturing ? 'none' : 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}
          >
            <div className="inline-flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-full" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
              <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD }} />
              <p className="text-base sm:text-xl md:text-2xl font-medium" style={{ color: TEXT }}>
                {t('process.tagline')}
              </p>
              <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD }} />
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-6 sm:p-10" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              <div className="shrink-0">
                <HouseSvg className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3" style={{ color: TEXT }}>
                  {t('process.whyMatters.title')}
                </h3>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: TEXT_MID }}>
                  {t('process.whyMatters.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section
        className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Main Tagline */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {t('process.footer.tagline')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg uppercase tracking-wider sm:tracking-widest text-white/60">
              {t('process.footer.taglineEn')}
            </p>
          </div>

          {/* Contact Info Grid - stacked on mobile, 3 cols on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Left: Contact Details */}
            <div className="space-y-3 sm:space-y-4 order-2 md:order-1">
              <a href={`tel:${company.phone}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD }} />
                <span className="text-white text-base sm:text-lg md:text-xl">{company.phone}</span>
              </a>
              <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD }} />
                <span className="text-white text-base sm:text-lg md:text-xl">{company.email}</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <span className="text-white text-base sm:text-lg md:text-xl">{company.address}</span>
              </div>
              <a href={`https://${t('process.footer.website')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD }} />
                <span className="text-white text-base sm:text-lg md:text-xl">{t('process.footer.website')}</span>
              </a>
            </div>

            {/* Center: Linktree QR Code */}
            {/* Using <img> instead of next/image for PDF/PNG export compatibility */}
            <div className="flex flex-col items-center order-1 md:order-2">
              <div className="bg-white p-4 rounded-xl mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/reno-stars-qr.png"
                  alt="Reno Stars Linktree QR Code"
                  width={140}
                  height={140}
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                />
              </div>
              <p className="text-sm sm:text-base md:text-lg text-white/70">
                {t('process.footer.scanLinktree')}
              </p>
            </div>

            {/* Right: Stats */}
            <div className="space-y-4 sm:space-y-5 order-3">
              {footerStats.map((stat) => (
                <div key={stat.label} className="text-center md:text-right">
                  <span className="block text-white/70 text-sm sm:text-base mb-1">{stat.label}</span>
                  {stat.type === 'rating' ? (
                    <div className="flex gap-0.5 sm:gap-1 justify-center md:justify-end">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                  ) : (
                    <span className="font-semibold text-base sm:text-lg md:text-xl" style={{ color: GOLD }}>{stat.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Download Buttons */}
      <div className="py-4 flex justify-center gap-4 print:hidden" style={{ backgroundColor: SURFACE }}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 text-sm opacity-40 hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: TEXT_MID }}
          title={t('process.downloadPosterHint')}
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : downloadStatus === 'success' ? (
            <Check className="w-3.5 h-3.5" style={{ color: SUCCESS }} />
          ) : downloadStatus === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5" style={{ color: ERROR }} />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>
            {downloadStatus === 'success'
              ? t('process.downloadSuccess')
              : downloadStatus === 'error'
                ? t('process.downloadError')
                : t('process.downloadPoster')}
          </span>
        </button>
        <button
          onClick={handlePdfDownload}
          disabled={isPdfDownloading}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm opacity-40 hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: TEXT_MID }}
          title={t('process.downloadPdfHint')}
        >
          {isPdfDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : pdfDownloadStatus === 'success' ? (
            <Check className="w-3.5 h-3.5" style={{ color: SUCCESS }} />
          ) : pdfDownloadStatus === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5" style={{ color: ERROR }} />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span>
            {pdfDownloadStatus === 'success'
              ? t('process.downloadSuccess')
              : pdfDownloadStatus === 'error'
                ? t('process.downloadError')
                : t('process.downloadPdf')}
          </span>
        </button>
      </div>
    </>
  );
}
