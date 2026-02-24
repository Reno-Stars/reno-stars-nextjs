'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CARD, NAVY, TEXT_MID, GOLD, TEXT, INFO, ERROR, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import {
  FolderOpen,
  Wrench,
  MapPin,
  FileText,
  Images,
  CircleHelp,
  Share2,
  ShieldCheck,
  Handshake,
  Mail,
  BellRing,
  Building2,
  Store,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

interface DashboardStats {
  projects: number;
  services: number;
  contacts: number;
  newContacts: number;
  blogPosts: number;
  faqs: number;
  gallery: number;
  areas: number;
  socialLinks: number;
  badges: number;
  partners: number;
}

interface CardDef {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  accent: string;
  highlight?: boolean;
  notify?: boolean;
}

interface LinkCardDef {
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

interface SectionDef {
  title: string;
  cards: CardDef[];
}

function DashboardCard({ card }: { card: CardDef }) {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: CARD,
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: hovered ? neu(8) : neu(4),
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        borderLeft: card.highlight ? `4px solid ${GOLD}` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: card.accent + '14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Icon size={20} color={card.accent} strokeWidth={1.8} />
          {card.notify && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: ERROR,
                border: `2px solid ${CARD}`,
              }}
            />
          )}
        </div>
        <span style={{ color: TEXT_MID, fontSize: '0.875rem' }}>
          {card.label}
        </span>
      </div>
      <div
        style={{
          color: card.highlight ? GOLD : NAVY,
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {card.value}
      </div>
    </Link>
  );
}

function SettingsLinkCard({ card }: { card: LinkCardDef }) {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: CARD,
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        boxShadow: hovered ? neu(8) : neu(4),
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: card.accent + '14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={card.accent} strokeWidth={1.8} />
      </div>
      <span style={{ color: TEXT, fontSize: '0.875rem', fontWeight: 500 }}>
        {card.label}
      </span>
    </Link>
  );
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const t = useAdminTranslations();

  const settingsCards: LinkCardDef[] = [
    { label: t.dashboard.company, href: '/admin/company', icon: Building2, accent: NAVY },
    { label: t.dashboard.showroom, href: '/admin/showroom', icon: Store, accent: NAVY },
    { label: t.dashboard.about, href: '/admin/about', icon: BookOpen, accent: NAVY },
  ];

  const sections: SectionDef[] = [
    {
      title: t.dashboard.groupPortfolio,
      cards: [
        { label: t.dashboard.projects, value: stats.projects, href: '/admin/projects', icon: FolderOpen, accent: NAVY },
        { label: t.dashboard.services, value: stats.services, href: '/admin/services', icon: Wrench, accent: NAVY },
        { label: t.dashboard.serviceAreas, value: stats.areas, href: '/admin/service-areas', icon: MapPin, accent: NAVY },
      ],
    },
    {
      title: t.dashboard.groupContent,
      cards: [
        { label: t.dashboard.blogPosts, value: stats.blogPosts, href: '/admin/blog', icon: FileText, accent: INFO },
        { label: t.dashboard.gallery, value: stats.gallery, href: '/admin/gallery', icon: Images, accent: INFO },
        { label: t.dashboard.faqs, value: stats.faqs, href: '/admin/faqs', icon: CircleHelp, accent: INFO },
        { label: t.dashboard.socialLinks, value: stats.socialLinks, href: '/admin/social-links', icon: Share2, accent: INFO },
        { label: t.dashboard.trustBadges, value: stats.badges, href: '/admin/trust-badges', icon: ShieldCheck, accent: INFO },
        { label: t.dashboard.partners, value: stats.partners, href: '/admin/partners', icon: Handshake, accent: INFO },
      ],
    },
    {
      title: t.dashboard.groupCrm,
      cards: [
        { label: t.dashboard.contacts, value: stats.contacts, href: '/admin/contacts', icon: Mail, accent: NAVY },
        { label: t.dashboard.newContacts, value: stats.newContacts, href: '/admin/contacts?status=new', icon: BellRing, accent: GOLD, highlight: stats.newContacts > 0, notify: stats.newContacts > 0 },
      ],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: TEXT, fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {t.dashboard.welcome}
        </h1>
        <p style={{ color: TEXT_MID, fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
          {t.dashboard.subtitle}
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              color: TEXT_MID,
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem',
            }}
          >
            {section.title}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {section.cards.map((card, index) => (
              <DashboardCard key={`${section.title}-${index}`} card={card} />
            ))}
          </div>
        </div>
      ))}

      {/* Settings — link-only cards (singletons, no counts) */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            color: TEXT_MID,
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.75rem',
          }}
        >
          {t.dashboard.groupSettings}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {settingsCards.map((card) => (
            <SettingsLinkCard key={card.href} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
