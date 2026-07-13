import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription } from '@/lib/utils';
import { getVideoWatchEntriesFromDb } from '@/lib/db/queries';
import { BreadcrumbSchema, VideoObjectSchema } from '@/components/structured-data';
import { NAVY, GOLD, SURFACE, TEXT_MID } from '@/lib/theme';

// Dedicated video WATCH pages — one per project walkthrough video. Google
// only indexes a video when it is the prominent main content of its page
// ("watch page"); embedded walkthroughs on project case-study pages fail
// that bar (GSC 2026-07-07: 86 video-bearing pages, 0 indexed, all "Video
// isn't on a watch page"). Inventory is DB-driven via
// getVideoWatchEntriesFromDb() — publishing a new project with a hero video
// + thumbnail creates its watch page and sitemap entry automatically.
export const revalidate = 604800; // 7d no-edit floor, same as project pages

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function watchTitle(titleLocalized: string, locale: string): string {
  return locale === 'zh'
    ? `${titleLocalized}——装修实拍视频 | ${SITE_NAME}`
    : `${titleLocalized} — Renovation Video Tour | ${SITE_NAME}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const entries = await getVideoWatchEntriesFromDb();
  const entry = entries.find((e) => e.slug === slug);

  if (!entry || !entry.thumbnailUrl) {
    return { title: 'Video Not Found', robots: { index: false, follow: false } };
  }

  const baseUrl = getBaseUrl();
  const isZh = locale === 'zh';
  const title = watchTitle(isZh ? entry.titleZh : entry.titleEn, locale);
  const description = truncateMetaDescription(
    (isZh ? entry.descriptionZh : entry.descriptionEn) || (isZh ? entry.titleZh : entry.titleEn),
  );
  // Same leaf-locale policy as project pages: only EN/ZH have native copy,
  // minor locales are noindexed and excluded from hreflang + sitemap.
  const isIndexableLocale = locale === 'en' || locale === 'zh';

  return {
    title,
    description,
    ...(isIndexableLocale ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates(`/videos/${slug}/`, locale, ['en', 'zh']),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/videos/${slug}/`,
      siteName: SITE_NAME,
      type: 'video.other',
      images: [{ url: entry.thumbnailUrl, width: 1200, height: 630, alt: title }],
      videos: [{ url: entry.videoUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: entry.thumbnailUrl, alt: title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, entries] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getVideoWatchEntriesFromDb(),
  ]);
  const entry = entries.find((e) => e.slug === slug);
  if (!entry || !entry.thumbnailUrl) notFound();

  const isZh = locale === 'zh';
  const title = isZh ? entry.titleZh : entry.titleEn;
  const description = (isZh ? entry.descriptionZh : entry.descriptionEn) || '';
  const uploadDate = (entry.uploadDate ?? new Date()).toISOString();
  const watchPath = `/${locale}/videos/${slug}/`;
  const projectPath = `/${locale}/projects/${slug}/`;

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
    { name: title, url: watchPath },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <VideoObjectSchema
        name={watchTitle(title, locale)}
        description={description || title}
        thumbnailUrl={entry.thumbnailUrl!}
        contentUrl={entry.videoUrl}
        uploadDate={uploadDate}
        url={watchPath}
        locale={locale}
      />
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            {isZh ? `${title}——装修实拍视频` : `${title} — Renovation Video Tour`}
          </h1>
          <div className="rounded-2xl overflow-hidden mb-8 bg-black">
            <video
              src={entry.videoUrl}
              poster={entry.thumbnailUrl!}
              controls
              playsInline
              preload="metadata"
              aria-label={title}
              className="w-full aspect-video object-contain"
            />
          </div>
          {description && (
            <p className="text-lg leading-relaxed mb-8" style={{ color: TEXT_MID }}>
              {description}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link
              href={projectPath}
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              {isZh ? '查看完整项目案例' : 'View the full project'}
            </Link>
            <Link
              href={`/${locale}/contact/`}
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: GOLD }}
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
