import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
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


// Build-time prerender: EN only. Non-EN locales lazy-generate via
// dynamicParams=true and cache for 7d.
export async function generateStaticParams() {
  const areas = await getServiceAreasFromDb();
  return areas.map((area) => ({ locale: 'en', city: area.slug }));
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
  // 2026-05-01 GSC retitle: 1,393 imp pos 50 with 0% CTR. Hub framing
  // ("Renovation Contractor") to disambiguate from /services/{svc}/coquitlam
  // combo pages — same fix that worked for burnaby/delta/langley.
  coquitlam: {
    title: 'Coquitlam Renovation Contractor | Burke Mountain & Westwood | Reno Stars',
    description:
      'Coquitlam renovation contractor — Burke Mountain, Westwood Plateau, Maillardville, Austin Heights. Kitchens, bathrooms, basements + whole-house. $5M insured, 3-yr warranty.',
  },
  // Q2 (94 imp pos 40.5) "home renovations burnaby" — positioned as the
  // CONTRACTOR HUB to disambiguate from /services/{kitchen,bathroom,whole-house}/burnaby
  burnaby: {
    title: 'Burnaby Renovation Contractor | 700+ Projects | Reno Stars',
    description:
      'Burnaby renovation contractor serving Metrotown, Heights & Capitol Hill. Kitchens, bathrooms, basements + whole-house. Strata-compliant, $5M insured, 3-yr warranty.',
  },
  // 2026-05-01 GSC retitle: 1,658 imp pos 32 with 0% CTR. Hub framing.
  'maple-ridge': {
    title: 'Maple Ridge Renovation Contractor | Albion & Cottonwood | Reno Stars',
    description:
      'Maple Ridge renovation contractor — Albion, Cottonwood, Hammond, Haney, West Maple Ridge. Kitchens, bathrooms, basements + whole-house. $5M insured, 3-yr warranty.',
  },
  // Q8 (60 imp pos 57.4) "home renovation contractor port coquitlam"
  'port-coquitlam': {
    title: 'Port Coquitlam Renovation Contractor (2026) | Reno Stars',
    description:
      'Port Coquitlam home renovation contractor. Kitchens, bathrooms & basements — Citadel Heights, Lincoln Park, Riverwood. 20+ yrs, $5M insured. Free quote in 24h.',
  },
  // 2026-04-30 CTR pass: 10 cities previously falling back to translation namespace.
  // Lead with city-name + service in title (Google bolds matching keywords),
  // close with year + click trigger.
  vancouver: {
    title: 'Home Renovations Vancouver (2026) | Real Costs | Reno Stars',
    description:
      'Vancouver home renovations from $50K to $200K+. Kitchens, bathrooms & whole-house. 18+ yrs, $5M CGL, 3-yr warranty. See real Vancouver projects + free quote.',
  },
  richmond: {
    title: 'Home Renovations Richmond BC (2026) | Free Quote | Reno Stars',
    description:
      'Richmond home renovation specialists — kitchens, bathrooms & whole-house remodels. Steveston to Brighouse. 20+ yrs, $5M insured, 3-yr warranty. Real-cost quote.',
  },
  surrey: {
    title: 'Home Renovations Surrey (2026) | Real Projects | Reno Stars',
    description:
      'Surrey home renovations — kitchens, bathrooms & legal-suite basements. Fleetwood, Newton, Cloverdale. $5M insured, 3-yr warranty. Free quote, fast turnaround.',
  },
  'north-vancouver': {
    title: 'North Vancouver Renovations (2026) | $5M Insured | Reno Stars',
    description:
      'North Vancouver home renovations — kitchens, bathrooms & whole-house. Lynn Valley, Lonsdale, Deep Cove. Mountain-view design expertise. 3-yr warranty, free quote.',
  },
  'west-vancouver': {
    title: 'West Vancouver Renovations (2026) | Luxury Projects | Reno Stars',
    description:
      'West Vancouver luxury renovations — Caulfeild, Dundarave, Ambleside. High-end kitchens, bathrooms & whole-house remodels. $5M insured, 3-yr warranty. Free quote.',
  },
  'new-westminster': {
    title: 'New Westminster Renovations (2026) | Quay Condos | Reno Stars',
    description:
      'New Westminster home renovations — Quay condos, Sapperton townhouses & character homes. Strata-compliant, $5M insured, 3-yr warranty. Free quote.',
  },
  delta: {
    title: 'Delta Renovation Contractor | Ladner & Tsawwassen | Reno Stars',
    description:
      'Delta renovation contractor — Ladner, Tsawwassen, North Delta. Kitchens, bathrooms, basements + whole-house. Coastal builds, $5M insured, 3-yr warranty. Free quote.',
  },
  langley: {
    title: 'Langley Renovation Contractor | Walnut Grove & Willoughby | Reno Stars',
    description:
      'Langley renovation contractor — Walnut Grove, Willoughby, Fort Langley, Aldergrove. Kitchens, bathrooms, whole-house. New & old homes. $5M insured, 3-yr warranty.',
  },
  'port-moody': {
    title: 'Port Moody Renovations (2026) | Heritage Mountain | Reno Stars',
    description:
      'Port Moody home renovations — Heritage Mountain, Ioco, Newport. Kitchens, bathrooms & whole-house. 20+ yrs, $5M insured, 3-yr warranty. Free quote in 24h.',
  },
  // 2026-05-07 GSC retitle: "reno white rock" 228 imp pos 1.35 with 0% CTR.
  // AI Overview eating the click — leading with 76 five-star reviews + concrete
  // services so the snippet has a concrete hook beyond what the AI can summarize.
  'white-rock': {
    title: 'White Rock Renovations | 76 Five-Star Reviews | Reno Stars',
    description:
      'White Rock home renovations — kitchens, bathrooms & whole-house. 20+ yrs, 76 five-star Google reviews, $5M insured, 3-yr warranty. Free quote in 24h.',
  },
};

