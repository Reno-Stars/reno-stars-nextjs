import { it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FeaturedCityProject from '@/components/FeaturedCityProject';
import {
  CITY_PARAGRAPH_OVERRIDES,
  getCityParagraphOverride,
  splitMarkdownLinks,
} from '@/lib/data/city-paragraph-overrides';
import type { LocalizedProject } from '@/lib/types';

// The navigation Link pulls in Next runtime internals that do not resolve under
// the plain jsdom transform, so stub it to a trivial <a>. vi.mock is hoisted
// above the imports: the stub is a function declaration (hoisted as well) and
// its tag name comes from vi.hoisted so the factory never touches a const in
// its temporal dead zone.
const ANCHOR_TAG = vi.hoisted(() => 'a');
vi.mock('@/navigation', () => ({ Link: LinkStub }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LinkStub(props: any) {
  return React.createElement(ANCHOR_TAG, props, props.children);
}

/*
 * The featured-project card on /services/<service>/<city> renders the
 * project's own DB description. The override table swaps that ONE paragraph
 * for an approved, city-specific paragraph on exactly five EN pages (Ryan,
 * 2026-11-13). These tests pin the blast radius: the five keyed EN pages
 * change, their zh / zh-Hant siblings do not, and no other service×city page
 * (including the seven test-A control pages) is touched.
 */

const EN = 'en';
const ZH_LOCALES = ['zh', 'zh-Hant'];

const APPROVED = [
  'en/services/kitchen/richmond',
  'en/services/basement/langley',
  'en/services/cabinet/delta',
  'en/services/bathroom/richmond',
  'en/services/bathroom/surrey',
];
/** [key, service, city] for each approved page. */
const APPROVED_TRIPLES = APPROVED.map(
  (key): [string, string, string] => [key, key.split('/')[2], key.split('/')[3]],
);

// Paragraph drafted but NOT approved for release: the live featured project on
// these pages is a different case than the paragraph describes.
const DEFERRED = [
  ['kitchen', 'coquitlam'],
  ['basement', 'north-vancouver'],
  ['bathroom', 'burnaby'],
  ['bathroom', 'vancouver'],
];

// Test-A control pages: the whole page must be unchanged.
const CONTROL = [
  ['kitchen', 'delta'],
  ['kitchen', 'north-vancouver'],
  ['basement', 'burnaby'],
  ['basement', 'port-moody'],
  ['cabinet', 'port-moody'],
  ['bathroom', 'white-rock'],
  ['critical-load-panel', 'langley'],
];

// Same cities as the approved pages, other services: must keep the DB description.
const SAME_CITY_OTHER_SERVICE = [
  ['kitchen', 'surrey'],
  ['bathroom', 'delta'],
  ['kitchen', 'langley'],
  ['basement', 'richmond'],
];

const UNTOUCHED = [...SAME_CITY_OTHER_SERVICE, ...CONTROL, ...DEFERRED];

const DB_DESCRIPTION = 'DB DESCRIPTION SENTINEL — must only appear when no override applies.';
const PROJECT_SLUG = 'returning-customer-kitchen-renovation-richmond-white-shaker';
const PROJECT_TITLE = 'Returning Customer Kitchen Renovation in Richmond — White Shaker + Quartz';
const CARD_HREF = 'href="/projects/' + PROJECT_SLUG + '"';
const HEADING = 'Recent Richmond Kitchen Renovation Project';
const SUBHEADING = 'Real budget, real timeline, real scope from our portfolio.';
const VIEW_CTA = 'View full project';
const KITCHEN = 'kitchen';
const RICHMOND = 'richmond';
const RICHMOND_NAME = 'Richmond';
const DELTA = 'delta';
const TOWNHOUSE = 'Townhouse';
const BUDGET = '$40K–$50K';
const DURATION = '2–3 weeks';
const SCOPE = ['Cabinets', 'Quartz'];
const NONE = '';

const project: LocalizedProject = {
  slug: PROJECT_SLUG,
  title: PROJECT_TITLE,
  description: DB_DESCRIPTION,
  category: KITCHEN,
  location_city: RICHMOND_NAME,
  hero_image: NONE,
  images: [],
  budget_range: BUDGET,
  duration: DURATION,
  space_type: TOWNHOUSE,
  service_scope: SCOPE,
};

const DESCRIPTION_P = /<p class="text-sm mb-5 leading-relaxed"[^>]*>(.*?)<\/p>/s;
const TAG_RE = /<[^>]+>/g;
const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const LINK_TEXT = '$1';
const ANCHOR_OPEN = /<a\b/g;
const KEY_SHAPE = /^en\/services\/[a-z0-9-]+\/[a-z0-9-]+$/;
const EN_PROJECT_URL = /^https:\/\/www\.reno-stars\.com\/en\/projects\/[a-z0-9-]+\/$/;
const CLOSING_SENTENCE = /\. See the project: \[[^\]]+\]\(https:\/\/[^)]+\)\.$/;
const ANGLE_BRACKETS = /[<>]/;
const NEWLINE = /\n/;
const MISSING_P = 'description paragraph missing';
/** Entities renderToStaticMarkup emits for the characters these paragraphs use. */
const ENTITIES: Array<[RegExp, string]> = [
  [/&#x27;/g, "'"],
  [/&quot;/g, '"'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&amp;/g, '&'],
];
const label = (...parts: string[]) => parts.join(' ');
const seg = (text: string, href?: string) => (href ? { text, href } : { text });
const SAMPLE = 'a [b](c) d.';
const SAMPLE_SEGMENTS = [seg('a '), seg('b', 'c'), seg(' d.')];
const PLAIN = 'plain';

function render(locale?: string, serviceSlug?: string, citySlug?: string): string {
  return renderToStaticMarkup(
    <FeaturedCityProject
      project={project}
      heading={HEADING}
      subheading={SUBHEADING}
      viewCta={VIEW_CTA}
      locale={locale}
      serviceSlug={serviceSlug}
      citySlug={citySlug}
    />,
  );
}

/** Visible text of the description <p> inside the card, entities decoded. */
function descriptionText(html: string): string {
  const m = DESCRIPTION_P.exec(html);
  expect(m, MISSING_P).not.toBeNull();
  return ENTITIES.reduce((acc, [re, ch]) => acc.replace(re, ch), m![1].replace(TAG_RE, NONE));
}

/** What a paragraph reads as once its markdown link is rendered as text. */
function visibleOf(markdown: string): string {
  return markdown.replace(MD_LINK, LINK_TEXT);
}

it('table: holds exactly the five approved EN pages, keyed by full path', () => {
  expect(Object.keys(CITY_PARAGRAPH_OVERRIDES).sort()).toEqual([...APPROVED].sort());
  for (const key of Object.keys(CITY_PARAGRAPH_OVERRIDES)) {
    expect(key).toMatch(KEY_SHAPE);
  }
});

it('table: every paragraph is plain text ending in one markdown link to the EN project page', () => {
  for (const [key, para] of Object.entries(CITY_PARAGRAPH_OVERRIDES)) {
    expect(para, key).not.toMatch(ANGLE_BRACKETS);
    expect(para, key).not.toMatch(NEWLINE);
    const links = splitMarkdownLinks(para).filter((s) => s.href);
    expect(links, key).toHaveLength(1);
    expect(links[0].href, key).toMatch(EN_PROJECT_URL);
    expect(para, key).toMatch(CLOSING_SENTENCE);
  }
});

it('table: does not carry the four deferred pages (featured case differs from the paragraph case)', () => {
  for (const [svc, city] of DEFERRED) {
    expect(CITY_PARAGRAPH_OVERRIDES[label(EN, svc, city)]).toBeUndefined();
    expect(getCityParagraphOverride(EN, svc, city)).toBeUndefined();
  }
});

it('lookup: returns the paragraph for the five EN pages', () => {
  for (const [key, svc, city] of APPROVED_TRIPLES) {
    expect(getCityParagraphOverride(EN, svc, city)).toBe(CITY_PARAGRAPH_OVERRIDES[key]);
  }
});

it('lookup: returns nothing for zh / zh-Hant on the same pages', () => {
  for (const [, svc, city] of APPROVED_TRIPLES) {
    for (const locale of ZH_LOCALES) {
      expect(getCityParagraphOverride(locale, svc, city)).toBeUndefined();
    }
  }
});

it('lookup: returns nothing for other services in the same cities, the control pages, and the deferred pages', () => {
  for (const [svc, city] of UNTOUCHED) {
    expect(getCityParagraphOverride(EN, svc, city), label(svc, city)).toBeUndefined();
  }
});

it('lookup: returns nothing when the page identity is absent (legacy callers)', () => {
  expect(getCityParagraphOverride(undefined, KITCHEN, RICHMOND)).toBeUndefined();
  expect(getCityParagraphOverride(EN, undefined, RICHMOND)).toBeUndefined();
  expect(getCityParagraphOverride(EN, KITCHEN, undefined)).toBeUndefined();
});

it('splitMarkdownLinks: splits text around [text](href) links and keeps everything else verbatim', () => {
  expect(splitMarkdownLinks(SAMPLE)).toEqual(SAMPLE_SEGMENTS);
  expect(splitMarkdownLinks(PLAIN)).toEqual([seg(PLAIN)]);
});

it('component: renders the approved paragraph verbatim on each of the five EN pages, in place of the DB description', () => {
  for (const [key, svc, city] of APPROVED_TRIPLES) {
    const html = render(EN, svc, city);
    expect(descriptionText(html), key).toBe(visibleOf(CITY_PARAGRAPH_OVERRIDES[key]));
    expect(html, key).not.toContain(DB_DESCRIPTION);
    // One anchor only, the card itself: the paragraph link must not nest a second <a>.
    expect(html.match(ANCHOR_OPEN), key).toHaveLength(1);
    expect(html, key).toContain(CARD_HREF);
  }
});

it('component: keeps the DB description on zh and zh-Hant for the same pages', () => {
  for (const [key, svc, city] of APPROVED_TRIPLES) {
    for (const locale of ZH_LOCALES) {
      expect(descriptionText(render(locale, svc, city)), label(locale, key)).toBe(DB_DESCRIPTION);
    }
  }
});

it('component: keeps the DB description on other EN pages (same-city other services, control pages, deferred pages)', () => {
  for (const [svc, city] of UNTOUCHED) {
    expect(descriptionText(render(EN, svc, city)), label(svc, city)).toBe(DB_DESCRIPTION);
  }
});

it('component: keeps the DB description when no page identity is passed', () => {
  expect(descriptionText(render())).toBe(DB_DESCRIPTION);
});

it('component: renders the same card for a non-overridden page (heading, subheading, CTA, chips)', () => {
  const html = render(EN, KITCHEN, DELTA);
  expect(html).toContain(HEADING);
  expect(html).toContain(SUBHEADING);
  expect(html).toContain(VIEW_CTA);
  expect(html).toContain(BUDGET);
  expect(html).toContain(DURATION);
});
