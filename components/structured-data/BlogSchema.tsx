import JsonLd from './JsonLd';

interface BlogSchemaProps {
  name: string;
  description: string;
  url?: string;
  /** BCP-47 locale code (e.g. 'en', 'zh'). When provided, emits
   *  Schema.org `inLanguage` on the Blog node so Google can locale-target
   *  the blog listing rich result in localized SERPs. */
  locale?: string;
}

export default function BlogSchema({
  name,
  description,
  url,
  locale,
}: BlogSchemaProps): React.ReactElement {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    description,
    ...(url && { url }),
  };

  if (locale) {
    schema.inLanguage = locale;
  }

  return <JsonLd data={schema} />;
}
