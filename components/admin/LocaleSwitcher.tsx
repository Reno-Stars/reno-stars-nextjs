'use client';

import { ADMIN_LOCALES } from '@/lib/admin/locale-keys';
import { localeNames } from '@/i18n/config';
import { NAVY, GOLD_PALE } from '@/lib/theme';
import { useLocalizedForm } from './LocalizedFormContext';

/**
 * Locale dropdown for the admin form. Replaces the side-by-side EN+ZH grid.
 * Drop one of these at the top of any form wrapped in `<LocalizedFormProvider>`
 * — every `<LocalizedInput>` / `<LocalizedTextarea>` swaps its visible value
 * to match the selected locale.
 */
export default function LocaleSwitcher() {
  const { activeLocale, setActiveLocale } = useLocalizedForm();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.5rem 0.375rem 0.625rem',
        borderRadius: '8px',
        backgroundColor: GOLD_PALE,
      }}
    >
      <label
        htmlFor="admin-locale-switcher"
        style={{ color: NAVY, fontSize: '0.75rem', fontWeight: 600 }}
      >
        Editing language
      </label>
      <select
        id="admin-locale-switcher"
        value={activeLocale}
        onChange={(e) => setActiveLocale(e.target.value as typeof activeLocale)}
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: NAVY,
          background: 'white',
          border: `1px solid ${NAVY}`,
          borderRadius: '6px',
          padding: '0.25rem 0.5rem',
          cursor: 'pointer',
        }}
      >
        {ADMIN_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]} ({loc.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
