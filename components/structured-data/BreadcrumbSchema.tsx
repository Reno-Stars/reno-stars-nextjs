import { getBaseUrl } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps): React.ReactElement | null {
  const baseUrl = getBaseUrl();

  // A single-item BreadcrumbList (just "Home") gives Google nothing to render
  // and wastes a structured-data slot — emit nothing in that case. The
  // homepage in particular hits this branch since it only has one breadcrumb.
  if (items.length < 2) return null;

  const schema = {
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
