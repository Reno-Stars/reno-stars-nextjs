'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAVY, NAVY_LIGHT, GOLD, SURFACE } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface SidebarProps {
  onNavigate?: () => void;
}

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
  defaultExpanded: boolean;
}

const STORAGE_KEY = 'admin_sidebar_groups';

// Group keys and their default expanded state (defined outside component for stability)
const GROUP_DEFAULTS: Record<string, boolean> = {
  portfolio: true,
  content: true,
  crm: true,
  settings: false,
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      style={{
        transition: 'transform 0.2s ease',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const t = useAdminTranslations();
  const processedPathRef = useRef<string | null>(null);

  const navGroups: NavGroup[] = useMemo(() => [
    {
      key: 'portfolio',
      label: t.nav.groups.portfolio,
      items: [
        { href: '/admin/sites', label: t.nav.sites },
        { href: '/admin/services', label: t.nav.services },
        { href: '/admin/service-areas', label: t.nav.serviceAreas },
        { href: '/admin/batch-upload', label: t.batchUpload.navLabel },
      ],
      defaultExpanded: true,
    },
    {
      key: 'content',
      label: t.nav.groups.content,
      items: [
        { href: '/admin/blog', label: t.nav.blog },
        { href: '/admin/social-posts', label: t.nav.socialPosts },
        { href: '/admin/gallery', label: t.nav.gallery },
        { href: '/admin/faqs', label: t.nav.faqs },
        { href: '/admin/trust-badges', label: t.nav.trustBadges },
        { href: '/admin/partners', label: t.nav.partners },
      ],
      defaultExpanded: true,
    },
    {
      key: 'crm',
      label: t.nav.groups.crm,
      items: [{ href: '/admin/contacts', label: t.nav.contacts }],
      defaultExpanded: true,
    },
    {
      key: 'settings',
      label: t.nav.groups.settings,
      items: [
        { href: '/admin/company', label: t.nav.company },
        { href: '/admin/showroom', label: t.nav.showroom },
        { href: '/admin/social-links', label: t.nav.socialLinks },
        { href: '/admin/about', label: t.nav.about },
      ],
      defaultExpanded: false,
    },
  ], [t]);

  // Initialize expanded state with stable defaults (avoids referencing navGroups in initializer)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({ ...GROUP_DEFAULTS }));

  // Load persisted state after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpandedGroups((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }
  }, []);

  // Auto-expand group when navigating to a child item
  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, '');

    // Skip if we've already processed this path
    if (processedPathRef.current === normalizedPath) {
      return;
    }
    processedPathRef.current = normalizedPath;

    for (const group of navGroups) {
      const hasActiveItem = group.items.some((item) => {
        const normalizedHref = item.href.replace(/\/$/, '');
        return normalizedPath.startsWith(normalizedHref + '/') || normalizedPath === normalizedHref;
      });
      if (hasActiveItem) {
        setExpandedGroups((prev) => {
          // Only update if not already expanded
          if (prev[group.key]) {
            return prev;
          }
          const updated = { ...prev, [group.key]: true };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // Ignore localStorage errors
          }
          return updated;
        });
        break;
      }
    }
  }, [pathname, navGroups]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  const isActive = useCallback((href: string, exact?: boolean) => {
    const normalizedPath = pathname.replace(/\/$/, '');
    const normalizedHref = href.replace(/\/$/, '');
    if (exact) return normalizedPath === normalizedHref;
    return normalizedPath.startsWith(normalizedHref + '/') || normalizedPath === normalizedHref;
  }, [pathname]);

  const isDashboardActive = isActive('/admin', true);

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
        flex: 1,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '0 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: GOLD,
        }}
      >
        {t.nav.renoStars}
      </div>

      {/* Dashboard link (standalone) */}
      <Link
        href="/admin"
        onClick={onNavigate}
        aria-current={isDashboardActive ? 'page' : undefined}
        style={{
          display: 'block',
          padding: '0.625rem 1.25rem',
          color: isDashboardActive ? GOLD : SURFACE,
          backgroundColor: isDashboardActive ? NAVY_LIGHT : 'transparent',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: isDashboardActive ? 600 : 400,
          borderLeft: isDashboardActive ? `3px solid ${GOLD}` : '3px solid transparent',
          marginBottom: '0.5rem',
        }}
      >
        {t.nav.dashboard}
      </Link>

      {/* Collapsible groups */}
      {navGroups.map((group) => {
        const expanded = expandedGroups[group.key] ?? group.defaultExpanded;
        const headerId = `sidebar-group-header-${group.key}`;
        const contentId = `sidebar-group-content-${group.key}`;
        return (
          <div key={group.key}>
            {/* Group header */}
            <button
              type="button"
              id={headerId}
              onClick={() => toggleGroup(group.key)}
              aria-expanded={expanded}
              aria-controls={contentId}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                marginTop: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: `rgba(200, 146, 42, 0.7)`,
                textAlign: 'left',
              }}
            >
              <ChevronIcon expanded={expanded} />
              {group.label}
            </button>

            {/* Group items */}
            {expanded && (
              <div
                id={contentId}
                role="region"
                aria-labelledby={headerId}
              >
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'block',
                        padding: '0.625rem 1.25rem 0.625rem 2.25rem',
                        color: active ? GOLD : SURFACE,
                        backgroundColor: active ? NAVY_LIGHT : 'transparent',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
