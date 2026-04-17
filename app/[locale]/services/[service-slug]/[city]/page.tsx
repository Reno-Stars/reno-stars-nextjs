import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb, getProjectsByAreaFromDb, getFaqsByAreaFromDb } from '@/lib/db/queries';
import ServiceLocationPage from '@/components/pages/ServiceLocationPage';
import { BreadcrumbSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string; city: string }>;
}

export const revalidate = 21600; // 6h

export async function generateStaticParams() {
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const params: { locale: string; 'service-slug': string; city: string }[] = [];

  for (const locale of locales) {
    for (const service of services) {
      if (service.showOnServicesPage === false) continue;
      for (const area of areas) {
        params.push({ locale, 'service-slug': service.slug, city: area.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.serviceLocation' }),
    getCompanyFromDb(),
  ]);
  const tagline = localizedService.tags?.slice(0, 2).join(' & ') ?? '';
  const tParams = { service: localizedService.title, area: localizedArea.name, years: company.yearsExperience, tagline };
  // Use tagline variant only if it fits within ~60 chars (Google truncation limit)
  const titleWithTagline = tagline ? t('titleWithTagline', tParams) : '';
  let title = titleWithTagline && titleWithTagline.length <= 60
    ? titleWithTagline
    : t('title', tParams);
  let description = t('description', tParams);

  // High-priority keyword overrides driven by the local rank tracker (2026-04-08).
  // For specific city+service combos that are underperforming OR that hold the
  // most search volume, hand-tune the title/meta to put the exact keyword in
  // the title and boost CTR. EN only — Chinese keywords are different.
  const overrideKey = `${serviceSlug}/${city}`;
  const enOverrides: Record<string, { title: string; description: string }> = {
    // Highest-volume term, currently rank ~15 (page 2) with +5 weekly trend.
    'whole-house/vancouver': {
      title: 'Home Renovations Vancouver: Real Projects & Costs (2026)',
      description: 'Home renovations in Vancouver BC with real project pricing from $50K to $200K+. 18+ years experience, $5M CGL insurance, 3-year workmanship warranty. See completed Vancouver projects + get a free quote.',
    },
    // Currently NOT RANKING in Local Finder for "Coquitlam Home renovation company".
    'whole-house/coquitlam': {
      title: 'Coquitlam Home Renovation Company | Reno Stars',
      description: 'Reno Stars is a Coquitlam home renovation company serving Burke Mountain, Maillardville, Westwood Plateau, Eagle Ridge, Austin Heights and Ranch Park. Whole-house renovations, permit-ready work, $5M CGL, 3-year warranty. Free quote.',
    },
    // Currently NOT RANKING in Local Finder for "Coquitlam kitchen renovation company".
    'kitchen/coquitlam': {
      title: 'Coquitlam Kitchen Renovation Company | Reno Stars',
      description: 'Coquitlam kitchen renovation company — custom cabinets, quartz countertops, layout reconfiguration, full project management. Serving Burke Mountain to Maillardville with 18+ years experience and a 3-year workmanship warranty.',
    },
    // 315 imp pos 24.4 — top queries: "reno white rock" (114 imp) + "bathroom renovations white rock" (68 imp).
    'bathroom/white-rock': {
      title: 'White Rock Bathroom Renovations | Free Quotes | Reno Stars',
      description: 'Bathroom renovations in White Rock BC. Walk-in showers, soaker tubs, custom tile and full remodels. Serving White Rock and South Surrey. $5M CGL, 3-year warranty. Free quote today.',
    },
    // 118 imp pos 31.3 — top queries: "reno port coquitlam" (53 imp pos 22.8), "reno coquitlam" (42 imp pos 48.2).
    'whole-house/port-coquitlam': {
      title: 'Home Renovations Port Coquitlam | Free Quotes | Reno Stars',
      description: 'Port Coquitlam renovations — kitchens, bathrooms and basements. Serving PoCo, Birchland, Lincoln and Riverwood. 18+ years experience, $5M CGL, 3-year warranty. Free quote today.',
    },
    // 68 imp pos 35.6 — top queries: "luxury home painters caulfeild" (17 imp pos 7.4), "home renovation west vancouver" (7 imp pos 34.9).
    'whole-house/west-vancouver': {
      title: 'Home Renovations West Vancouver | Luxury Renos | Reno Stars',
      description: 'West Vancouver renovations — kitchens, bathrooms and whole-house remodels. Serving Caulfeild, Dundarave, Ambleside and British Properties. $5M CGL, 3-year warranty. Free quote.',
    },
    // Cabinet resurfacing — high-volume cluster (127+82+66 imp)
    'cabinet/port-coquitlam': {
      title: 'Cabinet Refacing Port Coquitlam | $4K–$15K | Reno Stars',
      description: 'Cabinet refacing in Port Coquitlam — painting, door replacement & full cabinet swap. Real costs $4K–$15K. Transform your kitchen in 1–2 weeks. Free quote.',
    },
    'cabinet/maple-ridge': {
      title: 'Cabinet Refacing Maple Ridge | $4K–$15K | Reno Stars',
      description: 'Cabinet refacing in Maple Ridge — painting, refacing & replacement from $4K–$15K. 1–2 week timeline. Albion, Thornhill, Haney. Free quote.',
    },
    'cabinet/delta': {
      title: 'Cabinet Refacing Delta BC | $4K–$15K | Reno Stars',
      description: 'Cabinet refacing in Delta — Ladner, Tsawwassen & North Delta. Painting, door refacing & full replacement from $4K. Free in-home quote.',
    },
    // Kitchen — high-volume cities
    'kitchen/west-vancouver': {
      title: 'Kitchen Renovation West Vancouver | Luxury Kitchens | Reno Stars',
      description: 'West Vancouver kitchen renovation — custom cabinets, quartz islands, premium appliances. Caulfeild, Dundarave, Ambleside. $30K–$90K+. Free quote.',
    },
    'kitchen/north-vancouver': {
      title: 'Kitchen Renovation North Vancouver | $25K–$80K | Reno Stars',
      description: 'North Vancouver kitchen renovation — Lynn Valley, Lonsdale, Deep Cove. Custom cabinets, quartz countertops, full layout redesign. Free quote.',
    },
    // Basement — near-page-1 opportunities
    'basement/surrey': {
      title: 'Basement Renovation Surrey | Legal Suites | Reno Stars',
      description: 'Surrey basement renovation & legal suite conversion. $35K–$130K+. Permits handled, fire separation, separate entrance. Fleetwood, Newton, Cloverdale.',
    },
    'basement/north-vancouver': {
      title: 'Basement Renovation North Vancouver | Waterproofing | Reno Stars',
      description: 'North Vancouver basement renovation with waterproofing guarantee. $35K–$80K. Lynn Valley, Lonsdale, Deep Cove. Permits handled. Free quote.',
    },
    // Commercial — near-page-1
    'commercial/west-vancouver': {
      title: 'Commercial Renovation West Vancouver | Reno Stars',
      description: 'West Vancouver commercial renovation — restaurants, clinics, retail. Permit-aware, off-hours scheduling. $150–$500/sqft. Free consultation.',
    },
    'commercial/delta': {
      title: 'Commercial Renovation Delta BC | Reno Stars',
      description: 'Delta commercial renovation — restaurants, offices, retail in Ladner, Tsawwassen & North Delta. Permits handled, minimal disruption. Free quote.',
    },
    'commercial/maple-ridge': {
      title: 'Commercial Renovation Maple Ridge | Reno Stars',
      description: 'Maple Ridge commercial renovation — restaurants, clinics, stores. Off-hours scheduling, permit management. Free consultation.',
    },
    // Bathroom — high impressions
    'bathroom/burnaby': {
      title: 'Bathroom Renovation Burnaby | $15K–$45K | Reno Stars',
      description: 'Burnaby bathroom renovation — tiled showers, tub conversions, custom vanities. Metrotown to Heights. $15K–$45K, 3–6 weeks. Free quote.',
    },
    'bathroom/maple-ridge': {
      title: 'Bathroom Renovation Maple Ridge | $15K–$35K | Reno Stars',
      description: 'Maple Ridge bathroom renovation with custom Glass Door, tiled walls & quartz vanity. Real project: $18K–$21K. Free in-home quote.',
    },
  };
  if (locale === 'en' && enOverrides[overrideKey]) {
    title = enOverrides[overrideKey].title;
    description = enOverrides[overrideKey].description;
  }
  const ogImage = service.image || siteImages.hero;

  return {
    title,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/${city}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/${city}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  setRequestLocale(locale);

  const [company, services, areas] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
  ]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    notFound();
  }

  const [areaProjects, areaFaqs, t, faqT] = await Promise.all([
    getProjectsByAreaFromDb(area.name.en),
    getFaqsByAreaFromDb(area.id),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const loc = locale as Locale;

  // Area-specific FAQs from database (localized)
  const dbFaqs = areaFaqs.map((faq) => ({
    id: faq.id,
    question: faq.question[loc],
    answer: faq.answer[loc],
  }));

  // Service-type FAQs from i18n (with {area} placeholder replaced by actual city name)
  const faqParams = { area: localizedArea.name };
  const serviceFaqs = [
    { id: `${serviceSlug}-1`, question: faqT(`${serviceSlug}.q1`, faqParams), answer: faqT(`${serviceSlug}.a1`, faqParams) },
    { id: `${serviceSlug}-2`, question: faqT(`${serviceSlug}.q2`, faqParams), answer: faqT(`${serviceSlug}.a2`, faqParams) },
    { id: `${serviceSlug}-3`, question: faqT(`${serviceSlug}.q3`, faqParams), answer: faqT(`${serviceSlug}.a3`, faqParams) },
  ];

  // Combine: area-specific first, then service-level
  const faqs = [...dbFaqs, ...serviceFaqs];

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
    { name: localizedArea.name, url: `/${locale}/services/${serviceSlug}/${city}/` },
  ];

  const tAreas = await getTranslations({ locale, namespace: 'areas' });
  const serviceTitle = tAreas('serviceInArea', { service: localizedService.title, area: localizedArea.name });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ServiceSchema
        company={company}
        serviceName={serviceTitle}
        serviceDescription={localizedService.long_description || localizedService.description}
        location={localizedArea.name}
        url={`/${locale}/services/${serviceSlug}/${city}/`}
      />
      <FAQSchema faqs={faqs} />
      <ServiceLocationPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        citySlug={city}
        company={company}
        service={service}
        area={area}
        services={services}
        areas={areas}
        faqs={faqs}
        areaProjects={areaProjects}
      />
    </>
  );
}
