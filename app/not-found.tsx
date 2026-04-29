import type { Metadata } from 'next';
import Link from 'next/link';
import { NAVY, GOLD, SURFACE, TEXT_MID } from '@/lib/theme';
import { SITE_NAME } from '@/lib/utils';

export const revalidate = 604800; // 7d — Vercel quota optimization

export const metadata: Metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
};

/**
 * Returns the default locale. Previously used headers() for accept-language
 * detection, but that forced the entire app into dynamic rendering mode
 * (no ISR caching). Default to 'en' — the proxy handles locale routing.
 */
function getPreferredLocale(): 'en' | 'zh' {
  return 'en';
}

/**
 * Root-level 404 page. Does NOT render <html>/<body> — the root layout
 * provides those. This page is rendered both for unlocalized routes and
 * as a fallback within the [locale] segment.
 */
export default async function NotFound() {
  const locale = getPreferredLocale();
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
