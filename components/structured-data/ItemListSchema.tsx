import { getBaseUrl } from '@/lib/utils';

interface ItemListItem {
  name: string;
  url: string;
  image?: string;
}

interface ItemListSchemaProps {
  items: ItemListItem[];
  name?: string;
  description?: string;
  /**
   * BCP-47 locale. Accepted for call-site compatibility but intentionally NOT
   * emitted: `inLanguage` is a `CreativeWork` property, and `ItemList` is an
   * `Intangible`, so emitting it here produces an unrecognized-property markup
   * error in strict validators (Semrush/schema.org). Removed 2026-06-26 audit;
   * see BreadcrumbSchema for the same fix.
   */
  locale?: string;
}

export default function ItemListSchema({
  items,
  name,
  description,
}: ItemListSchemaProps): React.ReactElement | null {
  if (items.length === 0) return null;
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name && { name }),
    ...(description && { description }),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      name: item.name,
      ...(item.image && { image: item.image }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
