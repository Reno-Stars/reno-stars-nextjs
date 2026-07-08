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
  /**
   * BCP-47 locale code (e.g. 'en', 'zh', 'fr'). When passed, emits the
   * Schema.org `inLanguage` property at both the HowTo top level and on
   * each HowToStep. Per Schema.org HowTo spec, `inLanguage` is the
   * recommended way to declare the natural language of multilingual
   * how-to content so Google can pick the right localized rich-result
   * variant in localized SERPs. Mirrors the FAQSchema per-Question +
   * per-Answer inLanguage pattern shipped in PR #102 (e3cc590) +
   * caller backfill d56760d.
   *
   * Optional for backwards compatibility — callers that don't pass it
   * still emit valid (locale-agnostic) HowTo JSON-LD. All 8 in-tree
   * callers updated to pass locale in this same commit.
   */
  locale?: string;
}

export default function HowToSchema({
  name,
  description,
  totalTime,
  estimatedCost,
  steps,
  image,
  locale,
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
      if (locale) stepObj.inLanguage = locale;
      return stepObj;
    }),
  };

  if (locale) schema.inLanguage = locale;
  if (totalTime) schema.totalTime = totalTime;
  if (image) schema.image = image;

  // NOTE: no `speakable` here — SpeakableSpecification is only valid on
  // Article/WebPage (schema.org). Emitting it on HowTo produced a Semrush
  // "structured data markup error" on all 17 HowTo pages (2026-07-08 audit).
  if (estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: estimatedCost.currency,
      minValue: estimatedCost.minValue,
      maxValue: estimatedCost.maxValue,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
