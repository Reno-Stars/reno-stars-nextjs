import type { Metadata } from "next";
import { getLocale } from 'next-intl/server';
import "./globals.css";
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale = 'en';
  try {
    locale = await getLocale();
  } catch {
    // Locale context unavailable (e.g. outside [locale] segment)
  }

  return (
    <html lang={locale}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
