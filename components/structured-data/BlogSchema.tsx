import JsonLd from './JsonLd';

interface BlogSchemaProps {
  name: string;
  description: string;
  url?: string;
}

export default function BlogSchema({
  name,
  description,
  url,
}: BlogSchemaProps): React.ReactElement {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    description,
    ...(url && { url }),
  };

  return <JsonLd data={schema} />;
}
