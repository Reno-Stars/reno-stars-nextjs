/**
 * Pure shared row-mapping helpers used across every domain query module.
 * Extracted from queries.ts (2026-07-09 split). No DB access here — these
 * are deterministic transforms over already-fetched rows.
 */

/**
 * For per-row arrays (tags, benefits, highlights), build a Localized<string[]>
 * by reading each row's localizations jsonb. Items without a translation in
 * the requested locale fall back to the EN value, so locale arrays are always
 * the same length as the source array.
 */
export const ARRAY_LOCALE_SUFFIXES = [
  ['ZhHant', 'zh-Hant'],
  ['Ja', 'ja'],
  ['Ko', 'ko'],
  ['Es', 'es'],
  ['Pa', 'pa'],
  ['Tl', 'tl'],
  ['Fa', 'fa'],
  ['Vi', 'vi'],
  ['Ru', 'ru'],
  ['Ar', 'ar'],
  ['Hi', 'hi'],
  ['Fr', 'fr'],
] as const;

export function buildLocalizedArray<R extends { localizations?: unknown }>(
  rows: R[],
  enField: keyof R,
  zhField: keyof R,
  jsonbBaseName: string,
): import('../types').Localized<string[]> {
  const result: import('../types').Localized<string[]> = {
    en: rows.map((r) => r[enField] as string),
    zh: rows.map((r) => r[zhField] as string),
  };
  for (const [suffix, key] of ARRAY_LOCALE_SUFFIXES) {
    const arr = rows.map((r) => {
      const loc = r.localizations as Record<string, unknown> | null | undefined;
      const v = loc?.[`${jsonbBaseName}${suffix}`];
      return typeof v === 'string' && v ? v : (r[enField] as string);
    });
    // Only include the locale if at least one translation exists (otherwise
    // pickLocale would already fall back to en — no need to duplicate).
    if (arr.some((v, i) => v !== rows[i][enField])) {
      result[key] = arr;
    }
  }
  return result;
}

/** Build a Localized<string[]> for a single row's newline-list field with
 *  per-locale variants in the row's localizations jsonb (e.g. highlightsJa).
 *  Used for service_areas.highlights where each row has its own list. */
export function buildSingleRowLocalizedArray(
  row: { localizations?: unknown },
  enList: string[] | null | undefined,
  zhList: string[] | null | undefined,
  jsonbBaseName: string,
): import('../types').Localized<string[]> | undefined {
  if (!enList && !zhList) return undefined;
  const result: import('../types').Localized<string[]> = {
    en: enList ?? [],
    zh: zhList ?? [],
  };
  const loc = row.localizations as Record<string, unknown> | null | undefined;
  for (const [suffix, key] of ARRAY_LOCALE_SUFFIXES) {
    const raw = loc?.[`${jsonbBaseName}${suffix}`];
    if (typeof raw === 'string' && raw.trim()) {
      result[key] = parseNewlineList(raw) ?? [];
    } else if (Array.isArray(raw)) {
      result[key] = raw.filter((v): v is string => typeof v === 'string');
    }
  }
  return result;
}

/** Helper to sort arrays by displayOrder field */
export function sortByDisplayOrder<T extends { displayOrder: number }>(arr: T[]): T[] {
  return arr.slice().sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Helper to group array items by a key field into a Map */
export function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

/** Parse newline-separated text into a string array, filtering empty lines. */
export function parseNewlineList(text: string | null): string[] | undefined {
  if (!text) return undefined;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}
