import { Metadata } from "next";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ogLocaleMap, type Locale } from "@/i18n/config";
import ReviewsPage from "@/components/pages/ReviewsPage";
import type { HubCityGroupDisplay, HubDisplayReview } from "@/components/pages/ReviewsCityGroups";
import type { HubTypeGroupDisplay } from "@/components/pages/ReviewsTypeGroups";
import { BreadcrumbSchema, FAQSchema } from "@/components/structured-data";
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getHubProjectReviews, getTestimonialsForHub, getServiceAreasFromDb, getServicesFromDb } from "@/lib/db/queries";
import { getGoogleReviews, projectReviewsToLocale } from "@/lib/google-reviews";
import { buildReviewsHub, type HubReview, type ReviewsHub } from "@/lib/reviews-hub";
import type { Service, ServiceArea } from "@/lib/types";

/**
 * Resolve one hub review for the current locale: testimonial bodies swap to
 * their stored translation when one exists (project-review bodies stay
 * VERBATIM — never machine-translated).
 */
function toDisplayReview(review: HubReview, locale: Locale): HubDisplayReview {
  const translated = review.kind === "testimonial" ? review.translations?.[locale] : undefined;
  return {
    authorName: review.authorName,
    rating: review.rating,
    body: translated ?? review.body,
    bodyLang: translated ? locale : review.bodyLang,
    reviewDate: review.reviewDate,
    sourceUrl: review.sourceUrl,
    source: review.source ?? null,
    projectSlug: review.projectSlug,
    kind: review.kind === "testimonial" ? ("testimonial" as const) : ("project" as const),
  };
}

/**
 * Localize the hub into ONE shared review pool plus city + type groups that
 * reference the pool by index. A review that appears in both a city group and a
 * type group (every linked project review does) is therefore serialized into
 * the RSC payload ONCE, not twice (efficiency #27). The pool is keyed by
 * HubReview object identity — hub.cityGroups and hub.typeGroups both hold
 * references to the same merged HubReview objects, so a shared review collapses
 * to one pool entry.
 */
function buildLocalizedHub(
  hub: ReviewsHub,
  areas: ServiceArea[],
  services: Service[],
  locale: Locale,
): { reviews: HubDisplayReview[]; cityGroups: HubCityGroupDisplay[]; typeGroups: HubTypeGroupDisplay[] } {
  const pool: HubDisplayReview[] = [];
  const indexByReview = new Map<HubReview, number>();
  const ref = (review: HubReview): number => {
    let idx = indexByReview.get(review);
    if (idx === undefined) {
      idx = pool.length;
      pool.push(toDisplayReview(review, locale));
      indexByReview.set(review, idx);
    }
    return idx;
  };

  const areaByEnName = new Map(areas.map((a) => [a.name.en.toLowerCase(), a]));
  const cityGroups: HubCityGroupDisplay[] = hub.cityGroups.map((group) => {
    const area = group.city ? areaByEnName.get(group.city.toLowerCase()) : undefined;
    return {
      cityName: area ? pickLocale(area.name, locale) : (group.city ?? ""),
      areaSlug: area?.slug ?? null,
      reviewIndices: group.reviews.map(ref),
    };
  });

  const serviceBySlug = new Map(services.map((s) => [s.slug, s]));
  const typeGroups: HubTypeGroupDisplay[] = hub.typeGroups.map((group) => {
    const service = serviceBySlug.get(group.serviceType);
    return {
      typeName: service ? pickLocale(service.title, locale) : group.serviceType,
      serviceSlug: service && service.showOnServicesPage !== false ? service.slug : null,
      reviewIndices: group.reviews.map(ref),
    };
  });

  return { reviews: pool, cityGroups, typeGroups };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.reviews" });
  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t("title"), t("description"));

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/reviews/", locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${locale}/reviews/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("title") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [{ url: ogImage, alt: t("title") }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, company, googleReviews, hubProjectReviews, hubTestimonials, areas, services] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "reviewsPage" }),
    getCompanyFromDb(),
    getGoogleReviews(),
    getHubProjectReviews(),
    getTestimonialsForHub(),
    getServiceAreasFromDb(),
    getServicesFromDb(),
  ]);

  // Merge + dedupe the three review sources (same author + similar text = one
  // review, preferring the project_reviews copy — it links to a case study).
  const hub = buildReviewsHub({
    projectReviews: hubProjectReviews,
    googleReviews: googleReviews.reviews,
    testimonials: hubTestimonials,
  });
  const dedupedGoogle = {
    ...googleReviews,
    reviews: hub.googleIndices.map((i) => googleReviews.reviews[i]),
  };
  const { reviews: hubReviews, cityGroups, typeGroups } = buildLocalizedHub(
    hub,
    areas,
    services,
    locale as Locale,
  );

  const breadcrumbs = [
    { name: nav("home"), url: `/${locale}/` },
    { name: nav("reviews"), url: `/${locale}/reviews/` },
  ];

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ReviewsPage
        locale={locale as Locale}
        company={company}
        googleReviews={projectReviewsToLocale(dedupedGoogle, locale)}
        hubReviews={hubReviews}
        cityGroups={cityGroups}
        typeGroups={typeGroups}
      />
    </>
  );
}

