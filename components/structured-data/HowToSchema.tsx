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

  // Speakable spec — marks the page's primary headline as voice-readable.
  // xpath `//main//h1[1]` targets the first h1 inside the page's main
  // element. Verified across all 7 HowTo-rendered pages on prod:
  //   /en/guides/{kitchen,bathroom,basement,whole-house,commercial,
  //   cabinet-refinishing}-renovation-cost-vancouver/ all have <main><h1>
  //   /en/workflow/ has <main id="main-content"><h1>
  // The [1] predicate makes the selector deterministic even on pages
  // with multiple h1s (none of the current HowTo-rendered pages have
  // multiple h1s, but defensive against future content additions).
  //
  // Voice assistants (Google Assistant, Alexa via Bing partnership) use
  // this to pick which content to read aloud when a user asks a HowTo-
  // shaped query ("how do I budget for a kitchen renovation in
  // vancouver?"). The h1 is the most informative single piece of content
  // for a HowTo-intent query. Schema-implementation discipline: verified
  // the xpath resolves on prod via curl + grep before shipping.
  schema.speakable = {
    '@type': 'SpeakableSpecification',
    xpath: ['//main//h1[1]'],
  };

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
