import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, ogLocaleMap, type Locale } from "@/i18n/config";
import HomePage from "@/components/pages/HomePage";
import { BreadcrumbSchema, FAQSchema } from "@/components/structured-data";
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { WORKSAFE_BC_LOGO } from "@/lib/data";
import {
  getCompanyFromDb,
  getServicesFromDb,
  getProjectsListFromDb,
  getTrustBadgesFromDb,
  getFaqsFromDb,
  getBlogPostsFromDb,
  getServiceAreasFromDb,
  getPartnersFromDb,
} from "@/lib/db/queries";
import { getGoogleReviews } from "@/lib/google-reviews";

// Revalidate homepage every hour (ISR) - serves cached HTML instantly
export const revalidate = 86400; // 24h — Vercel quota optimization

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: "metadata.home" }),
    getCompanyFromDb(),
  ]);
  const years = { years: company.yearsExperience };

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t("title", years), t("description", years));

  return {
    title: t("title", years),
    description: t("description", years),
    alternates: buildAlternates("/", locale),
    openGraph: {
      title: t("title", years),
      description: t("description", years),
      url: `${baseUrl}/${locale}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: "website",
      images: [
        { url: ogImage, width: 1200, height: 630, alt: t("title", years) },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title", years),
      description: t("description", years),
      images: [{ url: ogImage, alt: t("title", years) }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  // Fetch all data in parallel
  const [
    t,
    company,
    services,
    googleReviews,
    allProjects,
    trustBadges,
    faqs,
    blogPosts,
    areas,
    partners,
  ] = await Promise.all([
    getTranslations({ locale }),
    getCompanyFromDb(),
    getServicesFromDb(),
    getGoogleReviews(),
    getProjectsListFromDb(),
    getTrustBadgesFromDb(),
    getFaqsFromDb(),
    getBlogPostsFromDb(),
    getServiceAreasFromDb(),
    getPartnersFromDb(),
  ]);

  // Pre-compute localized data server-side
  const localizedAreas = areas.map((a) => ({
    slug: a.slug,
    name: a.name[locale],
  }));

  // Homepage gallery: only featured projects with hero images, up to 12
  const galleryProjects = allProjects
    .filter((p) => p.featured && p.hero_image)
    .slice(0, 12)
    .map((p) => ({
      image: p.hero_image,
      title: pickLocale(p.title, locale),
      category: pickLocale(p.category, locale),
      href: `/projects/${p.slug}`,
    }));
  const localizedBadges = trustBadges.map((b) => pickLocale(b, locale));
  const localizedFaqs = faqs.map((f) => ({
    id: f.id,
    question: pickLocale(f.question, locale),
    answer: pickLocale(f.answer, locale),
  }));
  const localizedBlogPosts = blogPosts
    .slice(0, 5)
    .map((p) => ({ slug: p.slug, title: pickLocale(p.title, locale) }));
  const localizedShowroom = {
    address: company.address,
    phone: company.phone,
  };
  const localizedPartners = partners.map((p) => ({
    name: pickLocale(p.name, locale),
    logo: p.logo,
    url: p.url,
    isHiddenVisually: p.isHiddenVisually,
  }));
  const areasText =
    localizedAreas
      .slice(0, 8)
      .map((a) => a.name)
      .join(", ") + "…";

  const aboutItems = [
    { title: t("about.ourJourney"), text: t("aboutPage.journey.body") },
    { title: t("about.whatWeOffer"), text: t("aboutPage.offer.body") },
    { title: t("about.ourValues"), text: t("aboutPage.values.body") },
    { title: t("about.whyChooseUs"), text: t("aboutPage.whyUs.body") },
    { title: t("about.letsBuildTogether"), text: t("aboutPage.cta.body") },
  ];

  const stats = [
    { value: `${company.yearsExperience}+`, label: t("stats.yearsExperience") },
    { value: company.projectsCompleted, label: t("stats.projectsCompleted") },
    { value: company.liabilityCoverage, label: t("stats.liabilityCoverage") },
    { value: '', label: t("stats.wcbCoverage"), image: WORKSAFE_BC_LOGO },
  ];

  // All translations computed server-side
  const translations = {
    hero: {
      transformYourSpace: t("hero.transformYourSpace"),
      professionalExcellenceDesc: t("hero.professionalExcellenceDesc", {
        experience: company.yearsExperience,
        coverage: company.liabilityCoverage,
      }),
      getFreeQuote: t("cta.getFreeQuote"),
      callNow: t("cta.callNow"),
      yearsExperience: t("stats.yearsExperience"),
      liabilityCoverage: t("stats.liabilityCoverage"),
      wcbCoverage: t("stats.wcbCoverage"),
      rating: t("stats.rating"),
      realEstateTitle: t("hero.realEstateTitle"),
      realEstateDesc: t("hero.realEstateDesc"),
    },
    testimonials: {
      title: t("section.whatOurClientsSay"),
      subtitle: t("section.testimonialsSubtitle"),
    },
    gallery: {
      title: t("section.ourPortfolio"),
      subtitle: t("section.gallerySubtitle2"),
      projectsLink: t("nav.projects"),
    },
    services: {
      title: t("section.ourServices"),
      subtitle: t("section.servicesSubtitle"),
    },
    stats: { srTitle: t("stats.srStats") },
    about: {
      title: t("section.aboutUs"),
      subtitle: t("section.aboutSubtitle"),
    },
    trustBadges: { srTitle: t("stats.srTrustBadges") },
    partners: {
      title: t("homePartners.title"),
      subtitle: t("homePartners.subtitle"),
      srTitle: t("homePartners.srTitle"),
    },
    faq: { title: t("homeFaq.title"), subtitle: t("homeFaq.subtitle") },
    blog: { title: t("section.blogTips"), subtitle: t("section.blogSubtitle") },
    showroom: {
      title: t("section.visitShowroom"),
      appointmentPrefix: t("showroomPage.appointmentPrefix"),
      appointmentBold: t("showroomPage.appointmentBold"),
      bookAppointment: t("cta.bookAppointment"),
    },
    contact: {
      title: t("section.getInTouch"),
      subtitle: t("section.contactSubtitle"),
      phone: t("label.phone"),
      email: t("label.email"),
      serviceAreas: t("section.serviceAreas"),
      mapTitle: t("footer.mapLocation"),
    },
  };

  const breadcrumbs = [{ name: t("nav.home"), url: `/${locale}/` }];

  const faqSchemaItems = localizedFaqs.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqSchemaItems} />
      <HomePage
        locale={locale}
        company={company}
        services={services.filter(s => s.showOnServicesPage !== false)}
        googleReviews={googleReviews}
        gallery={galleryProjects}
        trustBadges={localizedBadges}
        partners={localizedPartners}
        faqs={localizedFaqs}
        blogPosts={localizedBlogPosts}
        showroom={localizedShowroom}
        areasText={areasText}
        aboutItems={aboutItems}
        stats={stats}
        translations={translations}
      />
    </>
  );
}
