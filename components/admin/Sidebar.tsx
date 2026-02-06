'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAVY, NAVY_LIGHT, GOLD, SURFACE } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

export default function Sidebar() {
  const pathname = usePathname();
  const t = useAdminTranslations();

  const links = [
    { href: '/admin', label: t.nav.dashboard, exact: true },
    { href: '/admin/company', label: t.nav.company },
    { href: '/admin/sites', label: t.nav.sites },
    { href: '/admin/services', label: t.nav.services },
    { href: '/admin/blog', label: t.nav.blog },
    { href: '/admin/contacts', label: t.nav.contacts },
    { href: '/admin/social-links', label: t.nav.socialLinks },
    { href: '/admin/service-areas', label: t.nav.serviceAreas },
    { href: '/admin/gallery', label: t.nav.gallery },
    { href: '/admin/trust-badges', label: t.nav.trustBadges },
    { href: '/admin/faqs', label: t.nav.faqs },
    { href: '/admin/showroom', label: t.nav.showroom },
    { href: '/admin/about', label: t.nav.about },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href || pathname === href + '/';
    return pathname.startsWith(href + '/') || pathname === href;
  }

  return (
    <nav
      aria-label={t.nav.adminNavigation}
      style={{
        width: '220px',
        backgroundColor: NAVY,
        color: SURFACE,
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '0 1.25rem',
          marginBottom: '2rem',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: GOLD,
        }}
      >
        {t.nav.renoStars}
      </div>
      {links.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'block',
              padding: '0.625rem 1.25rem',
              color: active ? GOLD : SURFACE,
              backgroundColor: active ? NAVY_LIGHT : 'transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 400,
              borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
