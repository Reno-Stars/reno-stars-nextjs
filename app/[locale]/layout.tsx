import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { LocalBusinessSchema } from '@/components/structured-data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb } from '@/lib/db/queries';
import { getServiceAreas } from '@/lib/data';

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

  const [messages, company, socialLinks, services] = await Promise.all([
    getMessages(),
    getCompanyFromDb(),
    getSocialLinksFromDb(),
    getServicesFromDb(),
  ]);

  const areas = getServiceAreas();

  return (
    <html lang={locale}>
      <head>
        <LocalBusinessSchema company={company} socialLinks={socialLinks} />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navbar company={company} areas={areas} />
          {children}
          <Footer company={company} socialLinks={socialLinks} services={services} areas={areas} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
