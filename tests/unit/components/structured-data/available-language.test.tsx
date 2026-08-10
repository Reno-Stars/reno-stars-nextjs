import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ContactPageSchema from '@/components/structured-data/ContactPageSchema';
import LocalBusinessSchema from '@/components/structured-data/LocalBusinessSchema';
import { SCHEMA_AVAILABLE_LANGUAGES, locales, LOCALE_META } from '@/i18n/config';
import type { Company, ServiceArea, SocialLink } from '@/lib/types';

// Pins the fix for the final-review finding: two hand-maintained
// availableLanguage arrays (ContactPageSchema ['English', 'Chinese'],
// LocalBusinessSchema's 7-language sitewide list) independently asserted the
// same staffing fact LOCALE_META.nativeSupport now owns, and could disagree
// with it and with each other. LocalBusinessSchema's copy was the serious
// one: it renders from app/[locale]/layout.tsx, so it shipped on every page
// of the site — including claiming service in Japanese, Korean, Spanish and
// French, languages the LanguageSupportNotice on the contact page explicitly
// disclaims for those same locales.
//
// Both schemas must now emit exactly SCHEMA_AVAILABLE_LANGUAGES, derived from
// LOCALE_META.nativeSupport, so the two can never drift from each other or
// from the notice again.

const company: Company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
  geo: { latitude: 49.16627, longitude: -123.13382 },
  liabilityCoverage: '$5M',
  foundingYear: 2007,
  teamSize: 17,
  tagline: 'Where Renovation Starts',
} as unknown as Company;

const socialLinks: SocialLink[] = [{ url: 'https://example.com/social', platform: 'facebook' } as unknown as SocialLink];
const areas: ServiceArea[] = [{ slug: 'vancouver', name: { en: 'Vancouver', zh: '温哥华' } } as unknown as ServiceArea];

/** Extract the first parsed JSON-LD object from a rendered HTML string. */
function extractJsonLd(html: string): Record<string, unknown> {
  const inner = html
    .replace(/^.*?<script[^>]*type="application\/ld\+json"[^>]*>/, '')
    .replace(/<\/script>.*$/, '');
  return JSON.parse(inner.replace(/\\u003c/g, '<')) as Record<string, unknown>;
}

describe('availableLanguage matches SCHEMA_AVAILABLE_LANGUAGES', () => {
  it('SCHEMA_AVAILABLE_LANGUAGES today is exactly the 3 natively-supported locales', () => {
    // Pinned literal, not just a derived-equals-derived tautology: proves the
    // SSOT itself currently evaluates to what the team can actually staff.
    expect([...SCHEMA_AVAILABLE_LANGUAGES]).toEqual(['English', 'Mandarin Chinese', 'Cantonese']);
  });

  it('contains no language whose locale has nativeSupport: false', () => {
    // This is the assertion that makes the drift impossible to reintroduce:
    // it fails the moment a non-supported locale's schemaLanguage sneaks back
    // into the emitted array, regardless of how it got there.
    const unsupportedLanguages = locales
      .filter((loc) => !LOCALE_META[loc].nativeSupport)
      .map((loc) => LOCALE_META[loc].schemaLanguage);
    for (const lang of SCHEMA_AVAILABLE_LANGUAGES) {
      expect(unsupportedLanguages).not.toContain(lang);
    }
  });

  it('ContactPageSchema emits SCHEMA_AVAILABLE_LANGUAGES verbatim', () => {
    const html = renderToStaticMarkup(
      <ContactPageSchema company={company} areaNames={['Vancouver']} locale="en" />,
    );
    const schema = extractJsonLd(html);
    const mainEntity = schema.mainEntity as Record<string, unknown>;
    const contactPoint = mainEntity.contactPoint as Record<string, unknown>;
    expect(contactPoint.availableLanguage).toEqual([...SCHEMA_AVAILABLE_LANGUAGES]);
  });

  it('LocalBusinessSchema emits SCHEMA_AVAILABLE_LANGUAGES verbatim, sitewide', () => {
    const html = renderToStaticMarkup(
      <LocalBusinessSchema company={company} socialLinks={socialLinks} areas={areas} />,
    );
    const schema = extractJsonLd(html);
    const [contactPoint] = schema.contactPoint as Array<Record<string, unknown>>;
    expect(contactPoint.availableLanguage).toEqual([...SCHEMA_AVAILABLE_LANGUAGES]);
  });

  it('regression: LocalBusinessSchema no longer claims Japanese/Korean/Spanish/French service', () => {
    // The exact contradiction the finding named: the old hardcoded 7-language
    // array claimed service in languages the contact-page notice disclaims
    // for those locales (nativeSupport: false for ja/ko/es/fr).
    const html = renderToStaticMarkup(
      <LocalBusinessSchema company={company} socialLinks={socialLinks} areas={areas} />,
    );
    const schema = extractJsonLd(html);
    const [contactPoint] = schema.contactPoint as Array<Record<string, unknown>>;
    const availableLanguage = contactPoint.availableLanguage as string[];
    expect(availableLanguage).not.toContain('Japanese');
    expect(availableLanguage).not.toContain('Korean');
    expect(availableLanguage).not.toContain('Spanish');
    expect(availableLanguage).not.toContain('French');
  });
});
