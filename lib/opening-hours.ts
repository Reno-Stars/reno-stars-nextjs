import { OPENING_HOURS } from '@/lib/company-config';

/**
 * Human-readable opening hours, derived from OPENING_HOURS — the same constant
 * the LocalBusiness schema emits and the Google Business Profile mirrors.
 *
 * The contact page used to carry its own hand-typed hours in 14 message files
 * ("Mon–Fri 8AM–6PM, Sat 9AM–4PM"), which drifted from both the schema and GBP.
 * Deriving the text here makes that disagreement impossible by construction.
 *
 * Call from a Server Component only: Node's full ICU and a browser's Intl can
 * format the same time differently (e.g. U+202F before "AM"), which would be a
 * hydration mismatch if both sides rendered it.
 */

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

// 2024-01-01 was a Monday — a fixed reference week for weekday names.
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1);

export interface FormattedHours {
  /** One line, e.g. "Mon – Sat 9:30 AM – 9:00 PM · Sun 11:00 AM – 7:00 PM". */
  short: string;
  /** One line per group, e.g. "Monday – Saturday: 9:30 AM – 9:00 PM". */
  detail: string[];
}

function weekdayName(day: (typeof WEEK)[number], locale: string, width: 'short' | 'long'): string {
  const date = new Date(REFERENCE_MONDAY_UTC + WEEK.indexOf(day) * 86_400_000);
  return new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' }).format(date);
}

function timeOfDay(hhmm: string, locale: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2024, 0, 1, h, m)));
}

function dayRange(days: readonly string[], locale: string, width: 'short' | 'long'): string {
  const first = weekdayName(days[0] as (typeof WEEK)[number], locale, width);
  if (days.length === 1) return first;
  const last = weekdayName(days[days.length - 1] as (typeof WEEK)[number], locale, width);
  return `${first} – ${last}`;
}

export function formatOpeningHours(locale: string): FormattedHours {
  const groups = OPENING_HOURS.map((spec) => ({
    shortDays: dayRange(spec.dayOfWeek, locale, 'short'),
    longDays: dayRange(spec.dayOfWeek, locale, 'long'),
    times: `${timeOfDay(spec.opens, locale)} – ${timeOfDay(spec.closes, locale)}`,
  }));
  return {
    short: groups.map((g) => `${g.shortDays} ${g.times}`).join(' · '),
    detail: groups.map((g) => `${g.longDays}: ${g.times}`),
  };
}
