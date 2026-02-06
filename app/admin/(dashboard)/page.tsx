import { db } from '@/lib/db';
import {
  projects,
  services,
  contactSubmissions,
  blogPosts,
  faqs,
  galleryItems,
  serviceAreas,
  socialLinks,
  trustBadges,
} from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import DashboardClient from './DashboardClient';

async function getStats() {
  const [
    projectCount,
    serviceCount,
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

  return <DashboardClient stats={stats} />;
}
