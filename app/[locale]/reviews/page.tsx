import { Metadata } from "next";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ogLocaleMap, type Locale } from "@/i18n/config";
import ReviewsPage from "@/components/pages/ReviewsPage";
import type { HubCityGroupDisplay } from "@/components/pages/ReviewsCityGroups";
import { BreadcrumbSchema, FAQSchema } from "@/components/structured-data";
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getHubProjectReviews, getTestimonialsForHub, getServiceAreasFromDb } from "@/lib/db/queries";
import { getGoogleReviews, projectReviewsToLocale } from "@/lib/google-reviews";
import { buildReviewsHub, type ReviewsHub } from "@/lib/reviews-hub";
import type { ServiceArea } from "@/lib/types";

/**
 * Localize the merged hub city groups for the current locale:
 * - city display name + area-page slug come from the service_areas row whose
 *   English name matches the group's city,
 * - testimonial bodies swap to their stored translation when one exists
 *   (project-review bodies stay VERBATIM — never machine-translated).
 */
function localizeCityGroups(hub: ReviewsHub, areas: ServiceArea[], locale: Locale): HubCityGroupDisplay[] {
  const areaByEnName = new Map(areas.map((a) => [a.name.en.toLowerCase(), a]));
  return hub.cityGroups.map((group) => {
    const area = group.city ? areaByEnName.get(group.city.toLowerCase()) : undefined;
    return {
      cityName: area ? pickLocale(area.name, locale) : (group.city ?? ""),
      areaSlug: area?.slug ?? null,
      reviews: group.reviews.map((review) => {
        const translated = review.kind === "testimonial" ? review.translations?.[locale] : undefined;
        return {
          authorName: review.authorName,
          rating: review.rating,
          body: translated ?? review.body,
          bodyLang: translated ? locale : review.bodyLang,
          reviewDate: review.reviewDate,
          sourceUrl: review.sourceUrl,
          projectSlug: review.projectSlug,
          kind: review.kind === "testimonial" ? ("testimonial" as const) : ("project" as const),
        };
      }),
    };
  });
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

  const [nav, t, company, googleReviews, hubProjectReviews, hubTestimonials, areas] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "reviewsPage" }),
    getCompanyFromDb(),
    getGoogleReviews(),
    getHubProjectReviews(),
    getTestimonialsForHub(),
    getServiceAreasFromDb(),
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
  const cityGroups = localizeCityGroups(hub, areas, locale as Locale);

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
        cityGroups={cityGroups}
      />
    </>
  );
}

