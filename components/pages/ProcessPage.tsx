'use client';

import { useMemo, useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Phone, Mail, MapPin, Globe, Star, CheckSquare, Download, Loader2, Check, AlertCircle,
  MessageCircle, Clipboard, Ruler, FileText, Eye, Handshake, PenTool,
  Users, Settings, ClipboardCheck, HeartHandshake, Shield, Headphones,
  type LucideIcon,
} from 'lucide-react';
import type { Company } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import {
  NAVY, NAVY_MID, NAVY_PALE, GOLD, SURFACE, CARD, TEXT, TEXT_MID, SH_DARK, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT, STEP_RED, STEP_RED_LIGHT,
  ILLUS_SKIN, ILLUS_SKIN_DARK, ILLUS_SKY, ILLUS_WOOD, ILLUS_YELLOW,
  ILLUS_GRAY_DARK, ILLUS_GRAY_MID, ILLUS_GRAY_LIGHT, ILLUS_GRAY_PALE,
} from '@/lib/theme';

interface ProcessPageProps {
  company: Company;
  locale: Locale;
}

interface StepData {
  number: string;
  titleKey: string;
  subtitleKey: string;
  pointsKey: string;
  tagsKey: string;
  color: string;
  lightColor: string;
}

const stepIcons: Record<string, LucideIcon> = {
  phone: Phone,
  email: Mail,
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

// Step colors matching the zigzag infographic style
const stepColors = [
  { color: STEP_TEAL, lightColor: STEP_TEAL_LIGHT },
  { color: STEP_ORANGE, lightColor: STEP_ORANGE_LIGHT },
  { color: STEP_GREEN, lightColor: STEP_GREEN_LIGHT },
  { color: STEP_RED, lightColor: STEP_RED_LIGHT },
  { color: NAVY, lightColor: NAVY_PALE },
];

// SVG Illustrations for each step
function PhoneIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Person with phone */}
      <circle cx="60" cy="30" r="18" fill={ILLUS_SKIN} />
      <path d="M42 55 Q60 45 78 55 L78 85 Q60 95 42 85 Z" fill={STEP_TEAL} />
      {/* Phone */}
      <rect x="72" y="35" width="18" height="30" rx="3" fill={ILLUS_GRAY_DARK} />
      <rect x="74" y="38" width="14" height="22" rx="1" fill={ILLUS_SKY} />
      {/* Chat bubbles */}
      <rect x="20" y="20" width="22" height="14" rx="4" fill={STEP_ORANGE} />
      <polygon points="30,34 35,34 32,40" fill={STEP_ORANGE} />
      <circle cx="26" cy="27" r="2" fill="white" />
      <circle cx="31" cy="27" r="2" fill="white" />
      <circle cx="36" cy="27" r="2" fill="white" />
      {/* Computer */}
      <rect x="8" y="60" width="28" height="20" rx="2" fill={ILLUS_GRAY_DARK} />
      <rect x="10" y="62" width="24" height="14" fill={ILLUS_SKY} />
      <rect x="16" y="80" width="16" height="3" fill={ILLUS_GRAY_MID} />
      <rect x="12" y="83" width="24" height="2" fill={ILLUS_GRAY_LIGHT} />
    </svg>
  );
}

function MeasureIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* House outline with measurements */}
      <path d="M60 15 L100 45 L100 95 L20 95 L20 45 Z" fill="none" stroke={STEP_ORANGE} strokeWidth="2" strokeDasharray="4,2" />
      <path d="M60 15 L20 45" fill="none" stroke={STEP_ORANGE} strokeWidth="2" />
      <path d="M60 15 L100 45" fill="none" stroke={STEP_ORANGE} strokeWidth="2" />
      {/* Measurement lines */}
      <line x1="15" y1="45" x2="15" y2="95" stroke={STEP_TEAL} strokeWidth="2" />
      <line x1="10" y1="45" x2="20" y2="45" stroke={STEP_TEAL} strokeWidth="2" />
      <line x1="10" y1="95" x2="20" y2="95" stroke={STEP_TEAL} strokeWidth="2" />
      <text x="8" y="72" fill={STEP_TEAL} fontSize="8" fontWeight="bold">3.5m</text>
      {/* Ruler */}
      <rect x="70" y="70" width="40" height="8" fill={ILLUS_YELLOW} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="75" y1="70" x2="75" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="80" y1="70" x2="80" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="85" y1="70" x2="85" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="90" y1="70" x2="90" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="95" y1="70" x2="95" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Clipboard */}
      <rect x="30" y="55" width="25" height="35" rx="2" fill={ILLUS_WOOD} />
      <rect x="33" y="60" width="19" height="27" fill="white" />
      <rect x="38" y="50" width="9" height="8" rx="1" fill={ILLUS_GRAY_MID} />
      <line x1="36" y1="67" x2="49" y2="67" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="36" y1="73" x2="49" y2="73" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="36" y1="79" x2="45" y2="79" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Person */}
      <circle cx="85" cy="45" r="10" fill={ILLUS_SKIN} />
      <path d="M75 58 Q85 52 95 58 L95 70 L75 70 Z" fill={STEP_ORANGE} />
    </svg>
  );
}

function ContractIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Contract document */}
      <rect x="35" y="20" width="50" height="65" rx="3" fill="white" stroke={ILLUS_GRAY_DARK} strokeWidth="2" />
      <text x="60" y="35" textAnchor="middle" fill={ILLUS_GRAY_DARK} fontSize="7" fontWeight="bold">CONTRACT</text>
      <line x1="42" y1="45" x2="78" y2="45" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="52" x2="78" y2="52" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="59" x2="78" y2="59" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="66" x2="65" y2="66" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      {/* Signature */}
      <path d="M50 73 Q55 68 60 73 Q65 78 70 73" fill="none" stroke={NAVY} strokeWidth="2" />
      {/* Handshake */}
      <ellipse cx="60" cy="100" rx="25" ry="12" fill={STEP_GREEN} opacity="0.3" />
      <path d="M40 95 L50 90 L55 95 L50 100 Z" fill={ILLUS_SKIN} />
      <path d="M80 95 L70 90 L65 95 L70 100 Z" fill={ILLUS_SKIN_DARK} />
      <path d="M50 95 L70 95" stroke={ILLUS_GRAY_DARK} strokeWidth="2" />
      {/* Checkmark */}
      <circle cx="90" cy="35" r="12" fill={STEP_GREEN} />
      <path d="M84 35 L88 39 L96 31" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pen */}
      <rect x="15" y="50" width="6" height="35" rx="1" fill={NAVY} transform="rotate(-30 18 67)" />
      <polygon points="15,82 18,90 21,82" fill={ILLUS_YELLOW} transform="rotate(-30 18 86)" />
    </svg>
  );
}

function ConstructionIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* House under construction */}
      <path d="M60 20 L95 45 L95 90 L25 90 L25 45 Z" fill="#FFF3E0" stroke={ILLUS_WOOD} strokeWidth="2" />
      <path d="M60 20 L25 45" fill="none" stroke={ILLUS_WOOD} strokeWidth="3" />
      <path d="M60 20 L95 45" fill="none" stroke={ILLUS_WOOD} strokeWidth="3" />
      {/* Scaffolding */}
      <line x1="100" y1="40" x2="100" y2="90" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="110" y1="40" x2="110" y2="90" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="50" x2="110" y2="50" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="65" x2="110" y2="65" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="80" x2="110" y2="80" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      {/* Window */}
      <rect x="40" y="55" width="15" height="20" fill={ILLUS_SKY} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="47.5" y1="55" x2="47.5" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="40" y1="65" x2="55" y2="65" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Door */}
      <rect x="62" y="60" width="18" height="30" fill={ILLUS_WOOD} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <circle cx="76" cy="75" r="2" fill={ILLUS_YELLOW} />
      {/* Worker with hardhat */}
      <circle cx="20" cy="60" r="8" fill={ILLUS_SKIN} />
      <ellipse cx="20" cy="55" rx="10" ry="5" fill={ILLUS_YELLOW} />
      <rect x="15" y="68" width="10" height="20" fill={STEP_ORANGE} />
      {/* Tools */}
      <rect x="8" y="75" width="4" height="18" fill={ILLUS_WOOD} />
      <rect x="5" y="72" width="10" height="5" fill={ILLUS_GRAY_MID} />
      {/* Bricks */}
      <rect x="70" y="45" width="8" height="4" fill={STEP_RED} />
      <rect x="79" y="45" width="8" height="4" fill={STEP_RED} />
      <rect x="74" y="50" width="8" height="4" fill={STEP_RED} />
    </svg>
  );
}

function KeyIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Completed house */}
      <path d="M60 25 L95 50 L95 90 L25 90 L25 50 Z" fill="#E8F5E9" stroke={STEP_GREEN} strokeWidth="2" />
      <path d="M60 25 L25 50" fill="none" stroke={STEP_GREEN} strokeWidth="3" />
      <path d="M60 25 L95 50" fill="none" stroke={STEP_GREEN} strokeWidth="3" />
      {/* Chimney */}
      <rect x="75" y="30" width="10" height="15" fill={ILLUS_WOOD} />
      {/* Window with curtains */}
      <rect x="35" y="55" width="18" height="20" fill={ILLUS_SKY} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <path d="M35 55 Q39 65 35 75" fill={STEP_ORANGE} opacity="0.5" />
      <path d="M53 55 Q49 65 53 75" fill={STEP_ORANGE} opacity="0.5" />
      {/* Door */}
      <rect x="62" y="60" width="18" height="30" fill={ILLUS_WOOD} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <circle cx="76" cy="75" r="2" fill={ILLUS_YELLOW} />
      {/* Welcome mat */}
      <rect x="60" y="88" width="22" height="4" fill={STEP_GREEN} />
      {/* Large key */}
      <g transform="translate(10, 40) rotate(-30)">
        <circle cx="15" cy="15" r="12" fill="none" stroke={ILLUS_YELLOW} strokeWidth="4" />
        <rect x="23" y="12" width="35" height="6" fill={ILLUS_YELLOW} />
        <rect x="45" y="18" width="3" height="8" fill={ILLUS_YELLOW} />
        <rect x="52" y="18" width="3" height="6" fill={ILLUS_YELLOW} />
      </g>
      {/* Sparkles */}
      <g fill={ILLUS_YELLOW}>
        <polygon points="100,30 102,35 107,35 103,38 105,43 100,40 95,43 97,38 93,35 98,35" />
        <polygon points="15,80 16,83 19,83 17,85 18,88 15,86 12,88 13,85 11,83 14,83" transform="scale(0.7) translate(10,20)" />
      </g>
      {/* Checkmark badge */}
      <circle cx="95" cy="25" r="10" fill={STEP_GREEN} />
      <path d="M90 25 L93 28 L100 21" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const stepIllustrations = [
  PhoneIllustration,
  MeasureIllustration,
  ContractIllustration,
  ConstructionIllustration,
  KeyIllustration,
];

// Decorative elements
function TreeSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden="true">
      <polygon points="20,5 35,25 28,25 38,40 25,40 25,55 15,55 15,40 2,40 12,25 5,25" fill={STEP_TEAL} />
      <rect x="15" y="48" width="10" height="12" fill={ILLUS_WOOD} />
    </svg>
  );
}

function HouseSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" className={className} aria-hidden="true">
      <path d="M25 5 L45 22 L45 45 L5 45 L5 22 Z" fill="#FFE4C4" stroke={ILLUS_WOOD} strokeWidth="1.5" />
      <path d="M25 5 L5 22" stroke={ILLUS_WOOD} strokeWidth="2" />
      <path d="M25 5 L45 22" stroke={ILLUS_WOOD} strokeWidth="2" />
      <rect x="20" y="28" width="10" height="17" fill={ILLUS_WOOD} />
      <rect x="10" y="25" width="8" height="8" fill={ILLUS_SKY} />
      <rect x="32" y="25" width="8" height="8" fill={ILLUS_SKY} />
    </svg>
  );
}

