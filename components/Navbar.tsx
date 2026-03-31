'use client';

import OptimizedImage from '@/components/OptimizedImage';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import type { Company, Service } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { neu, SURFACE, SH_DARK, TEXT } from '@/lib/theme';

interface NavbarProps {
  company: Company;
  services?: Service[];
}

interface NavLink {
  href: string;
  label: string;
  isDropdown?: boolean;
}

const LINK_CLASS = 'px-3 py-2 text-base font-medium rounded-lg cursor-pointer transition-colors duration-200 hover:bg-black/5';
const DROPDOWN_CLOSE_DELAY_MS = 150;

export default function Navbar({ company, services = [] }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  const isLinkActive = useCallback((item: NavLink) => {
    if (item.isDropdown) return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  }, [pathname]);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!isProjectsDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProjectsDropdownOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsProjectsDropdownOpen(true);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setIsProjectsDropdownOpen(false), DROPDOWN_CLOSE_DELAY_MS);
  }, []);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsProjectsDropdownOpen(false);
      // Return focus to trigger
      const trigger = dropdownRef.current?.querySelector<HTMLAnchorElement>('a');
      trigger?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isProjectsDropdownOpen) {
        setIsProjectsDropdownOpen(true);
      } else {
        // Focus next item in dropdown
        const items = dropdownItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
        const idx = items.indexOf(document.activeElement as HTMLAnchorElement);
        if (idx < items.length - 1) items[idx + 1]?.focus();
        else if (idx === -1 && items.length > 0) items[0]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = dropdownItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
      const idx = items.indexOf(document.activeElement as HTMLAnchorElement);
      if (idx > 0) items[idx - 1]?.focus();
      else if (idx === 0) {
        // Return focus to trigger
        const trigger = dropdownRef.current?.querySelector<HTMLAnchorElement>('a');
        trigger?.focus();
      }
    }
  }, [isProjectsDropdownOpen]);

  // Keep ref array in sync with the number of dropdown items (1 "All" + N services)
  const dropdownItemCount = 1 + services.length;
  if (dropdownItemsRef.current.length !== dropdownItemCount) {
    dropdownItemsRef.current = Array.from({ length: dropdownItemCount }, (_, i) => dropdownItemsRef.current[i] ?? null);
  }

  const navLinks: NavLink[] = useMemo(() => [
    { href: '/', label: t('nav.home') },
    { href: '/projects', label: t('nav.projects'), isDropdown: true },
    { href: '/about', label: t('nav.about') },
    { href: '/workflow', label: t('nav.process') },
    { href: '/services', label: t('nav.services') },
    { href: '/design', label: t('nav.design') },
    { href: '/features', label: t('nav.features') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/blog', label: t('nav.blogAndNews') },
  ], [t]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm" aria-label="Main navigation" style={{ backgroundColor: `${SURFACE}ee`, boxShadow: `0 1px 0 ${SH_DARK}40` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="shrink-0">
            <OptimizedImage src={company.logo} alt={company.name} width={180} height={40} priority placeholder="empty" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((item) => {
              const isActive = isLinkActive(item);

              if (item.isDropdown && services.length > 0) {
                return (
                  <div
                    key={item.href}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                    onKeyDown={handleDropdownKeyDown}
                  >
                    <Link
                      href={item.href as '/'}
                      className={`${LINK_CLASS} inline-flex items-center gap-1`}
                      style={{ color: TEXT }}
                      {...(isActive && { 'aria-current': 'page' as const })}
                      aria-expanded={isProjectsDropdownOpen}
                      aria-haspopup="menu"
                    >
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProjectsDropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    {isProjectsDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-1 py-2 rounded-xl min-w-[200px] z-50"
                        style={{ backgroundColor: SURFACE, boxShadow: neu(6), border: `1px solid ${TEXT}10` }}
                        role="menu"
                        aria-label={item.label}
                      >
                        <a
                          href={`/${locale}/projects`}
                          ref={(el) => { dropdownItemsRef.current[0] = el; }}
                          className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 cursor-pointer"
                          style={{ color: TEXT }}
                          role="menuitem"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsProjectsDropdownOpen(false);
                            router.push('/projects' as '/');
                          }}
                        >
                          {t('filter.allCategories')}
                        </a>
                        <div className="h-px mx-3 my-1" style={{ backgroundColor: `${TEXT}10` }} />
                        {services.map((service, i) => (
                          <a
                            key={service.slug}
                            href={`/${locale}/projects?service=${encodeURIComponent(service.slug)}`}
                            ref={(el) => { dropdownItemsRef.current[i + 1] = el; }}
                            className="block px-4 py-2 text-sm transition-colors hover:bg-black/5 cursor-pointer"
                            style={{ color: TEXT }}
                            role="menuitem"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsProjectsDropdownOpen(false);
                              router.push(`/projects?service=${encodeURIComponent(service.slug)}` as '/');
                            }}
                          >
                            {service.title[locale]}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

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
              const isActive = isLinkActive(item);

              if (item.isDropdown && services.length > 0) {
                return (
                  <div key={item.href}>
                    <Link href={item.href as '/'} onClick={closeMenu}
                      className="block py-2.5 px-3 text-base font-medium cursor-pointer rounded-lg" style={{ color: TEXT }}
                      {...(isActive && { 'aria-current': 'page' as const })}>
                      {item.label}
                    </Link>
                    <ul className="pl-6 space-y-0.5 list-none" role="list" aria-label={item.label}>
                      {services.map((service) => (
                        <li key={service.slug}>
                          <a
                            href={`/${locale}/projects?service=${encodeURIComponent(service.slug)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              closeMenu();
                              router.push(`/projects?service=${encodeURIComponent(service.slug)}` as '/');
                            }}
                            className="block py-1.5 px-3 text-sm cursor-pointer rounded-lg"
                            style={{ color: `${TEXT}cc` }}
                          >
                            {service.title[locale]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

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
