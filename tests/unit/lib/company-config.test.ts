import { describe, it, expect } from 'vitest';
import {
  BRAND,
  LOCALIZED_BRAND_NAMES,
  brandName,
  brandDisplay,
  BRAND_ALTERNATE_NAMES,
  OPENING_HOURS,
  COMPANY_STATS,
  WECHAT_ID,
} from '@/lib/company-config';
import { SITE_NAME } from '@/lib/utils';

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
