import Link from 'next/link';
import { headers } from 'next/headers';
import { NAVY, GOLD, SURFACE, TEXT_MID } from '@/lib/theme';

/**
 * Detects the preferred locale from request headers.
 * Falls back to 'en' if Chinese is not preferred.
 */
async function getPreferredLocale(): Promise<'en' | 'zh'> {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    if (
      acceptLanguage.includes('zh') ||
      acceptLanguage.includes('cn') ||
      acceptLanguage.startsWith('zh')
    ) {
      return 'zh';
    }
  } catch {
    // Headers may not be available in all contexts
  }

  return 'en';
}

/**
 * Root-level 404 page. Does NOT render <html>/<body> — the root layout
 * provides those. This page is rendered both for unlocalized routes and
 * as a fallback within the [locale] segment.
 */
export default async function NotFound() {
  const locale = await getPreferredLocale();
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: SURFACE }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: NAVY }}>404</h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: NAVY }}>
          {isZh ? '页面未找到' : 'Page Not Found'}
        </h2>
        <p className="mb-8" style={{ color: TEXT_MID }}>
          {isZh
            ? '您访问的页面不存在或已被移动。'
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD }}
          >
            {isZh ? '返回首页' : 'Back to Home'}
          </Link>
          <Link
            href={isZh ? '/en' : '/zh'}
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            {isZh ? 'English' : '中文'}
          </Link>
        </div>
      </div>
    </div>
  );
}
