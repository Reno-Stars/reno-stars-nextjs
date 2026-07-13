import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  BRAND,
  LOCALIZED_BRAND_NAMES,
  brandName,
  brandDisplay,
  BRAND_ALTERNATE_NAMES,
  OPENING_HOURS,
  COMPANY_STATS,
  WECHAT_ID,
  GOOGLE_PLACE_ID,
  GOOGLE_REVIEWS_URL,
  GOOGLE_WRITE_REVIEW_URL,
} from '@/lib/company-config';
import { SITE_NAME } from '@/lib/utils';

const DEFAULT_PLACE_ID = 'ChIJT0f2zbHhhVQRhHrIAuFh0y4';

describe('brand SSOT', () => {
  it('SITE_NAME re-exports BRAND (single source)', () => {
    expect(SITE_NAME).toBe(BRAND);
  });

  it('brandName returns the tailored name for mapped locales and BRAND otherwise', () => {
    expect(brandName('zh')).toBe('聚星装修');
    expect(brandName('zh-Hant')).toBe('聚星裝修');
    expect(brandName('en')).toBe(BRAND);
    expect(brandName('ja')).toBe(BRAND);
  });

  it('brandDisplay keeps "Reno Stars" searchable alongside tailored names (owner rule 2026-07-09)', () => {
    expect(brandDisplay('zh')).toBe(`聚星装修 (${BRAND})`);
    expect(brandDisplay('zh-Hant')).toContain(BRAND);
    expect(brandDisplay('en')).toBe(BRAND);
  });

  it('BRAND_ALTERNATE_NAMES includes every localized name plus the English variants, deduped', () => {
    for (const name of Object.values(LOCALIZED_BRAND_NAMES)) {
      expect(BRAND_ALTERNATE_NAMES).toContain(name);
    }
    expect(BRAND_ALTERNATE_NAMES).toContain(BRAND);
    expect(new Set(BRAND_ALTERNATE_NAMES).size).toBe(BRAND_ALTERNATE_NAMES.length);
  });
});

describe('opening hours SSOT', () => {
  it('mirrors the GBP listing: Mon–Sat 9:30–21:00, Sun 11:00–19:00', () => {
    const weekdays = OPENING_HOURS.find((h) => h.dayOfWeek.includes('Monday'));
    const sunday = OPENING_HOURS.find((h) => h.dayOfWeek.includes('Sunday'));
    expect(weekdays).toMatchObject({ opens: '09:30', closes: '21:00' });
    expect(weekdays?.dayOfWeek).toHaveLength(6);
    expect(sunday).toMatchObject({ opens: '11:00', closes: '19:00' });
  });
});

describe('company stats', () => {
  it('keeps the owner-confirmed facts', () => {
    expect(COMPANY_STATS.companyFoundingYear).toBe(2020);
    expect(COMPANY_STATS.warrantyYears).toBe(3);
    expect(WECHAT_ID).toBe('RenoStars');
  });
});

describe('Google place ID SSOT (finding #12)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('the review + write-review URLs embed the resolved place id (single source)', () => {
    // No GOOGLE_PLACE_ID env in the test runner → falls back to the default.
    expect(GOOGLE_PLACE_ID).toBe(DEFAULT_PLACE_ID);
    expect(GOOGLE_REVIEWS_URL).toContain(GOOGLE_PLACE_ID);
    expect(GOOGLE_WRITE_REVIEW_URL).toContain(GOOGLE_PLACE_ID);
  });

  it('reads GOOGLE_PLACE_ID from the environment when set', async () => {
    vi.resetModules();
    vi.stubEnv('GOOGLE_PLACE_ID', 'ChIJ_TEST_PLACE_ID');
    const mod = await import('@/lib/company-config');
    expect(mod.GOOGLE_PLACE_ID).toBe('ChIJ_TEST_PLACE_ID');
    expect(mod.GOOGLE_REVIEWS_URL).toContain('ChIJ_TEST_PLACE_ID');
    expect(mod.GOOGLE_WRITE_REVIEW_URL).toContain('ChIJ_TEST_PLACE_ID');
  });

  it('falls back to the documented default when the env is empty or unset', async () => {
    vi.resetModules();
    vi.stubEnv('GOOGLE_PLACE_ID', '');
    const mod = await import('@/lib/company-config');
    expect(mod.GOOGLE_PLACE_ID).toBe(DEFAULT_PLACE_ID);
  });
});
