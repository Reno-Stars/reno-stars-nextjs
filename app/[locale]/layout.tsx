import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { LocalBusinessSchema } from '@/components/structured-data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

// Revalidate layout data every hour (ISR)
export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, company, socialLinks, services, areas] = await Promise.all([
    getMessages(),
    getCompanyFromDb(),
    getSocialLinksFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
  ]);

  return (
    <NextIntlClientProvider messages={messages}>
      <LocalBusinessSchema company={company} socialLinks={socialLinks} areas={areas} />
      <Navbar company={company} areas={areas} />
      <main id="main-content">
        {children}
      </main>
      <Footer company={company} socialLinks={socialLinks} services={services} areas={areas} />
    </NextIntlClientProvider>
  );
}
