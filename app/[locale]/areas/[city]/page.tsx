import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedArea } from '@/lib/data/areas';
import AreaPage from '@/components/pages/AreaPage';
import { BreadcrumbSchema, LocalBusinessAreaSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { getLocalizedService } from '@/lib/data/services';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb, getFaqsByAreaFromDb, getProjectsByAreaFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string; city: string }>;
}

export const revalidate = 21600; // 6h

export async function generateStaticParams() {
  const areas = await getServiceAreasFromDb();
  const params: { locale: string; city: string }[] = [];

  for (const locale of locales) {
    for (const area of areas) {
      params.push({ locale, city: area.slug });
    }
  }

  return params;
}

/**
 * EN-only CTR overrides for area landing pages, driven by GSC query data
 * (2026-04-27 batch: 10 queries with real impressions but zero clicks).
 *
 * Strategy:
 *  - Lead title with the exact-match query phrase ("home renovations [city]"),
 *    not a generic "Renovation Company" rephrase.
 *  - First 80 chars of description carry the keyword + a concrete value
 *    (project count, insurance, warranty) and end with a soft CTA.
 *
 * These code overrides win over DB-stored meta_title/meta_description so the
 * fix can ship without DB writes.
 */
const enAreaOverrides: Record<string, { title: string; description: string }> = {
  // Q1 (105 imp pos 31.5) "home renovations coquitlam" + Q9 "home renovation contractor coquitlam"
  coquitlam: {
    title: 'Home Renovations Coquitlam | Free Quote 2026 | Reno Stars',
    description:
      'Home renovations in Coquitlam — kitchens, bathrooms & whole-house remodels. 700+ projects, $5M insured, 3-yr warranty. Burke Mountain to Westwood. Free quote.',
  },
  // Q2 (94 imp pos 40.5) "home renovations burnaby"
  burnaby: {
    title: 'Home Renovations Burnaby | 700+ Projects | Reno Stars',
    description:
      'Home renovations in Burnaby BC — kitchens, bathrooms & basements for SFH, townhouses & Metrotown condos. $5M insured, strata-compliant, 3-yr warranty. Free quote.',
  },
  // Q6 (74 imp pos 27.5) "home renovations maple ridge"
  'maple-ridge': {
    title: 'Home Renovations Maple Ridge | $5M Insured | Reno Stars',
    description:
      'Home renovations in Maple Ridge — kitchens, bathrooms & basements. Albion, Cottonwood, Hammond. 20+ yrs, $5M insured, 3-yr warranty. Free in-home quote.',
  },
  // Q8 (60 imp pos 57.4) "home renovation contractor port coquitlam"
  'port-coquitlam': {
    title: 'Home Renovation Contractor Port Coquitlam | Reno Stars',
    description:
      'Home renovation contractor in Port Coquitlam. Kitchens, bathrooms & basements — Citadel Heights, Lincoln Park, Riverwood. 20+ yrs, $5M insured. Free quote.',
  },
};

/**
 * EN intro paragraphs replacing the generic DB description for cities where
 * the keyword + neighborhood specificity moves the needle. Renders as the
 * lead paragraph below the H1 in <AreaPage>.
 */
const enAreaIntros: Record<string, string> = {
  coquitlam:
    'Home renovations in Coquitlam, BC — full-service remodels for homes from Burke Mountain and Westwood Plateau down to Maillardville and Austin Heights. With 20+ years and 700+ completed projects, we handle kitchens, bathrooms, basements and whole-house renovations end-to-end with $5M CGL coverage and a 3-year workmanship warranty.',
  burnaby:
    'Home renovations in Burnaby — kitchens, bathrooms, basements and whole-house remodels for single-family homes in The Heights and Capitol Hill, condos and townhouses around Metrotown and Brentwood, and properties throughout Burnaby Mountain and South Burnaby. Strata-compliant work, $5M CGL insurance and a 3-year warranty on every project.',
  'maple-ridge':
    'Home renovations in Maple Ridge — kitchens, bathrooms, basements and whole-house remodels for properties in Albion, Cottonwood, Hammond, Haney and West Maple Ridge. We work with both newer suburban builds and older split-level and rancher homes across the community, with permits handled end-to-end and a 3-year workmanship warranty.',
  'port-coquitlam':
    'Home renovations and contractor services in Port Coquitlam — kitchens, bathrooms, basements and whole-house remodels for homes in Citadel Heights, Lincoln Park, Oxford Heights, Birchland Manor and Riverwood. Permits handled end-to-end, $5M CGL insurance and a 3-year warranty on every project.',
};

export function getAreaIntroOverride(slug: string, locale: Locale): string | undefined {
  if (locale !== 'en') return undefined;
  return enAreaIntros[slug];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, city } = await params;
  const areas = await getServiceAreasFromDb();
  const area = areas.find((a) => a.slug === city);

  if (!area) {
    return { title: 'Area Not Found', robots: { index: false, follow: false } };
  }

  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const t = await getTranslations({ locale, namespace: 'metadata.area' });

  // EN code overrides win over DB meta for the cities we're actively tuning.
  const enOverride = locale === 'en' ? enAreaOverrides[city] : undefined;
  const title = enOverride?.title
    || localizedArea.metaTitle
    || t('title', { area: localizedArea.name });
  const description = enOverride?.description
    || localizedArea.metaDescription
    || localizedArea.description
    || t('description', { area: localizedArea.name });

  return {
    title,
    description,
    alternates: buildAlternates(`/areas/${city}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/areas/${city}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: siteImages.hero, width: 1200, height: 630, alt: localizedArea.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: siteImages.hero, alt: localizedArea.name }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, city } = await params;
  setRequestLocale(locale);

  // Resolve area first so we can fire all dependent queries in a single Promise.all.
  const areas = await getServiceAreasFromDb();
  const area = areas.find((a) => a.slug === city);

  if (!area) {
    notFound();
  }

  // Note: getProjectsByAreaFromDb matches projects.locationCity against the area's English name.
  // This coupling works because project locationCity values use city names (e.g. "Burnaby").
  const [company, services, googleReviews, areaFaqs, areaProjects] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getGoogleReviews(),
    getFaqsByAreaFromDb(area.id),
    getProjectsByAreaFromDb(area.name.en),
  ]);

  const localizedArea = getLocalizedArea(area, locale as Locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('areas'), url: `/${locale}/areas/` },
    { name: localizedArea.name, url: `/${locale}/areas/${city}/` },
  ];

  const localizedServices = services.map((s) => getLocalizedService(s, locale as Locale));
  const serviceNames = localizedServices.map((s) => s.title);

  // Build localized FAQ data for structured data
  const localizedFaqs = areaFaqs.map((faq) => ({
    question: pickLocale(faq.question, locale as Locale),
    answer: pickLocale(faq.answer, locale as Locale),
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <LocalBusinessAreaSchema
        company={company}
        areaName={localizedArea.name}
        areaSlug={city}
        locale={locale}
        services={serviceNames}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      {localizedFaqs.length > 0 && <FAQSchema faqs={localizedFaqs} />}
      <AreaPage
        locale={locale as Locale}
        area={area}
        allAreas={areas}
        company={company}
        services={localizedServices}
        faqs={areaFaqs}
        areaProjects={areaProjects}
        introOverride={getAreaIntroOverride(city, locale as Locale)}
      />
    </>
  );
}
