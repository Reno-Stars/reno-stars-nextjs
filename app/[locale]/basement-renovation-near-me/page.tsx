import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb, getProjectsListFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { selectNearbyProjects } from '@/lib/near-me-projects';

interface PageProps { params: Promise<{ locale: string }>; }

// Single source for this page's price band (finding #9/#24). Used by the meta
// description, the ServiceSchema serviceDescription, and the ServiceSchema
// priceRange prop so the three can never drift. The trailing "+" is a display
// convention (open-ended top), not a number. Do NOT re-type the band inline.
const PRICE_RANGE = { min: 30000, max: 120000 } as const;
const PRICE_BAND = `$${PRICE_RANGE.min / 1000}K-$${PRICE_RANGE.max / 1000}K+`;

// This page canonicalizes onto /services/basement/ (see generateMetadata) — it
// is NOT self-canonical. Single source for that path so the declared canonical
// and the share URL derived from it cannot drift apart.
const CANONICAL_PATH = '/services/basement/';

// Module-level so generateMetadata's OG title/image and the share-card title/image
// are the same strings, not two copies that can drift.
function getPageMeta(locale: string): { title: string; description: string; ogImage: string } {
  const isZh = locale === 'zh';
  const title = isZh ? '附近地下室装修 | 大温哥华 | Reno Stars' : 'Basement Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 171 chars (truncates ~155).
  // Drops the "3-yr warranty" + "Free quote" tail to fit.
  const description = isZh
    ? `大温哥华附近专业地下室装修：suite改造、家庭影院、活动室。${PRICE_BAND}，8-16周。许可证代办，防水保障。免费估价。`
    : `Basement renovation near you in Metro Vancouver. Legal suites, family rooms, home theatres. ${PRICE_BAND}, 8-16 wks. Permits handled, $5M insured.`;
  return { title, description, ogImage: buildOgImageUrl(title, description) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { title, description, ogImage } = getPageMeta(locale);
  const baseUrl = getBaseUrl();
  return {
    title, description,
    // SEO de-dup consolidation (near-me cluster): consolidate this near-me
    // duplicate onto the stronger /services/basement/ page via rel=canonical
    // while still serving "basement renovation near me" searchers. hreflang is
    // intentionally omitted on a canonicalized-away page. Umbrella
    // /renovation-near-me/ stays self-canonical. See kitchen page for rationale.
    alternates: { canonical: buildAlternates(CANONICAL_PATH, locale).canonical },
    openGraph: { title, description, url: `${baseUrl}/${locale}/basement-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [nav, t, areas, company, googleReviews, allProjects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'nearMe' }),
    getServiceAreasFromDb(),
    getCompanyFromDb(),
    getGoogleReviews(),
    getProjectsListFromDb(),
  ]);
  // No dedicated basement projects exist yet — selectNearbyProjects returns
  // real recent work with exact:false so the page honestly frames it as
  // related ("we can take on your basement"), never as basement projects.
  const nearby = selectNearbyProjects(allProjects, 'basement', locale as Locale);
  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: locale === 'zh' ? '附近地下室装修' : 'Basement Renovation Near Me', url: `/${locale}/basement-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '地下室装修' : 'Basement Renovation';
  const serviceDescription = isZh
    ? `大温哥华附近专业地下室装修：legal suite改造、家庭影院、活动室、防水。${PRICE_BAND}，8-16周。`
    : `Basement renovation across Metro Vancouver — legal suites, family rooms, home theatres, waterproofing. ${PRICE_BAND}, 8-16 wks. Permits handled.`;
  const { title, ogImage } = getPageMeta(locale);
  // Share URL is DERIVED from the canonical this page declares (the same
  // CANONICAL_PATH generateMetadata passes to buildAlternates) rather than
  // rebuilt, so the two cannot drift apart. Note that canonical is the
  // consolidated /services/basement/ target, not this near-me URL — sharing must
  // point at the page we tell search engines is the real one.
  const shareUrl = buildAlternates(CANONICAL_PATH, locale).canonical;
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/basement-renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={PRICE_RANGE}
        serviceRadiusKm={50}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        h1Override={isZh ? '附近地下室翻新 — Metro Vancouver' : 'Basement Renovation Near Me in Metro Vancouver'}
        googleRating={googleReviews.rating}
        reviewCount={googleReviews.userRatingCount}
        variant="basement"
        nearbyProjects={nearby.projects}
        nearbyExact={nearby.exact}
        share={{ url: shareUrl, title, imageUrl: ogImage }}
        shareItemId="basement-renovation-near-me"
      />
    </>
  );
}
