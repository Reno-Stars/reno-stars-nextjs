import { it, expect, vi } from 'vitest';
import type { Localized, Service } from '@/lib/types';

/**
 * Captain (2026-11-14, PR #400 follow-up): the commercial service page title
 * must not claim a warranty in any locale. The live EN title read
 * "Commercial Renovation Vancouver — 3-Yr Warranty | Reno Stars". The same
 * rule already applied to cabinet; both are pinned here through the real
 * generateMetadata so the title and the share card cannot drift apart.
 * ko/ja titles are deliberately untouched and pinned so the scope cannot
 * widen silently.
 */
const SLUG_KEY = 'service-slug';
const EN = 'en';
const ZH = 'zh';
const ZH_HANT = 'zh-Hant';
const KO = 'ko';
const JA = 'ja';
const COMMERCIAL = 'commercial';
const CABINET = 'cabinet';
const KITCHEN = 'kitchen';

const localized = (en: string, zh: string, zhHant: string, ko: string, ja: string): Localized<string> =>
  Object.fromEntries([[EN, en], [ZH, zh], [ZH_HANT, zhHant], [KO, ko], [JA, ja]]) as Localized<string>;

const service = (slug: string, title: Localized<string>): Service => ({
  slug,
  title,
  description: title,
  showOnServicesPage: true,
});

const SERVICES: Service[] = [
  service(COMMERCIAL, localized('Commercial Renovation', '商业装修', '商業裝修', '상업용 리노베이션', '商業用リノベーション')),
  service(CABINET, localized('Cabinet Refacing', '橱柜翻新', '櫥櫃翻新', '캐비닛 리노베이션', 'キャビネットリノベーション')),
  service(KITCHEN, localized('Kitchen Renovation', '厨房翻新', '廚房翻新', '주방 리노베이션', 'キッチンリノベーション')),
];

vi.mock('@/lib/db/queries', () => ({
  getServicesFromDb: vi.fn(async () => SERVICES),
  getCompanyFromDb: vi.fn(async () => ({})),
  getServiceAreasFromDb: vi.fn(async () => []),
  getReviewsByServiceType: vi.fn(async () => []),
}));

vi.mock('@/navigation', () => ({
  Link: (props: { children?: unknown }) => props.children,
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));

const { generateMetadata } = await import('@/app/[locale]/services/[service-slug]/page');

const titleFor = async (locale: string, slug: string): Promise<string> => {
  const meta = await generateMetadata({
    params: Promise.resolve({ locale, [SLUG_KEY]: slug }),
  } as Parameters<typeof generateMetadata>[0]);
  return String(meta.title);
};

const WARRANTY = /warranty|保修|保固|质保|質保/i;

const NO_WARRANTY_TITLES: [string, string, string][] = [
  [EN, COMMERCIAL, 'Commercial Renovation Vancouver | Reno Stars'],
  [ZH, COMMERCIAL, '商业装修 温哥华 | Reno Stars'],
  [ZH_HANT, COMMERCIAL, '商業裝修 溫哥華 | Reno Stars'],
  [EN, CABINET, 'Cabinet Refacing Vancouver | Reno Stars'],
  [ZH, CABINET, '橱柜翻新 温哥华 | Reno Stars'],
  [ZH_HANT, CABINET, '櫥櫃翻新 溫哥華 | Reno Stars'],
];

it.each(NO_WARRANTY_TITLES)('%s /%s/ title carries no warranty suffix: %s', async (locale, slug, expected) => {
  const title = await titleFor(locale, slug);
  expect(title).toBe(expected);
  expect(title).not.toMatch(WARRANTY);
});

const UNCHANGED_TITLES: [string, string, string][] = [
  [KO, COMMERCIAL, '상업용 리노베이션 밴쿠버 — 3년 보증 | Reno Stars'],
  [JA, COMMERCIAL, '商業用リノベーション バンクーバー — 3年保証 | Reno Stars'],
  [ZH, KITCHEN, '厨房翻新 温哥华 — 最长3年保修 | Reno Stars'],
  [ZH_HANT, KITCHEN, '廚房翻新 溫哥華 — 最長3年保固 | Reno Stars'],
];

it.each(UNCHANGED_TITLES)('%s /%s/ title is unchanged: %s', async (locale, slug, expected) => {
  expect(await titleFor(locale, slug)).toBe(expected);
});
