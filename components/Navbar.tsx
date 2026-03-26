'use client';

import Image from 'next/image';
import { Menu, X, Globe } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import type { Company } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { neu, SURFACE, SH_DARK, TEXT } from '@/lib/theme';

interface NavbarProps {
  company: Company;
}

const LINK_CLASS = 'px-3 py-2 text-base font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5';

export default function Navbar({ company }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;
    const focusableSelector = 'a[href], button:not([disabled])';
    const focusables = () => menu.querySelectorAll<HTMLElement>(focusableSelector);
    focusables()[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  const navLinks = useMemo(() => [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/about', label: t('nav.about') },
    { href: '/design', label: t('nav.design') },
    { href: '/benefits', label: t('nav.benefits') },
    { href: '/workflow', label: t('nav.process') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/blog', label: t('nav.blogAndNews') },
  ], [t]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm" aria-label="Main navigation" style={{ backgroundColor: `${SURFACE}ee`, boxShadow: `0 1px 0 ${SH_DARK}40` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="shrink-0">
            <Image src={company.logo} alt={company.name} width={180} height={40} priority className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href as '/'} className={LINK_CLASS} style={{ color: TEXT }} {...(isActive && { 'aria-current': 'page' as const })}>
                  {item.label}
                </Link>
              );
            })}

            <div className="w-px h-5 mx-2" style={{ backgroundColor: `${TEXT}20` }} />
            <Link
              href={pathname || '/'}
              locale={locale === 'en' ? 'zh' : 'en'}
              className="px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all duration-200"
              style={{ boxShadow: neu(3), color: TEXT }}
              aria-label={t('nav.switchLanguage')}
            >
              {locale === 'en' ? '中文' : 'EN'}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg cursor-pointer"
            style={{ boxShadow: neu(3) }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {isMenuOpen
              ? <X className="w-5 h-5" style={{ color: TEXT }} aria-hidden="true" />
              : <Menu className="w-5 h-5" style={{ color: TEXT }} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div ref={menuRef} id="mobile-menu" className="lg:hidden pb-3 space-y-1 border-t" style={{ borderColor: `${TEXT}10` }}>
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href as '/'} onClick={closeMenu}
                  className="block py-2.5 px-3 text-base font-medium cursor-pointer rounded-lg" style={{ color: TEXT }}
                  {...(isActive && { 'aria-current': 'page' as const })}>
                  {item.label}
                </Link>
              );
            })}

            <Link href={pathname || '/'} locale={locale === 'en' ? 'zh' : 'en'} onClick={closeMenu}
              className="w-full text-left py-2.5 px-3 text-base font-medium cursor-pointer rounded-lg flex items-center gap-2" style={{ color: TEXT }}>
              <Globe className="w-4 h-4" /> {locale === 'en' ? '中文' : 'English'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
