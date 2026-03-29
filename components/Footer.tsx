'use client';

import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram, Star } from 'lucide-react';
import { useMemo, useState, useCallback, useEffect, useRef, type SVGProps } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import type { Company, SocialLink, Service, ServiceArea } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { trackPhoneClick } from '@/lib/analytics';
import { NAVY, GOLD } from '@/lib/theme';
import { WORKSAFE_BC_LOGO } from '@/lib/data';

type IconComponent = React.ComponentType<{ className?: string }>;

function XiaohongshuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972a.794.794 0 0 0-.884-.618a.795.795 0 0 0-.692.794c0 .101-.002.666.001.777m-11.509 4.808c-.203.001-1.353.004-1.685.003a2.5 2.5 0 0 1-.766-.126a.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124c.66.01 1.32.002 1.981 0q.017 0 .023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01l-.01.08c-.027.397-.038.495-.234 3.06c-.012.24-.034.389-.135.607c-.026.057-.033.042.003.112c.046.092.681 1.523.787 1.74c.008.015.011.02.017.02c.008 0 .033-.026.047-.044q.219-.282.371-.606c.306-.635.44-1.325.486-1.706c.014-.11.021-.22.03-.33l.204-2.616l.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.4 1.4 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.4.4 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293q.114 1.473.233 2.946c.05.4.186 1.085.487 1.706c.103.215.223.419.37.606c.015.018.037.051.048.049c.02-.003.742-1.642.804-1.765c.036-.07.03-.055.003-.112m3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56q-.017 0-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.5.5 0 0 0-.02.191a.46.46 0 0 0 .23.378a1 1 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.5.5 0 0 0-.023.172a.47.47 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001q.017 0 .023-.015l.575-1.28a.025.025 0 0 0-.024-.035m-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829c0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047c.001.037.465 1.064.555 1.263c.01.02.03.033.051.033c.157.003.767.009.938-.014c.153-.02.3-.06.438-.132c.3-.156.49-.419.595-.765c.052-.172.075-.353.075-.533q.003-3.495-.007-6.991a.03.03 0 0 0-.032-.032zm11.784 6.896q-.002-.02-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084c-.37 0-1.11-.002-1.304 0c-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036s.013.008.058.008q2.622.003 5.243.002c.03-.001.034-.006.035-.033zm4.177-3.43q0 .021-.02.024c-.346.006-.692.004-1.037.004q-.021-.003-.022-.024q-.006-.651-.01-1.303c0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015c.093.025.16.107.165.204c.006.431.002 1.153.001 1.153m2.67.244a1.95 1.95 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21q.001-.198-.025-.394a1.8 1.8 0 0 0-.153-.53a1.53 1.53 0 0 0-.677-.71a2.2 2.2 0 0 0-1-.258c-.153-.003-.567 0-.72 0c-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007q-.008.008-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128v1.148s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003a.7.7 0 0 1 .28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185c0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033q.276.655.57 1.303a.05.05 0 0 0 .04.026c.17.005.34.002.51.003c.15-.002.517.004.666-.01a2 2 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981q.001-.191-.034-.38c0 .078-.029-.641-.724-.998" />
    </svg>
  );
}

function WechatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8.69 3C4.95 3 2 5.52 2 8.65c0 1.73.92 3.28 2.36 4.33l-.6 1.81 2.13-1.07c.72.21 1.48.33 2.27.36a5.51 5.51 0 0 1-.16-1.3c0-3.35 3.2-6.07 7.14-6.07.26 0 .52.01.77.04C15.32 4.28 12.28 3 8.69 3zm-2.6 3.56a.93.93 0 1 1 0-1.86.93.93 0 0 1 0 1.86zm4.6 0a.93.93 0 1 1 0-1.86.93.93 0 0 1 0 1.86zM22 12.78c0-2.65-2.82-4.8-5.86-4.8-3.27 0-5.86 2.15-5.86 4.8s2.59 4.8 5.86 4.8c.67 0 1.32-.1 1.92-.28l1.71.86-.48-1.45C20.96 15.78 22 14.38 22 12.78zm-7.87-1a.78.78 0 1 1 0-1.56.78.78 0 0 1 0 1.56zm4.01 0a.78.78 0 1 1 0-1.56.78.78 0 0 1 0 1.56z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.47 14.38c-.29-.14-1.7-.84-1.96-.93-.27-.1-.46-.15-.66.14-.19.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.23-.45-2.35-1.44-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.51.14-.17.19-.29.29-.49.1-.2.05-.37-.02-.51-.08-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.3-1.02 1-1.02 2.43 0 1.44 1.05 2.83 1.19 3.02.15.2 2.06 3.14 4.99 4.4.7.3 1.24.48 1.66.62.7.22 1.34.19 1.84.11.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.08-.12-.27-.19-.56-.34zM12.05 21.5c-1.8 0-3.55-.48-5.1-1.4l-.36-.22-3.78 1 1.01-3.69-.24-.38A9.44 9.44 0 0 1 2.1 12.05C2.1 6.56 6.56 2.1 12.05 2.1c2.66 0 5.16 1.04 7.04 2.92a9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.95 9.95zM12.05 0C5.43 0 0 5.43 0 12.05c0 2.12.56 4.19 1.61 6.02L0 24l6.1-1.6a12.04 12.04 0 0 0 5.95 1.57C18.67 23.97 24 18.6 24 12.05 24 5.43 18.67 0 12.05 0z" />
    </svg>
  );
}

function LinktreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11666l2.3248-2.3808 4.00468 4.11665V0h3.4727zm-3.4727 10.30614h3.4727V24h-3.4727z" />
    </svg>
  );
}

const socialIcons: Partial<Record<string, IconComponent>> = {
  facebook: Facebook,
  instagram: Instagram,
  xiaohongshu: XiaohongshuIcon,
  wechat: WechatIcon,
  whatsapp: WhatsAppIcon,
  linktree: LinktreeIcon,
};

export const wechatId = 'RenoStars';

const STAGGER_DELAY_MS = 80;

