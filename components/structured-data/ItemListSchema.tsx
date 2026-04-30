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