export default function ProcessPage({ company, locale }: ProcessPageProps) {
  const t = useTranslations();

  const trustBadges = useMemo(() => [
    { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { value: company.liabilityCoverage, label: t('stats.liabilityCoverage') },
    { value: t('process.hero.projectsCount'), label: t('stats.projectsCompleted') },
    { icon: Star, rating: true, label: t('process.hero.googleReviews') },
  ], [company, t]);

  const steps: StepData[] = useMemo(() => [
    { number: '01', titleKey: 'process.step1.title', subtitleKey: 'process.step1.subtitle', pointsKey: 'process.step1.points', tagsKey: 'process.step1.tags', ...stepColors[0] },
    { number: '02', titleKey: 'process.step2.title', subtitleKey: 'process.step2.subtitle', pointsKey: 'process.step2.points', tagsKey: 'process.step2.tags', ...stepColors[1] },
    { number: '03', titleKey: 'process.step3.title', subtitleKey: 'process.step3.subtitle', pointsKey: 'process.step3.points', tagsKey: 'process.step3.tags', ...stepColors[2] },
    { number: '04', titleKey: 'process.step4.title', subtitleKey: 'process.step4.subtitle', pointsKey: 'process.step4.points', tagsKey: 'process.step4.tags', ...stepColors[3] },
    { number: '05', titleKey: 'process.step5.title', subtitleKey: 'process.step5.subtitle', pointsKey: 'process.step5.points', tagsKey: 'process.step5.tags', ...stepColors[4] },
  ], []);

  const footerStats = useMemo(() => [
    { value: `${company.yearsExperience}+`, label: t('process.footer.yearsIndustry') },
    { value: company.liabilityCoverage, label: t('stats.liabilityCoverage') },
    { icon: Star, rating: true, label: t('process.footer.googleRating') },
    { value: company.warranty, label: t('process.footer.warrantyService') },
  ], [company, t]);

  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Detect mobile/touch device
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 768)
  );

  // Helper to trigger download with blob (more reliable on mobile)
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // For iOS Safari, we need to open in a new tab
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Open blob URL in new tab - user can then share/save
      window.open(url, '_blank');
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  // PNG download with mobile-friendly settings
  const handleDownloadPNG = useCallback(async () => {
    if (!posterRef.current || isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('idle');
    try {
      // Use lower pixelRatio on mobile to avoid memory issues
      const pixelRatio = isMobile ? 1 : 2;

      const dataUrl = await toPng(posterRef.current, {
        pixelRatio,
        backgroundColor: SURFACE,
        // Handle CORS issues with external images
        cacheBust: true,
        // Skip external images that fail CORS (like company logo from CDN)
        skipAutoScale: true,
        // Filter out problematic external images on mobile
        filter: isMobile
          ? (node: HTMLElement) => {
              // Skip external images that might fail CORS
              if (node.tagName === 'IMG') {
                const src = (node as HTMLImageElement).src || '';
                // Allow local images, skip external ones
                if (src.startsWith('http') && !src.includes(window.location.hostname)) {
                  return false;
                }
              }
              return true;
            }
          : undefined,
      });

      // Convert data URL to blob for more reliable mobile download
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      downloadBlob(blob, 'reno-stars-process-poster.png');

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('PNG generation failed:', error);
      // On mobile, offer print as fallback
      if (isMobile && window.print) {
        window.print();
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      } else {
        setDownloadStatus('error');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      }
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, isMobile, downloadBlob]);

  // PDF download (default) - uses print dialog on mobile
  const handleDownload = useCallback(async () => {
    if (!posterRef.current || isDownloading) return;

    // On mobile, use print dialog (most reliable way to save as PDF)
    if (isMobile) {
      window.print();
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('idle');
    try {
      // Generate high-quality PNG first
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2,
        backgroundColor: SURFACE,
      });

      // Create PDF from the image
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Calculate PDF dimensions (A4-ish aspect ratio, portrait)
      const imgWidth = img.width;
      const imgHeight = img.height;
      const aspectRatio = imgWidth / imgHeight;

      // Use mm units, A4 width is 210mm
      const pdfWidth = 210;
      const pdfHeight = pdfWidth / aspectRatio;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('reno-stars-process-poster.pdf');

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fall back to PNG on error
      try {
        await handleDownloadPNG();
      } catch {
        setDownloadStatus('error');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      }
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, isMobile, handleDownloadPNG]);

  return (
    <>
      <div ref={posterRef} className="min-h-screen relative overflow-hidden" style={{ backgroundColor: SURFACE }}>
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

        {/* Hero Section */}
      <section
        className="py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        }}
      >
        {/* Tool icons decoration - hidden on mobile */}
        <div className="hidden sm:block absolute top-4 left-8 opacity-30" aria-hidden="true">
          <svg viewBox="0 0 60 60" className="w-16 h-16">
            <path d="M30 5 L35 20 L50 20 L38 30 L42 45 L30 35 L18 45 L22 30 L10 20 L25 20 Z" fill={GOLD} />
          </svg>
        </div>
        <div className="hidden sm:block absolute bottom-4 right-8 opacity-20" aria-hidden="true">
          <svg viewBox="0 0 60 60" className="w-20 h-20">
            <rect x="10" y="25" width="8" height="30" fill={ILLUS_GRAY_PALE} />
            <rect x="5" y="20" width="18" height="10" fill={ILLUS_GRAY_LIGHT} />
            <rect x="35" y="15" width="5" height="40" fill={ILLUS_WOOD} />
            <polygon points="37.5,10 30,20 45,20" fill={ILLUS_GRAY_MID} />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Brand Logo - using <img> for PDF/PNG export compatibility */}
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.logo}
              alt={company.name}
              width={240}
              height={60}
              className="h-14 w-auto mx-auto brightness-0 invert"
            />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10 hidden sm:block" aria-hidden="true">
              <rect x="5" y="20" width="6" height="18" fill={GOLD} />
              <rect x="2" y="16" width="12" height="6" fill={ILLUS_GRAY_LIGHT} />
              <rect x="22" y="12" width="4" height="26" fill={ILLUS_WOOD} />
              <polygon points="24,8 18,16 30,16" fill={ILLUS_GRAY_MID} />
            </svg>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {t('process.hero.title')}
            </h1>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-white/70 mb-6 sm:mb-8 uppercase tracking-wider sm:tracking-widest">
            {t('process.hero.subtitle')}
          </p>

          {/* Trust Badges - stacked on mobile, flex on larger screens */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-4 md:gap-5">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center justify-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {badge.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 sm:gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base sm:text-lg md:text-xl" style={{ color: GOLD }}>{badge.value}</span>
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto relative">
          {/* Winding Road Path - Full width, more visible */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 2400"
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
            </defs>

            {/* Road edge/border - outer glow effect */}
            <path
              d="M 700 0
                 C 700 150, 300 200, 300 400
                 C 300 600, 700 650, 700 850
                 C 700 1050, 300 1100, 300 1300
                 C 300 1500, 700 1550, 700 1750
                 C 700 1950, 300 2000, 300 2200
                 L 300 2400"
              fill="none"
              stroke={SH_DARK}
              strokeWidth="50"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Main road surface */}
            <path
              d="M 700 0
                 C 700 150, 300 200, 300 400
                 C 300 600, 700 650, 700 850
                 C 700 1050, 300 1100, 300 1300
                 C 300 1500, 700 1550, 700 1750
                 C 700 1950, 300 2000, 300 2200
                 L 300 2400"
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* White center dashed line */}
            <path
              d="M 700 0
                 C 700 150, 300 200, 300 400
                 C 300 600, 700 650, 700 850
                 C 700 1050, 300 1100, 300 1300
                 C 300 1500, 700 1550, 700 1750
                 C 700 1950, 300 2000, 300 2200
                 L 300 2400"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeDasharray="30,20"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Step number circles on the road */}
            <circle cx="700" cy="100" r="35" fill={STEP_TEAL} stroke="white" strokeWidth="4" />
            <text x="700" y="112" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">1</text>

            <circle cx="300" cy="500" r="35" fill={STEP_ORANGE} stroke="white" strokeWidth="4" />
            <text x="300" y="512" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">2</text>

            <circle cx="700" cy="950" r="35" fill={STEP_GREEN} stroke="white" strokeWidth="4" />
            <text x="700" y="962" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">3</text>

            <circle cx="300" cy="1400" r="35" fill={STEP_RED} stroke="white" strokeWidth="4" />
            <text x="300" y="1412" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">4</text>

            <circle cx="700" cy="1850" r="35" fill={NAVY} stroke="white" strokeWidth="4" />
            <text x="700" y="1862" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">5</text>
          </svg>

          <div className="relative z-10 space-y-6 sm:space-y-8 lg:space-y-12">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const stepNum = index + 1;
              const points = t.raw(`process.step${stepNum}.points`) as string[];
              const tags = t.raw(`process.step${stepNum}.tags`) as { icon: string; label: string }[];
              const Illustration = stepIllustrations[index];

              return (
                <div
                  key={step.number}
                  className={`relative lg:flex lg:items-center lg:gap-6 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Large Step Number - Background watermark */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${isEven ? 'right-[5%]' : 'left-[5%]'} z-0`}>
                    <span
                      className="text-[140px] font-bold leading-none select-none"
                      style={{ color: step.color, opacity: 0.08 }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Illustration Card */}
                  <div className={`lg:w-[30%] mb-4 lg:mb-0 ${isEven ? 'lg:ml-[5%]' : 'lg:mr-[5%]'}`}>
                    <div
                      className="rounded-2xl p-4 sm:p-5 aspect-square max-w-[140px] sm:max-w-[180px] mx-auto relative"
                      style={{ backgroundColor: step.lightColor, boxShadow: neu(4) }}
                    >
                      <Illustration />
                      {/* Step number badge on illustration - mobile & tablet */}
                      <div
                        className="lg:hidden absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg"
                        style={{ backgroundColor: step.color }}
                      >
                        {stepNum}
                      </div>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`lg:w-[55%] relative z-10 ${isEven ? 'lg:pr-[10%]' : 'lg:pl-[10%]'}`}>
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
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div
                          className="px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold"
                          style={{ backgroundColor: step.color, color: 'white' }}
                        >
                          STEP {stepNum}
                        </div>
                        <span
                          className="text-2xl sm:text-3xl font-bold lg:hidden"
                          style={{ color: step.color, opacity: 0.4 }}
                        >
                          {step.number}
                        </span>
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
                        {points.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 sm:gap-2.5">
                            <span className="mt-0.5 text-base sm:text-lg" style={{ color: step.color }}>•</span>
                            <span className="text-base sm:text-lg leading-relaxed" style={{ color: TEXT_MID }}>{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 sm:gap-2.5">
                        {tags.map((tag, i) => {
                          const Icon = stepIcons[tag.icon] || CheckSquare;
                          return (
                            <div
                              key={i}
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
                </div>
              );
            })}
          </div>

          {/* Tagline */}
          <div className="text-center mt-8 sm:mt-12 relative z-10">
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

            {/* Center: QR Code - WeChat for Chinese, WhatsApp for English */}
            {/* Using <img> instead of next/image for PDF/PNG export compatibility */}
            <div className="flex flex-col items-center order-1 md:order-2">
              <div className="bg-white p-4 rounded-xl mb-3">
                {locale === 'zh' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/wechat-qr.png"
                    alt="WeChat QR Code"
                    width={140}
                    height={140}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/whatsapp-qr.png"
                    alt="WhatsApp QR Code"
                    width={140}
                    height={140}
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                  />
                )}
              </div>
              <p className="text-sm sm:text-base md:text-lg text-white/70">
                {locale === 'zh' ? t('process.footer.scanWeChat') : t('process.footer.scanWhatsApp')}
              </p>
            </div>

            {/* Right: Stats */}
            <div className="space-y-3 sm:space-y-4 order-3">
              {footerStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between md:justify-end gap-4">
                  <span className="text-white/70 text-sm sm:text-base md:text-lg">{stat.label}</span>
                  {stat.rating ? (
                    <div className="flex gap-0.5 sm:gap-1">
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

      {/* Subtle Download Button at Bottom - Shift+click for PNG */}
      <div className="py-4 text-center print:hidden" style={{ backgroundColor: SURFACE }}>
        <button
          onClick={(e) => e.shiftKey ? handleDownloadPNG() : handleDownload()}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 text-sm opacity-40 hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: TEXT_MID }}
          title={t('process.downloadPosterHint')}
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : downloadStatus === 'success' ? (
            <Check className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
          ) : downloadStatus === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
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
      </div>
    </>
  );
}
