import { getBaseUrl } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  /**
   * BCP-47 locale code (e.g. 'en', 'zh', 'fr'). Accepted for call-site
   * compatibility but intentionally NOT emitted into the JSON-LD.
   *
   * History: a prior commit added `inLanguage` here, copying the
   * FAQSchema/HowToSchema/ArticleSchema pattern. That was a mistake —
   * `inLanguage` is a property of `CreativeWork`, but `BreadcrumbList`
   * is an `ItemList`/`Intangible`, so `inLanguage` is NOT a recognized
   * property on it. Google silently ignores it (it derives breadcrumb
   * language from the page's lang/hreflang, never from this field), while
   * strict validators (Semrush, schema.org) flag it as a markup error.
   * Removed 2026-06-26 site-audit pass to clear "structured data contains
   * markup errors" across all breadcrumb-bearing pages. The prop is kept
   * in the interface so the 37 existing call sites still typecheck.
   */
  locale?: string;
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps): React.ReactElement | null {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
