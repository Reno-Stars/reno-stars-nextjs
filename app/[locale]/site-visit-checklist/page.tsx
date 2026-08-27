import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getBaseUrl } from '@/lib/utils';
import { TEXT, TEXT_MID, SURFACE_ALT } from '@/lib/theme';
import SiteVisitChecklist from '@/components/site-visit/SiteVisitChecklist';
import ClientMessages from '@/components/ClientMessages';
import catalogJson from '@/data/site-visit/catalog.json';
import type { SiteVisitCatalog } from '@/lib/site-visit/types';

/**
 * Internal site-visit checklist for Reno Stars staff.
 *
 * Deliberately noindex and absent from the sitemap: it is an operations tool,
 * not marketing content. It stays on the public site rather than behind /admin
 * so a worker can open it on a phone at a client's door with no login. It is
 * also NOT added to robots.ts disallow — a disallow would stop Google reading
 * the noindex below, which is the opposite of what we want.
 */

// Two-step cast: TS widens the imported JSON into a union of per-section
// literal shapes (each section's clientProvides keys differ), which doesn't
// structurally overlap the index signature. The sync script is what actually
// validates this file, so the cast is safe.
const catalog = catalogJson as unknown as SiteVisitCatalog;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'siteVisit.meta' });

  return {
    title: t('title'),
    description: t('description'),
    // Canonical only, no hreflang: hreflang must never point at non-indexable
    // URLs, and every locale of this page is noindex.
    alternates: { canonical: `${getBaseUrl()}/${locale}/site-visit-checklist/` },
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'siteVisit' });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_MID, opacity: 0.7 }}>
          {t('hero.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: TEXT }}>
          {t('hero.title')}
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: TEXT_MID }}>
          {t('hero.subtitle')}
        </p>
        <p
          className="mt-4 rounded-xl p-3 text-sm print:hidden"
          style={{ background: SURFACE_ALT, color: TEXT_MID }}
        >
          {t('hero.note')}
        </p>
      </header>

      <div className="mt-8">
        <ClientMessages ns={['siteVisit']}>
          <SiteVisitChecklist catalog={catalog} />
        </ClientMessages>
      </div>
    </main>
  );
}
