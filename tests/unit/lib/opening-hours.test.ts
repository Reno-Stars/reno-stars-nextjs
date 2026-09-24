import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { formatOpeningHours } from '@/lib/opening-hours';
import { OPENING_HOURS } from '@/lib/company-config';

const MESSAGES = join(process.cwd(), 'messages');

/** Locale folders — every folder that ships a label.json (skips e.g. `admin`). */
function localeDirs(): string[] {
  return readdirSync(MESSAGES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(MESSAGES, d.name, 'label.json')))
    .map((d) => d.name);
}

describe('formatOpeningHours', () => {
  it('renders the same hours the LocalBusiness schema emits', () => {
    const { short, detail } = formatOpeningHours('en');
    expect(detail).toHaveLength(OPENING_HOURS.length);
    expect(detail[0]).toMatch(/^Monday – Saturday: 9:30\sAM – 9:00\sPM$/);
    expect(detail[1]).toMatch(/^Sunday: 11:00\sAM – 7:00\sPM$/);
    expect(short).toMatch(/^Mon – Sat 9:30\sAM – 9:00\sPM · Sun 11:00\sAM – 7:00\sPM$/);
  });

  it('localises weekday names and times', () => {
    const { detail } = formatOpeningHours('zh');
    expect(detail[0]).toContain('星期一');
    expect(detail[0]).toContain('星期六');
    expect(detail[1]).toContain('星期日');
  });

  it('formats every shipped locale without throwing', () => {
    const locales = localeDirs();
    expect(locales.length).toBe(14);
    for (const locale of locales) {
      const { short, detail } = formatOpeningHours(locale);
      expect(short.length).toBeGreaterThan(0);
      expect(detail).toHaveLength(OPENING_HOURS.length);
    }
  });
});

describe('contact hours cannot drift from the schema again', () => {
  it('no message file carries its own hand-typed business hours', () => {
    for (const locale of localeDirs()) {
      const raw = readFileSync(join(MESSAGES, locale, 'label.json'), 'utf8');
      const label = JSON.parse(raw).label as Record<string, string>;
      expect(label.businessHoursShort, locale).toBeUndefined();
      expect(label.businessHoursDetail, locale).toBeUndefined();
      expect(label.showroomByAppointment, locale).toBeTruthy();
    }
  });
});