/**
 * EN intro paragraphs replacing the generic DB description for cities where
 * the keyword + neighborhood specificity moves the needle. Renders as the
 * lead paragraph below the H1 in <AreaPage>.
 */
const enAreaIntros: Record<string, string> = {
  coquitlam:
    'Reno Stars is a full-service renovation contractor in Coquitlam, BC — serving homes from Burke Mountain and Westwood Plateau down through Maillardville, Austin Heights, Eagle Ridge and Ranch Park. With 20+ years and 700+ completed projects, we handle kitchens, bathrooms, basements and whole-house renovations end-to-end with $5M CGL coverage and a 3-year workmanship warranty. Use the service tiles below for Coquitlam-specific kitchen, bathroom and whole-house pricing.',
  burnaby:
    'Reno Stars is a full-service home renovation contractor in Burnaby, BC. From The Heights and Capitol Hill to Metrotown, Brentwood and South Burnaby, we handle kitchens, bathrooms, basements and whole-house remodels — strata-compliant for condos and townhouses, permit-ready for SFH. Use the service tiles below to see Burnaby-specific pricing for kitchens, bathrooms or whole-house projects, or browse 700+ completed Lower Mainland renovations.',
  'maple-ridge':
    'Reno Stars is a renovation contractor in Maple Ridge — serving Albion, Cottonwood, Hammond, Haney and West Maple Ridge. We work with both newer suburban builds and older split-level and rancher homes across the community, handling kitchens, bathrooms, basements and whole-house remodels with permits managed end-to-end and a 3-year workmanship warranty. Use the service tiles below for Maple-Ridge-specific kitchen, bathroom and whole-house pricing.',
  'port-coquitlam':
    'Home renovations and contractor services in Port Coquitlam — kitchens, bathrooms, basements and whole-house remodels for homes in Citadel Heights, Lincoln Park, Oxford Heights, Birchland Manor and Riverwood. Permits handled end-to-end, $5M CGL insurance and a 3-year warranty on every project.',
  delta:
    'Reno Stars is your local renovation contractor in Delta, BC — serving Ladner, Tsawwassen and North Delta. Coastal-aware builds for shoreline homes, ferry-corridor logistics for materials, and strata-compliant work for Tsawwassen Springs and Ladner Trunk Road condos. Use the service tiles below for Delta-specific kitchen, bathroom and whole-house pricing.',
  langley:
    'Reno Stars handles home renovations across Langley — Walnut Grove, Willoughby Heights, Brookswood, Aldergrove and Fort Langley. We work with both new-build townhouses needing first-renovation tune-ups and older Township farmhouses needing structural updates. Click a service tile below for Langley-specific kitchen, bathroom or whole-house pricing, permit timelines, and real project examples.',
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
        googleReviews={googleReviews}
      />
    </>
  );
}
