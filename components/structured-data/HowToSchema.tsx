import { getBaseUrl, SITE_NAME } from '@/lib/utils';

interface HowToStep {
  name: string;
  text: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
}

export default function HowToSchema({ name, description, steps }: HowToSchemaProps) {
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
    totalTime: 'P60D',
    tool: [
      { '@type': 'HowToTool', name: 'Floor plans' },
      { '@type': 'HowToTool', name: 'Budget estimate' },
    ],
    isPartOf: {
      '@type': 'WebSite',
      url: baseUrl,
      name: SITE_NAME,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
