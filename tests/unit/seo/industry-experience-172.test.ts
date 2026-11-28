import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPANY_STATS } from '@/lib/company-config';
import frozen from '@/messages/test-a-frozen/en.json';

/**
 * Task 172 (Ryan 2026-11-27 「20年+的经验，没问题，这是行业经验」): every company "20+ years" claim the
 * site-copy change had replaced is back, worded as the team's INDUSTRY experience — one form per
 * locale, never company age. Founded May 2021 stays where it was.
 */
const L = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'fr', 'ru', 'ar', 'fa', 'hi', 'pa', 'tl', 'vi'] as const;
const IND: Record<(typeof L)[number], RegExp> = {
  en: /20\+ (?:years of industry experience|Years of Industry Experience|Yrs Industry Experience)/,
  zh: /20 多年行业经验/, 'zh-Hant': /20 多年業界經驗/, ja: /20年以上の業界経験/, ko: /20년 이상의 업계 경험/,
  es: /[Mm]ás de 20 años de experiencia en el sector/, fr: /[Pp]lus de 20 ans d'expérience dans le secteur/,
  ru: /[Бб]олее 20 лет опыта в отрасли|более чем 20 годам? опыта в отрасли|20 годами опыта в отрасли/,
  ar: /أكثر من 20 عامًا من الخبرة في القطاع/, fa: /بیش از ۲۰ سال تجربه در صنعت/,
  hi: /20\+ वर्षों (?:का|के) उद्योग अनुभव/, pa: /20\+ ਸਾਲਾਂ (?:ਦਾ ਉਦਯੋਗ ਤਜਰਬਾ|ਦੇ ਉਦਯੋਗ ਤਜਰਬੇ)/,
  tl: /20\+ (?:taong karanasan sa industriya|Taong Karanasan sa Industriya)/, vi: /[Hh]ơn 20 năm kinh nghiệm trong ngành/,
};
const SENTENCE_KEYS = [
  'aboutPage.faq.a1', 'benefits.foundation.items.experience.title', 'contact.whyChooseRenoStarsP1',
  'features.foundation.items.experience.title', 'hero.professionalExcellenceDesc', 'locationBenefits.experience',
  'metadata.home.description', 'metadata.services.description', 'metadata.about.description', 'metadata.about.title',
  'metadata.nearMe.description', 'metadata.serviceLocation.description', 'projects.ctaSubtitle6', 'projects.ctaSubtitle7',
  'serviceBenefits.experience',
];
const LABEL_KEYS = ['aboutPage.stats.years', 'nearMe.trust.experience.label', 'process.footer.yearsIndustry', 'stats.yearsExperience'];

function msg(locale: string, key: string): string {
  const [file, ...rest] = key.split('.');
  let node: unknown = JSON.parse(readFileSync(join(process.cwd(), 'messages', locale, `${file}.json`), 'utf8'))[file];
  for (const k of rest) node = (node as Record<string, unknown>)[k];
  return node as string;
}

describe('industry experience copy (task 172)', () => {
  it.each(L)('%s: every restored sentence carries the industry form', (l) => {
    for (const k of SENTENCE_KEYS) expect(msg(l, k), `${l} ${k}`).toMatch(IND[l]);
  });

  it.each(L)('%s: the stat tiles read "20+" with an industry-experience label', (l) => {
    expect(msg(l, 'nearMe.trust.experience.stat')).toBe('20+');
    const labels = LABEL_KEYS.map((k) => msg(l, k));
    expect(new Set(labels).size).toBe(1);
    expect(labels[0]).not.toMatch(/Founded|成立|創業|설립|Fundación|Fondation|Основана|التأسيس|تأسیس|स्थापना|ਸਥਾਪਨਾ|Itinatag|Thành lập/);
  });

  it('no restored sentence reads as company age', () => {
    for (const l of L) for (const k of SENTENCE_KEYS) {
      expect(msg(l, k), `${l} ${k}`).not.toMatch(/\{years\}|years serving|años sirviendo|in business|en el negocio/);
    }
    expect(COMPANY_STATS.industryExperience).toBe('20+ years of industry experience');
    expect(COMPANY_STATS.industryExperienceStat).toBe('20+');
  });

  it('Test A keeps its original en label through the frozen overlay', () => {
    expect((frozen.values as Record<string, Record<string, string>>).stats.yearsExperience).toBe('Years Combined Team Experience');
  });
});
