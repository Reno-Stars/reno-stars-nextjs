import { getBaseUrl } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  /**
   * BCP-47 locale code (e.g. 'en', 'zh', 'fr'). When passed, emits the
   * Schema.org `inLanguage` property at the BreadcrumbList level. Per
   * Schema.org BreadcrumbList spec, `inLanguage` declares the natural
   * language of the breadcrumb item names so Google can show the
   * locale-matched breadcrumb in localized SERPs (e.g. show the zh
   * "首页 › 服务 › 厨房装修" breadcrumb in zh-CN SERPs, not the EN one).
   *
   * Mirrors the FAQSchema/HowToSchema/ArticleSchema inLanguage pattern
   * shipped in PR #102 + daily-2026-06-02 commit 0e9f674.
   *
   * Optional for backwards compatibility — callers that don't pass it
   * still emit valid (locale-agnostic) BreadcrumbList JSON-LD. All 37
   * in-tree callers updated to pass locale in this same commit.
   */
  locale?: string;
}

export default function BreadcrumbSchema({ items, locale }: BreadcrumbSchemaProps): React.ReactElement | null {
  const baseUrl = getBaseUrl();

  // A single-item BreadcrumbList (just "Home") gives Google nothing to render
  // and wastes a structured-data slot — emit nothing in that case. The
  // homepage in particular hits this branch since it only has one breadcrumb.
  if (items.length < 2) return null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  if (locale) schema.inLanguage = locale;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
