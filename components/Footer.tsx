'use client';

import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { useMemo, type SVGProps } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import type { Company, SocialLink, Service } from '@/lib/types';
import type { ServiceArea } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { NAVY, GOLD } from '@/lib/theme';

type IconComponent = React.ComponentType<{ className?: string }>;

function XiaohongshuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.8 14.2h-1.6v-3.4H8.8v-1.6h3.4V7.8h1.6v3.4h3.4v1.6h-3.4v3.4z" />
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

const socialIcons: Partial<Record<string, IconComponent>> = {
  facebook: Facebook,
  instagram: Instagram,
  xiaohongshu: XiaohongshuIcon,
  wechat: WechatIcon,
  whatsapp: WhatsAppIcon,
};

export const wechatId = 'RenoStars';

interface FooterProps {
  company: Company;
  socialLinks: SocialLink[];
  services: Service[];
  areas: ServiceArea[];
}

export default function Footer({ company, socialLinks, services, areas }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const localizedServices = useMemo(() => services.map((s) => ({ slug: s.slug, title: s.title[locale] })), [services, locale]);

  const quickLinks = useMemo(() => [
    { href: '/', label: t('nav.home') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/design', label: t('nav.design') },
    { href: '/benefits', label: t('nav.benefits') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/blog', label: t('nav.blogAndNews') },
  ], [t]);

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
            <p className="text-sm text-white/60 mb-4">{company.tagline}</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.platform];
                if (!Icon) return null;
                if (social.platform === 'wechat') {
                  return (
                    <span
                      key={social.label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center cursor-default group"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                      title={t('footer.wechatId', { id: wechatId })}
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" aria-hidden="true" />
                    </span>
                  );
                }
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-white/40 mt-2">{t('footer.wechatId', { id: wechatId })}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as '/'} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('nav.services')}</h4>
            <ul className="space-y-2">
              {localizedServices.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}` as '/'} className="text-sm text-white/70 hover:text-white transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('label.contact')}</h4>
            <div className="space-y-3">
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white/90 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white/90 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                {company.email}
              </a>
              <p className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <span>{company.address}</span>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('section.whyUs')}</h4>
            <div className="space-y-2">
              {[
                { key: 'years', val: `${company.yearsExperience}+`, lbl: t('stats.yearsExperience') },
                { key: 'liability', val: company.liabilityCoverage, lbl: t('stats.liabilityCoverage') },
                { key: 'rating', val: company.rating, lbl: `${company.ratingSource} ${t('stats.rating')}` },
              ].map((stat) => (
                <div key={stat.key} className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: GOLD }}>{stat.val}</span>
                  <span className="text-xs text-white/60">{stat.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="py-6 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: GOLD }}>
            {t('section.serviceAreas')}
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}` as '/'}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {area.name[locale]}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} {company.name}. {t('footer.allRights')}</p>
          <p>{t('footer.licensedInsured')}</p>
        </div>
      </div>
    </footer>
  );
}
