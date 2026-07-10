import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import JobPostingSchema from '@/components/structured-data/JobPostingSchema';
import type { Company } from '@/lib/types';

const company: Company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
  geo: { latitude: 49.16627, longitude: -123.13382 },
} as unknown as Company;

function extractJsonLd(html: string): Record<string, unknown> {
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  return JSON.parse((m?.[1] ?? '{}').replace(/\\u003c/g, '<'));
}

function render(extra?: Partial<Record<string, unknown>>) {
  const html = renderToStaticMarkup(
    <JobPostingSchema
      company={company}
      locale="en"
      title="Renovation Worker"
      description="Join the team."
      datePosted="2026-07-09"
      baseSalaryMonthCad={4000}
      skills="Demolition, tiling, drywall"
      qualifications="Experience preferred; legally eligible to work in Canada."
      {...extra}
    />,
  );
  return extractJsonLd(html);
}

describe('JobPostingSchema', () => {
  it('emits a valid JobPosting with the required fields', () => {
    const s = render();
    expect(s['@type']).toBe('JobPosting');
    expect(s.title).toBe('Renovation Worker');
    expect(s.datePosted).toBe('2026-07-09');
    expect(s.skills).toBe('Demolition, tiling, drywall');
    expect(s.qualifications).toContain('Experience preferred');
  });

  it('validThrough is a DATE-only string (no time), stable within a day, always future', () => {
    const s = render();
    const vt = s.validThrough as string;
    expect(vt).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD, no time component → no churn
    expect(new Date(vt).getTime()).toBeGreaterThan(Date.now()); // never lapsed
    // ~180 days out (allow ±2 for tz/rounding)
    const days = (new Date(vt).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(178);
    expect(days).toBeLessThan(182);
  });

  it('baseSalary reflects the CAD monthly figure', () => {
    const s = render();
    const bs = s.baseSalary as Record<string, unknown>;
    expect(bs.currency).toBe('CAD');
    expect((bs.value as Record<string, unknown>).value).toBe(4000);
    expect((bs.value as Record<string, unknown>).unitText).toBe('MONTH');
  });

  it('omits baseSalary when no figure is provided', () => {
    const s = render({ baseSalaryMonthCad: undefined });
    expect(s.baseSalary).toBeUndefined();
  });

  it('skills/qualifications come from props (localizable), not hardcoded English', () => {
    const s = render({ skills: '拆除、贴砖、石膏板', qualifications: '有经验者优先。' });
    expect(s.skills).toBe('拆除、贴砖、石膏板');
    expect(s.qualifications).toBe('有经验者优先。');
  });
});
