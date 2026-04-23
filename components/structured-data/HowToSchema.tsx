interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g. "P8W" for 8 weeks
  estimatedCost?: {
    currency: string;
    minValue: number;
    maxValue: number;
  };
  steps: HowToStep[];
  image?: string;
}

export default function HowToSchema({
  name,
  description,
  totalTime,
  estimatedCost,
  steps,
  image,
}: HowToSchemaProps): React.ReactElement | null {
  if (steps.length === 0) return null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => {
      const stepObj: Record<string, unknown> = {
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
      };
      if (step.url) stepObj.url = step.url;
      if (step.image) stepObj.image = step.image;
      return stepObj;
    }),
  };

  if (totalTime) schema.totalTime = totalTime;
  if (image) schema.image = image;

  if (estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmountDistribution',
      currency: estimatedCost.currency,
      minValue: estimatedCost.minValue,
      maxValue: estimatedCost.maxValue,
      name: 'Estimated project cost',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
