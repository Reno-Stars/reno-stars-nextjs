'use client';

import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { company, socialLinks } from '@/lib/data';
import { NAVY, GOLD } from '@/lib/theme';

const socialIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-10" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Social */}
          <div className="md:col-span-1">
            <img
              src={company.logo}
              alt={company.name}
              className="h-9 w-auto object-contain rounded bg-white/95 px-2 py-1 mb-3"
              loading="lazy"
            />
            <p className="text-sm text-white/40 mb-4">{company.tagline}</p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.platform];
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-white/60 hover:text-white" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('label.contact')}</h4>
            <div className="space-y-3">
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <Phone className="w-4 h-4" style={{ color: GOLD }} />
                {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <Mail className="w-4 h-4" style={{ color: GOLD }} />
                {company.email}
              </a>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('label.location')}</h4>
            <p className="flex items-start gap-2 text-sm text-white/50">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
              <span>{company.address}</span>
            </p>
          </div>

          {/* Quick Stats */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('section.whyUs')}</h4>
            <div className="space-y-2">
              {[
                { val: `${company.yearsExperience}+`, lbl: t('stats.yearsExperience') },
                { val: company.liabilityCoverage, lbl: t('stats.liabilityCoverage') },
                { val: company.rating, lbl: `${company.ratingSource} ${t('stats.rating')}` },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: GOLD }}>{stat.val}</span>
                  <span className="text-xs text-white/40">{stat.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p>&copy; {new Date().getFullYear()} {company.name}. {t('footer.allRights')}</p>
          <p>{t('footer.licensedInsured')}</p>
        </div>
      </div>
    </footer>
  );
}
