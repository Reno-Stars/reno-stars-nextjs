import { getBlogPostsFromDb } from '@/lib/db/queries';
import { getBaseUrl, SITE_NAME } from '@/lib/utils';
import { locales } from '@/i18n/config';

export const revalidate = 604800; // 7d — Vercel quota optimization

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const baseUrl = getBaseUrl();
  const posts = await getBlogPostsFromDb();

  const title =
    locale === 'zh'
      ? `${SITE_NAME} 温哥华装修博客`
      : `${SITE_NAME} Vancouver Renovation Blog`;
  const description =
    locale === 'zh'
      ? '温哥华装修技巧、灵感与行业资讯'
      : 'Vancouver renovation tips, inspiration & industry insights';

  const items = posts
    .map((post) => {
      const postTitle =
        locale === 'zh' && post.title.zh ? post.title.zh : post.title.en;
      const postDescription =
        locale === 'zh' && post.excerpt?.zh
          ? post.excerpt.zh
          : post.excerpt?.en || '';
      const postLink = `${baseUrl}/${locale}/blog/${post.slug}/`;
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : '';

      return `    <item>
      <title>${escapeXml(postTitle)}</title>
      <link>${postLink}</link>
      <guid isPermaLink="true">${postLink}</guid>
      <description>${escapeXml(postDescription)}</description>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${baseUrl}/${locale}/blog/</link>
    <description>${escapeXml(description)}</description>
    <language>${locale === 'zh' ? 'zh-CN' : 'en'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/${locale}/feed.xml/" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
