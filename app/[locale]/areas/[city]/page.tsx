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
// dynamicParams=true and cache for 7d. Admin edits call
// `revalidatePath('/<locale>/areas/<city>')` to bust on edits.
export const revalidate = 604800; // 7d

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
  // 2026-05-09 retune: page sat at pos 53.8 / 849 imp for 7d. Lead description
  // with verified Burnaby project budgets ($30-40K kitchens, $20-32K bathrooms
  // — DB-checked across 6 bathroom + 3 kitchen Burnaby completions) instead
  // of generic copy.
  burnaby: {
    title: 'Burnaby Renovation Contractor | 700+ Projects, 5★ | Reno Stars',
    description:
      'Burnaby renovation contractor — 700+ projects. Kitchens $30K–$40K, bathrooms $20K–$32K (real budgets). Metrotown, Heights, Capitol Hill. $5M insured, 5★ rated.',
  },
  // 2026-05-01 GSC retitle: 1,658 imp pos 32 with 0% CTR. Hub framing.
  // 2026-05-15: also picking up "general contractor maple ridge" (29 imp
  // pos 42.4). Add "General Contractor" to the title so that long-tail
  // shares the same SERP entry — the page already covers GC scope.
  'maple-ridge': {
    title: 'Maple Ridge General Contractor & Home Renovations | Reno Stars',
    description:
      'Maple Ridge general contractor + home renovations — Albion, Cottonwood, Hammond, Haney, West Maple Ridge. Kitchens, bathrooms, basements + whole-house. $5M insured, 3-yr warranty.',
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
  // 2026-05-10 GSC retune: page sat at pos 23.4 / 106 imp for 7d.
  // Top non-brand query is "bathroom renovation richmond" (23 imp pos 43.7).
  // Lead description with verified Richmond bathroom + kitchen budgets
  // (DB-checked: 5 Richmond bathrooms $15K–$35K, 3 Richmond kitchens
  // $20K–$32K) and surface "bathroom" in the title's lead position
  // alongside "Home Renovations" so the page can pick up the bathroom
  // long-tail without losing the home-renovations head term.
  richmond: {
    title: 'Richmond Home & Bathroom Renovations (2026) | 11 Local Projects | Reno Stars',
    description:
      'Richmond renovation contractor — bathrooms $15K–$35K, kitchens $20K–$32K (11 real Richmond projects). Steveston, Brighouse, Terra Nova. $5M insured, 3-yr warranty. Free quote.',
  },
  // 2026-05-15 GSC retune: page sat at pos 23.3 / 99 imp for 7d. Top
  // non-brand query is "reno surrey" (42 imp pos 7.1) — already near top,
  // brand-adjacent. Tightening the description with DB-verified Surrey
  // budgets (1 bathroom $28K–$32K, 2 kitchens $25K–$38K, 1 whole-house
  // $29K–$31K) so the snippet competes harder for the longer-tail
  // "house renovation surrey" / "basement renovations surrey" queries that
  // sit at pos 26–30.
  surrey: {
    title: 'Home Renovations Surrey (2026) | 4 Real Projects | Reno Stars',
    description:
      'Surrey renovation contractor — kitchens $25K–$38K (2 projects), bathrooms $28K–$32K, whole-house $29K–$31K (4 verified Surrey projects). Fleetwood, Newton, Cloverdale. $5M insured.',
  },
  // 2026-05-15 GSC retune: page sat at pos 24.4 / 65 imp for 7d. Top intent
  // is unambiguously BASEMENT: "basement renovation services north vancouver"
  // (9 imp pos 7), "basement renovation north vancouver" (12 imp pos 15.3),
  // "basement renovations north vancouver" (9 imp pos 13.3), "basement
  // renovation companies north vancouver" (7 imp pos 28.1). Lead the title
  // with basement to consolidate the cluster's signal. DB has 1 verified
  // North Vancouver bathroom completion at $42K–$45K.
  'north-vancouver': {
    title: 'North Vancouver Basement & Home Renovations | $5M Insured | Reno Stars',
    description:
      'North Vancouver basement renovations + bathrooms (verified $42K–$45K) and whole-house. Lynn Valley, Lonsdale, Deep Cove. Mountain-view design, $5M insured, 3-yr warranty.',
  },
  // 2026-05-15 GSC retune: page sat at pos 24.8 / 176 imp for 7d. Top
  // non-brand query is "bathroom renovation west vancouver" (89 imp pos 22.7)
  // — surface "Home & Bathroom Renovations" in the title to capture that
  // long-tail. DB has one West Vancouver bathroom completion at $57K–$60K
  // and one kitchen at $29K–$33K (verified before publish; no fabrication).
  'west-vancouver': {
    title: 'West Vancouver Home & Bathroom Renovations | Luxury Builds | Reno Stars',
    description:
      'West Vancouver renovation contractor — bathrooms (verified $57K–$60K), kitchens ($29K–$33K) and whole-house. Caulfeild, Dundarave, Ambleside. $5M insured, 3-yr warranty.',
  },
  'new-westminster': {
    title: 'New Westminster Renovations (2026) | Quay Condos | Reno Stars',
    description:
      'New Westminster home renovations — Quay condos, Sapperton townhouses & character homes. Strata-compliant, $5M insured, 3-yr warranty. Free quote.',
  },
  // 2026-05-15 GSC retune: page sat at pos 19.9 / 276 imp for 7d.
  // Top intent queries are bathroom + basement: "bathroom renovation delta"
  // (6 imp pos 9.8), "basement finishing delta bc" (2 imp pos 8), "commercial
  // renovation contractor tsawwassen" (5 imp pos 12.8). All sub-page-1; the
  // page is positioned to crack top 10 with sharper bathroom-first framing.
  delta: {
    title: 'Delta Renovation Contractor | Bathrooms, Basements & Whole-House | Reno Stars',
    description:
      'Delta renovation contractor — bathrooms (DB-verified $40K–$43K), basement finishing, kitchens + whole-house. Ladner, Tsawwassen, North Delta. Coastal builds, $5M insured, 3-yr warranty.',
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
  // 2026-05-15 GSC retune: page sat at pos 19.0 / 394 imp for 7d.
  // Top non-brand query is "home renovations white rock" (86 imp pos 17.3) —
  // retitle to lead with that exact phrase so the head term is in the first
  // slot Google bolds. Retains 5★ trust signal but moves it past the keyword.
  'white-rock': {
    title: 'Home Renovations White Rock | 5★ Top-Rated Contractor | Reno Stars',
    description:
      'White Rock home renovations — kitchens, bathrooms & whole-house. South Surrey, East Beach, Hillside. 5★ Google rated, $5M insured, 3-yr workmanship warranty. Free quote in 24h.',
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
  // 2026-05-15: refresh adds bathroom-first emphasis ("bathroom renovation
  // delta" sits at pos 9.8) plus the DB-verified $40K–$43K Delta bathroom
  // budget. Keeps prior coastal/ferry framing.
  delta:
    'Reno Stars is your local renovation contractor in Delta, BC — serving Ladner, Tsawwassen and North Delta. Delta bathroom renovations have completed in the $40,000–$43,000 range (1 verified Delta bathroom in our portfolio); basements and whole-house work coordinate the same crew across Ladner Trunk Road condos, Tsawwassen Springs SFH and shoreline builds. Coastal-aware framing, ferry-corridor logistics for materials, strata-compliant where it applies, $5M CGL coverage and a 3-year workmanship warranty.',
  langley:
    'Reno Stars handles home renovations across Langley — Walnut Grove, Willoughby Heights, Brookswood, Aldergrove and Fort Langley. We work with both new-build townhouses needing first-renovation tune-ups and older Township farmhouses needing structural updates. Click a service tile below for Langley-specific kitchen, bathroom or whole-house pricing, permit timelines, and real project examples.',
  richmond:
    'Reno Stars is a renovation contractor in Richmond, BC — serving Steveston, Brighouse, Terra Nova, Seafair, Hamilton and across the rest of Lulu Island. With 11 completed Richmond projects on the books, Richmond bathroom renovations typically run $15,000–$35,000 (5 real bathrooms in our portfolio), Richmond kitchen renovations $20,000–$32,000 (3 real kitchens), and full condo renovations from around $26,000. We handle strata-compliant condo work, single-family homes and townhouses with permits managed end-to-end, $5M CGL coverage and a 3-year workmanship warranty.',
  // 2026-05-15 intros for white-rock, delta refresh, west-vancouver, surrey,
  // north-vancouver. Each leads with the top GSC query for its page so the
  // first paragraph below the H1 reinforces the title's keyword.
  'white-rock':
    'Reno Stars handles home renovations across White Rock and South Surrey — South Slope, East Beach, Hillside and the uphill character homes off Marine Drive. Kitchens, bathrooms, basements and whole-house remodels with permits managed end-to-end, $5M CGL coverage and a 3-year workmanship warranty. We coordinate strata-compliant condo work along Marine Drive and oceanfront SFH renovations with the same crew that handles the rest of the Lower Mainland — 700+ completed projects across Metro Vancouver.',
  'west-vancouver':
    'Reno Stars is a renovation contractor in West Vancouver — Ambleside, Dundarave, Caulfeild, Cypress Park and up into the British Properties. The West Vancouver bathroom renovation we completed most recently ran $57,000–$60,000 (1 verified West Vancouver bathroom in our portfolio), and the kitchen we completed alongside ran $29,000–$33,000. Most West Vancouver projects involve view-corridor framing, ocean-air-resistant fixture selection and strata coordination for the Marine Drive condo bands. $5M CGL coverage, 3-year workmanship warranty.',
  surrey:
    'Reno Stars handles home renovations across Surrey — Fleetwood, Newton, Cloverdale, South Surrey and Guildford. We have 4 completed Surrey projects on the books: 1 bathroom in the $28,000–$32,000 range, 2 kitchens spanning $25,000–$38,000, and 1 whole-house at $29,000–$31,000. Strata-compliant condo work, legal-suite basement conversions, and SFH renovations with permits handled end-to-end, $5M CGL coverage and a 3-year workmanship warranty.',
  'north-vancouver':
    'Reno Stars is a renovation contractor in North Vancouver — Lynn Valley, Lonsdale, Deep Cove, Edgemont and Capilano. Basement renovations are the most-asked-about service for this area; we coordinate suite conversions, layout reconfigurations and waterproofing alongside kitchens and bathrooms (DB-verified: 1 North Vancouver bathroom at $42,000–$45,000). Mountain-view design awareness, $5M CGL coverage, 3-year workmanship warranty.',
};

export function getAreaIntroOverride(slug: string, locale: Locale): string | undefined {
  if (locale !== 'en') return undefined;
  return enAreaIntros[slug];
}

/**
 * EN-only H1 overrides for low-rank area pages. The default H1 is the
 * generic "Home Renovations in {city}" — for cities stuck on page 4+ in
 * GSC (Burnaby pos 53.8 / 849 imp at the time of this writing) we want
 * the H1 to match the meta title's "{city} Renovation Contractor" framing
 * so the on-page heading aligns with what users searched for and what
 * Google sees in the title tag. Same overrides as enAreaOverrides — keep
 * them in lock-step.
 */
const enAreaH1Overrides: Record<string, string> = {
  burnaby: 'Burnaby Renovation Contractor — 700+ Projects Across Metro Vancouver',
  coquitlam: 'Coquitlam Renovation Contractor — Burke Mountain & Westwood',
  'maple-ridge': 'Maple Ridge Renovation Contractor — Albion, Cottonwood & Hammond',
  'port-coquitlam': 'Port Coquitlam Renovation Contractor — Citadel Heights & Riverwood',
  // 2026-05-10: align H1 with the retuned title that leads with bathroom +
  // home renovations. Keeps the city name first so Google bolds it in SERP.
  richmond: 'Richmond Renovation Contractor — Bathrooms, Kitchens & Whole-House Across Lulu Island',
  // 2026-05-15 batch: lead each H1 with the city + the page's leverage
  // service (basement for North Van, bathroom for West Van, etc.) so the
  // on-page heading aligns with what users searched for.
  'white-rock': 'White Rock Renovation Contractor — Home, Kitchen & Bathroom Renovations',
  delta: 'Delta Renovation Contractor — Bathrooms, Basements & Whole-House Across Ladner & Tsawwassen',
  'west-vancouver': 'West Vancouver Home & Bathroom Renovations — Caulfeild, Dundarave & Ambleside',
  surrey: 'Surrey Renovation Contractor — Kitchens, Bathrooms & Basement Suites',
  'north-vancouver': 'North Vancouver Basement & Home Renovation Contractor — Lynn Valley to Deep Cove',
};

export function getAreaH1Override(slug: string, locale: Locale): string | undefined {
  if (locale !== 'en') return undefined;
  return enAreaH1Overrides[slug];
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
        h1Override={getAreaH1Override(city, locale as Locale)}
        googleReviews={googleReviews}
      />
    </>
  );
}
