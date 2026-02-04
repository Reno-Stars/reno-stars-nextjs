import { cache } from 'react';
import { eq, asc } from 'drizzle-orm';
import { db } from './index';
import {
  companyInfo,
  socialLinks as socialLinksTable,
  services as servicesTable,
  testimonials as testimonialsTable,
  aboutSections as aboutSectionsTable,
} from './schema';
import { getAssetUrl } from '../storage';
import type { Company, SocialLink, Service, Testimonial, AboutSections, ServiceType } from '../types';

/**
 * Fetch company info from DB and map to the `Company` type.
 * `yearsExperience` is computed from `foundingYear` so it stays current.
 */
export const getCompanyFromDb = cache(async (): Promise<Company> => {
  const rows = await db.select().from(companyInfo).limit(1);
  const row = rows[0];
  if (!row) throw new Error('Company info not found in database');

  const foundingYear = row.foundingYear ?? 1997;
  const yearsExperience = String(new Date().getFullYear() - foundingYear);

  return {
    name: row.name,
    tagline: row.tagline ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    logo: getAssetUrl(row.logoUrl ?? ''),
    quoteUrl: row.quoteUrl ?? '/contact/',
    yearsExperience,
    foundingYear,
    teamSize: row.teamSize ?? 0,
    warranty: row.warranty ?? '',
    liabilityCoverage: row.liabilityCoverage ?? '',
    rating: row.rating ?? '',
    reviewCount: row.reviewCount ?? 0,
    ratingSource: row.ratingSource ?? '',
    geo: {
      latitude: row.geoLatitude ? Number(row.geoLatitude) : 0,
      longitude: row.geoLongitude ? Number(row.geoLongitude) : 0,
    },
  };
});

/**
 * Fetch active social links ordered by display_order.
 */
export const getSocialLinksFromDb = cache(async (): Promise<SocialLink[]> => {
  const rows = await db
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.isActive, true))
    .orderBy(asc(socialLinksTable.displayOrder));

  return rows.map((row: typeof socialLinksTable.$inferSelect) => ({
    platform: row.platform as SocialLink['platform'],
    url: row.url,
    label: row.label ?? row.platform,
  }));
});

/**
 * Fetch services from DB, mapped to the `Service` type with bilingual content.
 */
export const getServicesFromDb = cache(async (): Promise<Service[]> => {
  const rows = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.displayOrder));

  return rows.map((row: typeof servicesTable.$inferSelect) => ({
    slug: row.slug as ServiceType,
    title: { en: row.titleEn, zh: row.titleZh },
    description: { en: row.descriptionEn, zh: row.descriptionZh },
    long_description:
      row.longDescriptionEn && row.longDescriptionZh
        ? { en: row.longDescriptionEn, zh: row.longDescriptionZh }
        : undefined,
    icon: row.iconName ?? undefined,
    image: row.imageUrl ? getAssetUrl(row.imageUrl) : undefined,
  }));
});

/**
 * Fetch featured testimonials from DB, mapped to `Testimonial[]`.
 */
export const getTestimonialsFromDb = cache(async (): Promise<Testimonial[]> => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.isFeatured, true));

  return rows.map((row: typeof testimonialsTable.$inferSelect) => ({
    id: row.id,
    name: row.name,
    text: { en: row.textEn, zh: row.textZh },
    rating: row.rating,
    location: row.location ?? '',
  }));
});

/**
 * Fetch about sections from DB, mapped to `AboutSections`.
 * The `{yearsExperience}` placeholder in ourJourney is replaced with the
 * computed value from company's founding year.
 */
export const getAboutSectionsFromDb = cache(async (): Promise<AboutSections> => {
  const rows = await db.select().from(aboutSectionsTable).limit(1);
  const row = rows[0];
  if (!row) throw new Error('About sections not found in database');

  // Compute years for placeholder replacement
  const companyRows = await db.select().from(companyInfo).limit(1);
  const foundingYear = companyRows[0]?.foundingYear ?? 1997;
  const yearsExperience = String(new Date().getFullYear() - foundingYear);

  const replaceYears = (text: string | null) =>
    (text ?? '').replace(/\{yearsExperience\}/g, yearsExperience);

  return {
    ourJourney: {
      en: replaceYears(row.ourJourneyEn),
      zh: replaceYears(row.ourJourneyZh),
    },
    whatWeOffer: {
      en: row.whatWeOfferEn ?? '',
      zh: row.whatWeOfferZh ?? '',
    },
    ourValues: {
      en: row.ourValuesEn ?? '',
      zh: row.ourValuesZh ?? '',
    },
    whyChooseUs: {
      en: row.whyChooseUsEn ?? '',
      zh: row.whyChooseUsZh ?? '',
    },
    letsBuildTogether: {
      en: row.letsBuildTogetherEn ?? '',
      zh: row.letsBuildTogetherZh ?? '',
    },
  };
});
