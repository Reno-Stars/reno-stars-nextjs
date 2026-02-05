'use client';

import Link from 'next/link';
import { CARD, NAVY, TEXT_MID, GOLD, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface DashboardStats {
  projects: number;
  services: number;
  testimonials: number;
  contacts: number;
  newContacts: number;
  blogPosts: number;
  faqs: number;
  gallery: number;
  areas: number;
  socialLinks: number;
  badges: number;
}

interface DashboardCard {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const t = useAdminTranslations();

  const cards: DashboardCard[] = [
    { label: t.dashboard.projects, value: stats.projects, href: '/admin/projects' },
    { label: t.dashboard.services, value: stats.services, href: '/admin/services' },
    { label: t.dashboard.testimonials, value: stats.testimonials, href: '/admin/testimonials' },
    { label: t.dashboard.blogPosts, value: stats.blogPosts, href: '/admin/blog' },
    { label: t.dashboard.faqs, value: stats.faqs, href: '/admin/faqs' },
    { label: t.dashboard.gallery, value: stats.gallery, href: '/admin/gallery' },
    { label: t.dashboard.serviceAreas, value: stats.areas, href: '/admin/service-areas' },
    { label: t.dashboard.socialLinks, value: stats.socialLinks, href: '/admin/social-links' },
    { label: t.dashboard.trustBadges, value: stats.badges, href: '/admin/trust-badges' },
    { label: t.dashboard.contacts, value: stats.contacts, href: '/admin/contacts' },
    { label: t.dashboard.newContacts, value: stats.newContacts, href: '/admin/contacts', highlight: stats.newContacts > 0 },
  ];

  return (
    <div>
      <AdminPageHeader titleKey="dashboard.title" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.href + card.label}
            href={card.href}
            style={{
              backgroundColor: CARD,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: neu(6),
              textDecoration: 'none',
              display: 'block',
              borderLeft: card.highlight ? `4px solid ${GOLD}` : undefined,
            }}
          >
            <div
              style={{
                color: TEXT_MID,
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                color: card.highlight ? GOLD : NAVY,
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {card.value}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
