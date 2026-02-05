'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAVY, NAVY_LIGHT, GOLD, SURFACE } from '@/lib/theme';

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/company', label: 'Company' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/contacts', label: 'Contacts' },
  { href: '/admin/social-links', label: 'Social Links' },
  { href: '/admin/service-areas', label: 'Service Areas' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/trust-badges', label: 'Trust Badges' },
  { href: '/admin/showroom', label: 'Showroom' },
  { href: '/admin/about', label: 'About' },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href || pathname === href + '/';
    return pathname.startsWith(href + '/') || pathname === href;
  }

  return (
    <nav
      aria-label="Admin navigation"
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
        Reno Stars
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
