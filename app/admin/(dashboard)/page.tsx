import Link from 'next/link';
import { db } from '@/lib/db';
import {
  projects,
  services,
  testimonials,
  contactSubmissions,
  blogPosts,
  faqs,
  galleryItems,
  serviceAreas,
  socialLinks,
  trustBadges,
} from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { CARD, NAVY, TEXT_MID, GOLD, neu } from '@/lib/theme';

interface DashboardCard {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}

async function getStats() {
  const [
    projectCount,
    serviceCount,
    testimonialCount,
    contactCount,
    newContactCount,
    blogCount,
    faqCount,
    galleryCount,
    areaCount,
    socialCount,
    badgeCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(testimonials),
    db.select({ value: count() }).from(contactSubmissions),
    db.select({ value: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new')),
    db.select({ value: count() }).from(blogPosts),
    db.select({ value: count() }).from(faqs),
    db.select({ value: count() }).from(galleryItems),
    db.select({ value: count() }).from(serviceAreas),
    db.select({ value: count() }).from(socialLinks),
    db.select({ value: count() }).from(trustBadges),
  ]);

  return {
    projects: projectCount[0].value,
    services: serviceCount[0].value,
    testimonials: testimonialCount[0].value,
    contacts: contactCount[0].value,
    newContacts: newContactCount[0].value,
    blogPosts: blogCount[0].value,
    faqs: faqCount[0].value,
    gallery: galleryCount[0].value,
    areas: areaCount[0].value,
    socialLinks: socialCount[0].value,
    badges: badgeCount[0].value,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards: DashboardCard[] = [
    { label: 'Projects', value: stats.projects, href: '/admin/projects' },
    { label: 'Services', value: stats.services, href: '/admin/services' },
    { label: 'Testimonials', value: stats.testimonials, href: '/admin/testimonials' },
    { label: 'Blog Posts', value: stats.blogPosts, href: '/admin/blog' },
    { label: 'FAQs', value: stats.faqs, href: '/admin/faqs' },
    { label: 'Gallery', value: stats.gallery, href: '/admin/gallery' },
    { label: 'Service Areas', value: stats.areas, href: '/admin/service-areas' },
    { label: 'Social Links', value: stats.socialLinks, href: '/admin/social-links' },
    { label: 'Trust Badges', value: stats.badges, href: '/admin/trust-badges' },
    { label: 'Contacts', value: stats.contacts, href: '/admin/contacts' },
    { label: 'New Contacts', value: stats.newContacts, href: '/admin/contacts', highlight: stats.newContacts > 0 },
  ];

  return (
    <div>
      <h1
        style={{
          color: NAVY,
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
        }}
      >
        Dashboard
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.label}
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
