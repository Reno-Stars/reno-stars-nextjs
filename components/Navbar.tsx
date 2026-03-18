'use client';

import Image from 'next/image';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import type { Company, ServiceArea } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { neu, SURFACE, SH_DARK, TEXT } from '@/lib/theme';

interface NavbarProps {
  company: Company;
  areas: ServiceArea[];
}

const LINK_CLASS = 'px-3 py-2 text-base font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5';

export default function Navbar({ company, areas }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const areasRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsAreasOpen(false);
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

  // Close areas dropdown on click outside or Escape key (desktop)
  useEffect(() => {
    if (!isAreasOpen || isMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (areasRef.current && !areasRef.current.contains(e.target as Node)) {
        setIsAreasOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAreasOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAreasOpen, isMenuOpen]);

  const navLinks = useMemo(() => [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/projects', label: t('nav.projects') },
    { href: '/design', label: t('nav.design') },
    { href: '/benefits', label: t('nav.benefits') },
    { href: '/process', label: t('nav.process') },
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
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href as '/'} className={LINK_CLASS} style={{ color: TEXT }}>
                {item.label}
              </Link>
            ))}

            {/* Areas dropdown */}
            <div ref={areasRef} className="relative flex items-center">
              <Link
                href={'/areas' as '/'}
                className="px-3 py-2 pr-1 text-base font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5"
                style={{ color: TEXT }}
              >
                {t('nav.areas')}
              </Link>
              <button
                onClick={() => setIsAreasOpen((prev) => !prev)}
                className="p-2 rounded cursor-pointer transition-colors duration-200 hover:bg-black/5"
                style={{ color: TEXT }}
                aria-expanded={isAreasOpen}
                aria-haspopup="true"
                aria-label={t('nav.toggleAreas')}
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAreasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAreasOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 w-56 max-h-[70vh] overflow-y-auto rounded-xl py-2 shadow-lg border"
                  style={{ backgroundColor: SURFACE, borderColor: `${TEXT}15` }}
                >
                  {areas.map((area) => (
                    <Link
                      key={area.slug}
                      role="menuitem"
                      href={`/areas/${area.slug}` as '/'}
                      onClick={() => setIsAreasOpen(false)}
                      className="block px-4 py-2.5 text-base transition-colors duration-150 hover:bg-black/5"
                      style={{ color: TEXT }}
                    >
                      {area.name[locale]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href as '/'} onClick={closeMenu}
                className="block py-2.5 px-3 text-base font-medium cursor-pointer rounded-lg" style={{ color: TEXT }}>
                {item.label}
              </Link>
            ))}

            {/* Areas expandable */}
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg">
              <Link
                href={'/areas' as '/'}
                onClick={closeMenu}
                className="text-base font-medium cursor-pointer"
                style={{ color: TEXT }}
              >
                {t('nav.areas')}
              </Link>
              <button
                onClick={() => setIsAreasOpen((prev) => !prev)}
                className="p-2 -mr-2 rounded cursor-pointer transition-colors duration-200 hover:bg-black/5"
                style={{ color: TEXT }}
                aria-expanded={isAreasOpen}
                aria-controls="mobile-areas"
                aria-label={t('nav.toggleAreas')}
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAreasOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {isAreasOpen && (
              <div id="mobile-areas" className="pl-4 space-y-0.5">
                {areas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/areas/${area.slug}` as '/'}
                    onClick={closeMenu}
                    className="block py-2.5 px-3 text-base cursor-pointer rounded-lg hover:bg-black/5"
                    style={{ color: TEXT }}
                  >
                    {area.name[locale]}
                  </Link>
                ))}
              </div>
            )}

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
