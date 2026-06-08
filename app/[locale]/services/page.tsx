import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ServicesPage from '@/components/pages/ServicesPage';
import AnswerBlockSection from '@/components/home/AnswerBlockSection';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getLocalizedService } from '@/lib/data/services';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.services' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/services/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/services/`,
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

  const [company, services, areas] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
  ]);

  const [t, sectionT] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'section' }),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
  ];

  const visibleServices = services.filter((s) => s.showOnServicesPage !== false);

  // AnswerBlockSection adds an explicit Q+A surface ("What does Reno Stars do?"
  // + citable services list) at the top of the page — same pattern PR #63
  // landed on /. Per the 2026-05-27 on-page scanner finding onpg-99ead134676b,
  // the services index page was missed in that rollout. Same translation keys
  // as homepage (messages/<locale>/section.json). Only renders when all four
  // keys resolve for the locale — keys exist for `en` + `zh` today; other
  // locales fall through gracefully (no broken-string SSR until proper
  // translations are backfilled).
  //
  // 2026-05-27T19:30Z fix-forward from PR #69 §7 monitoring: next-intl's
  // `getTranslations()` does NOT throw on MISSING_MESSAGE — it logs a
  // warning and returns the namespaced key as a string (e.g.
  // `"section.whatDoesRenoStarsDo"`). My earlier try/catch caught nothing.
  // Detection is now string-equality against the namespaced key. Verified
  // live regression on /ja/services/ + /ko/services/ post-PR #69 deploy
  // before this fix landed.
  function answerBlockTranslations(): {
    question: string;
    answer: string;
    servicesTitle: string;
    viewServiceLabel: string;
  } | null {
    const lookup = (key: string): string | null => {
      const value = sectionT(key);
      // Missing translation falls back to namespaced key in next-intl's
      // default config. Treat that as absent so we don't render literal
      // "section.whatDoesRenoStarsDo" as an h2 in production HTML.
      if (value === `section.${key}`) return null;
      return value;
    };
    const question = lookup('whatDoesRenoStarsDo');
    const answer = lookup('renoStarsAnswerTemplate');
    const servicesTitle = lookup('servicesWeCover');
    const viewServiceLabel = lookup('viewServiceLink');
    if (!question || !answer || !servicesTitle || !viewServiceLabel) return null;
    return { question, answer, servicesTitle, viewServiceLabel };
  }

  const answerBlockT = answerBlockTranslations();
  const answerBlockServices = visibleServices.map((s) => {
    const localized = getLocalizedService(s, locale as Locale);
    return { slug: s.slug, title: localized.title };
  });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {answerBlockT && (
        <AnswerBlockSection
          foundingYear={company.foundingYear}
          services={answerBlockServices}
          translations={answerBlockT}
        />
      )}
      <ServicesPage locale={locale as Locale} company={company} services={visibleServices} areas={areas} />
    </>
  );
}