function SocialIcons({ socialLinks, toggleWechatModal, wechatId: wcId, t, wechatTriggerRef }: {
  socialLinks: SocialLink[];
  toggleWechatModal: () => void;
  wechatId: string;
  t: ReturnType<typeof useTranslations>;
  wechatTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeSocials = socialLinks.filter((s) => socialIcons[s.platform]);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {activeSocials.map((social, i) => {
        const Icon = socialIcons[social.platform]!;
        const animStyle: React.CSSProperties = {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.8)',
          transition: `opacity 0.4s ease-out ${i * STAGGER_DELAY_MS}ms, transform 0.4s ease-out ${i * STAGGER_DELAY_MS}ms`,
        };
        const className = 'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group';
        if (social.platform === 'wechat') {
          return (
            <button
              key={social.label}
              ref={wechatTriggerRef}
              type="button"
              onClick={toggleWechatModal}
              className={`${className} cursor-pointer`}
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', ...animStyle }}
              title={t('footer.wechatId', { id: wcId })}
              aria-label={social.label}
            >
              <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" aria-hidden="true" />
            </button>
          );
        }
        return (
          <a
            key={social.label}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', ...animStyle }}
            aria-label={social.label}
          >
            <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

function WechatModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeBtn = modalRef.current?.querySelector<HTMLElement>('button');
    closeBtn?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="WeChat QR Code"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1" style={{ color: NAVY }}>WeChat</h3>
          <p className="text-sm text-gray-500 mb-4">ID: {wechatId}</p>
          <Image
            src="/wechat-qr.png"
            alt="WeChat QR Code"
            width={300}
            height={300}
            className="mx-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

interface FooterProps {
  company: Company;
  socialLinks: SocialLink[];
  services: Service[];
  areas: ServiceArea[];
  googleRating?: number;
}

export default function Footer({ company, socialLinks, services, areas, googleRating }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [wechatModalOpen, setWechatModalOpen] = useState(false);
  const wechatTriggerRef = useRef<HTMLButtonElement>(null);
  const toggleWechatModal = useCallback(() => setWechatModalOpen((prev) => !prev), []);
  const localizedServices = useMemo(() => services.map((s) => ({ slug: s.slug, title: s.title[locale] })), [services, locale]);

  const quickLinks = useMemo(() => [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/about', label: t('nav.about') },
    { href: '/workflow', label: t('nav.process') },
    { href: '/design', label: t('nav.design') },
    { href: '/benefits', label: t('nav.benefits') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/blog', label: t('nav.blogAndNews') },
    { href: '/guides', label: t('nav.guides') },
    { href: '/financing', label: t('nav.financing') },
    { href: '/before-after', label: t('nav.beforeAfter') },
  ], [t]);

  const whyUsStats = useMemo(() => [
    { key: 'years', val: `${company.yearsExperience}+`, lbl: t('stats.yearsExperience') },
    { key: 'projects', val: company.projectsCompleted, lbl: t('stats.projectsCompleted') },
  ], [company, t]);

  return (
    <footer className="py-10" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand & Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src={company.logo}
              alt={company.name}
              width={160}
              height={36}
              className="h-9 w-auto object-contain rounded bg-white/95 px-2 py-1 mb-3"
            />
            <p className="text-sm text-white/80 mb-4">{company.tagline}</p>
            <SocialIcons socialLinks={socialLinks} toggleWechatModal={toggleWechatModal} wechatId={wechatId} t={t} wechatTriggerRef={wechatTriggerRef} />
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-white font-semibold text-sm mb-4">{t('footer.quickLinks')}</h2>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as '/'} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-white font-semibold text-sm mb-4">{t('nav.services')}</h2>
            <ul className="space-y-2">
              {localizedServices.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}` as '/'} className="text-sm text-white/80 hover:text-white transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-white font-semibold text-sm mb-4">{t('label.contact')}</h2>
            <div className="space-y-3">
              <a
                href={`tel:${company.phone}`}
                onClick={() => trackPhoneClick(company.phone)}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                {company.email}
              </a>
              <p className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <span>{company.address}</span>
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-white/50 mb-1.5">{t('footer.scanToConnect')}</p>
              <Image src="/reno-stars-qr.png" alt={t('footer.scanToConnect')} width={96} height={96} className="rounded bg-white p-1" />
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h2 className="text-white font-semibold text-sm mb-4">{t('section.whyUs')}</h2>
            <div className="space-y-2">
              {whyUsStats.map((stat) => (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: GOLD }}>{stat.val}</span>
                  <span className="text-sm text-white/70">{stat.lbl}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Image src={WORKSAFE_BC_LOGO} alt="WorkSafe BC" width={120} height={32} className="h-4 w-auto object-contain rounded-sm" />
                <span className="text-sm text-white/70">{t('stats.fullCoverage')}</span>
              </div>
              <div className="flex items-center gap-1.5" role="img" aria-label={`${googleRating ?? 5}/5 ${t('stats.rating')}`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5" style={{ fill: GOLD, color: GOLD }} />
                ))}
                <span className="text-sm text-white/70 ml-0.5">{googleRating ? `${googleRating} ${t('stats.rating')}` : t('stats.rating')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="py-6 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: GOLD }}>
            {t('section.serviceAreas')}
          </h2>
          <div className="flex flex-wrap gap-x-2 gap-y-2 lg:gap-x-3">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}` as '/'}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                {area.name[locale]}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} {company.name}. {t('footer.allRights')}</p>
          <p>{t('footer.licensedInsured')}</p>
        </div>
      </div>

      {/* WeChat QR Code Modal */}
      {wechatModalOpen && (
        <WechatModal onClose={() => { setWechatModalOpen(false); wechatTriggerRef.current?.focus(); }} />
      )}
    </footer>
  );
}
