interface FAQ {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQ[];
  /** BCP-47 locale. When provided, emits `inLanguage` for locale targeting. */
  locale?: string;
}

export default function FAQSchema({ faqs, locale }: FAQSchemaProps): React.ReactElement | null {
  if (faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    // Speakable spec — marks FAQ Q+A pairs as voice-readable. Voice
    // assistants (Google Assistant, Alexa via Bing) use this to pick FAQ
    // content to read aloud when a query matches one of the questions.
    // cssSelector targets the matching button + answer-div elements
    // emitted by FaqSection (see id=faq-question-* / id=faq-answer-* in
    // components/home/FaqSection.tsx, paired in the same commit).
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[id^="faq-question-"]', '[id^="faq-answer-"]'],
    },
    ...(locale && { inLanguage: locale }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
