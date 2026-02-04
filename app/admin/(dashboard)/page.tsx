import Link from 'next/link';
import { db } from '@/lib/db';
import {
  projects,
  services,
  testimonials,
  contactSubmissions,
  blogPosts,
} from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';

async function getStats() {
  const [projectCount, serviceCount, testimonialCount, contactCount, newContactCount, blogCount] =
    await Promise.all([
      db.select({ value: count() }).from(projects),
      db.select({ value: count() }).from(services),
      db.select({ value: count() }).from(testimonials),
      db.select({ value: count() }).from(contactSubmissions),
      db.select({ value: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new')),
      db.select({ value: count() }).from(blogPosts),
    ]);

  return {
    projects: projectCount[0].value,
    services: serviceCount[0].value,
    testimonials: testimonialCount[0].value,
    contacts: contactCount[0].value,
    newContacts: newContactCount[0].value,
    blogPosts: blogCount[0].value,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Projects', value: stats.projects, href: '/admin/projects' },
    { label: 'Services', value: stats.services, href: '/admin/services' },
    { label: 'Testimonials', value: stats.testimonials, href: '/admin/testimonials' },
    { label: 'Blog Posts', value: stats.blogPosts, href: '/admin/blog' },
    { label: 'Contacts', value: stats.contacts, href: '/admin/contacts' },
    { label: 'New Contacts', value: stats.newContacts, href: '/admin/contacts' },
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
                color: NAVY,
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
