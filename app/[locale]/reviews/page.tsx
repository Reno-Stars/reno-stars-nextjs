import { Metadata } from "next";
import { PRERENDERED_LOCALES } from '@/i18n/config';
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, ogLocaleMap, type Locale } from "@/i18n/config";
import ReviewsPage from "@/components/pages/ReviewsPage";
import { BreadcrumbSchema, FAQSchema } from "@/components/structured-data";
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb } from "@/lib/db/queries";
import { getGoogleReviews } from "@/lib/google-reviews";

interface PageProps {
  params: Promise<{ locale: string }>;
}


export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
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

  const [nav, t, company, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "reviewsPage" }),
    getCompanyFromDb(),
    getGoogleReviews(),
  ]);

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
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ReviewsPage locale={locale as Locale} company={company} googleReviews={googleReviews} />
    </>
  );
}

