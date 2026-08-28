import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import AwardsPage from '@/components/pages/AwardsPage';
import { BreadcrumbSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { AWARDS, HAS_AWARDS } from '@/lib/awards';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.awards' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/awards/', locale),
    // An archive with nothing in it is a thin page, and a thin page in the
    // index costs crawl budget and dilutes the site's quality signal. So while
    // AWARDS is empty the route is reachable and crawlable but noindex; the
    // moment a real entry lands, `HAS_AWARDS` flips and this — plus the sitemap
    // entry and the footer link — turns itself on. `follow` stays true either
    // way so the outbound links to /reviews/ and /projects/ still carry.
    ...(HAS_AWARDS ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/awards/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: ogImage, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, company, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'awards' }),
    getCompanyFromDb(),
    getGoogleReviews(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: t('breadcrumb'), url: `/${locale}/awards/` },
  ];

  // ItemListSchema returns null for an empty list, so this emits nothing at all
  // while the archive is empty — no `numberOfItems: 0` claiming an award list
  // that does not exist.
  const awardItems = AWARDS.map((award) => ({
    name: `${award.title} — ${award.issuer} (${award.year})`,
    url: award.url ?? `/${locale}/awards/#${award.id}`,
  }));

  /* Server Component page — see the note in /transparent-pricing/page.tsx for
     why there is no <ClientMessages> wrapper. */
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema items={awardItems} name={t('list.title')} />
      <AwardsPage
        locale={locale as Locale}
        awards={AWARDS}
        yearsExperience={company.yearsExperience}
        projectsCompleted={company.projectsCompleted}
        liabilityCoverage={company.liabilityCoverage}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
    </>
  );
}
