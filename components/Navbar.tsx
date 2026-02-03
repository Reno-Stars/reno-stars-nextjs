'use client';

import Link from 'next/link';
import { Menu, X, Globe, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { company } from '@/lib/data';
import { neu, SURFACE, SH_DARK, TEXT, GOLD } from '@/lib/theme';

interface NavbarProps {
  variant: 'landing' | 'projects';
}

export default function Navbar({ variant }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const landingNavLinks = [
    { href: '#services', label: t('nav.services') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#testimonials', label: t('nav.testimonials') },
    { href: '#contact', label: t('nav.contact') },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: `${SURFACE}ee`, boxShadow: `0 1px 0 ${SH_DARK}40` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="shrink-0">
            <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {variant === 'landing' ? (
              <>
                {landingNavLinks.map((item) => (
                  <a key={item.href} href={item.href}
                    className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5"
                    style={{ color: TEXT }}
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/projects"
                  className="px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5"
                  style={{ color: GOLD }}
                >
                  {t('nav.projects')}
                </Link>
              </>
            ) : (
              <>
                <Link href="/"
                  className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5 flex items-center gap-1.5"
                  style={{ color: TEXT }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('nav.back')}
                </Link>
                <span className="px-3 py-2 text-sm font-semibold rounded-lg" style={{ color: GOLD }}>
                  {t('nav.projects')}
                </span>
              </>
            )}
            <div className="w-px h-5 mx-2" style={{ backgroundColor: `${TEXT}20` }} />
            <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200"
              style={{ boxShadow: neu(3), color: TEXT }}
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg cursor-pointer"
            style={{ boxShadow: neu(3) }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" style={{ color: TEXT }} aria-hidden="true" /> : <Menu className="w-5 h-5" style={{ color: TEXT }} aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden pb-3 space-y-1 border-t" style={{ borderColor: `${TEXT}10` }}>
            {variant === 'landing' ? (
              <>
                {landingNavLinks.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                    className="block py-2 px-3 text-sm font-medium cursor-pointer rounded-lg" style={{ color: TEXT }}>{item.label}</a>
                ))}
                <Link href="/projects" onClick={() => setIsMenuOpen(false)}
                  className="block py-2 px-3 text-sm font-semibold cursor-pointer rounded-lg" style={{ color: GOLD }}>{t('nav.projects')}</Link>
              </>
            ) : (
              <>
                <Link href="/" onClick={() => setIsMenuOpen(false)}
                  className="block py-2 px-3 text-sm font-medium cursor-pointer rounded-lg flex items-center gap-1.5" style={{ color: TEXT }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('nav.back')}
                </Link>
                <span className="block py-2 px-3 text-sm font-semibold rounded-lg" style={{ color: GOLD }}>{t('nav.projects')}</span>
              </>
            )}
            <button onClick={() => { setLang(lang === 'en' ? 'zh' : 'en'); setIsMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-sm font-medium cursor-pointer rounded-lg flex items-center gap-2" style={{ color: TEXT }}>
              <Globe className="w-4 h-4" /> {lang === 'en' ? '中文' : 'English'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
