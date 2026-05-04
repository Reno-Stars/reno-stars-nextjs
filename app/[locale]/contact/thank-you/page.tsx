import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import ThankYouPage from '@/components/pages/ThankYouPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'metadata.thankYou' });

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
    // Explicitly empty alternates: prevents Next-intl from emitting hreflang
    // Link headers / <link rel="alternate"> tags on a noindex page. A noindex
    // page that broadcasts 6 hreflang alternates sends contradictory signals
    // ("don't index me" + "here are 6 localized versions of me"). Strip them.
    alternates: {
      canonical: undefined,
      languages: {},
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ThankYouPage locale={locale as Locale} />;
}
