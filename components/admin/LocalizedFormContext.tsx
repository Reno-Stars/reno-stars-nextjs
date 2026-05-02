'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { ADMIN_LOCALES, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';

/** Map of `${field}${LocaleSuffix}` → string. Holds all 14 locales for every registered field. */
export type LocaleValues = Record<string, string>;

interface LocalizedFormContextValue {
  activeLocale: Locale;
  setActiveLocale: (l: Locale) => void;
  /** All current values, keyed by `${field}${LocaleSuffix}`. */
  values: LocaleValues;
  /** Get a single value (returns '' when missing). */
  getValue: (key: string) => string;
  /** Set a single value. */
  setValue: (key: string, value: string) => void;
  /**
   * Patch many values at once. Used by the auto-translate button.
   * Replaces only the keys present in `patch`; other keys are preserved.
   */
  patchValues: (patch: Partial<LocaleValues>) => void;
  /** Field names registered by Localized inputs (drives auto-translate). */
  fieldNames: string[];
  /** Register a field name so the auto-translate button knows what to operate on. */
  registerField: (name: string) => void;
}

const Ctx = createContext<LocalizedFormContextValue | null>(null);

export function useLocalizedForm(): LocalizedFormContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocalizedForm must be used inside <LocalizedFormProvider>');
  return v;
}

interface LocalizedFormProviderProps {
  /** Initial values keyed by `${field}${LocaleSuffix}`. */
  initialValues?: LocaleValues;
  defaultLocale?: Locale;
  children: ReactNode;
}

/**
 * Wraps a form. Children include any `<LocalizedInput>` / `<LocalizedTextarea>`
 * plus the regular form controls. The provider renders one hidden
 * `<input name="localizations">` carrying a JSON blob of all NON-en/zh
 * field values — server-side, parse-localizations.ts unwraps it and
 * merges into the row's `localizations` jsonb column on save.
 *
 * The native `*En` / `*Zh` keys are still rendered by Localized inputs as
 * regular form fields, so existing server-action parsing (formData.get
 * ('titleEn'), etc.) keeps working without changes.
 */
export function LocalizedFormProvider({
  initialValues,
  defaultLocale = 'en',
  children,
}: LocalizedFormProviderProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>(
    ADMIN_LOCALES.includes(defaultLocale) ? defaultLocale : 'en',
  );
  const [values, setValues] = useState<LocaleValues>(initialValues ?? {});
  const fieldNamesRef = useRef<Set<string>>(new Set());
  const [fieldNames, setFieldNames] = useState<string[]>([]);

  const getValue = useCallback((key: string) => values[key] ?? '', [values]);

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const patchValues = useCallback((patch: Partial<LocaleValues>) => {
    setValues((prev) => {
      const next: LocaleValues = { ...prev };
      for (const [k, v] of Object.entries(patch)) {
        if (typeof v === 'string') next[k] = v;
      }
      return next;
    });
  }, []);

  const registerField = useCallback((name: string) => {
    if (fieldNamesRef.current.has(name)) return;
    fieldNamesRef.current.add(name);
    setFieldNames(Array.from(fieldNamesRef.current));
  }, []);

  const ctx = useMemo<LocalizedFormContextValue>(
    () => ({ activeLocale, setActiveLocale, values, getValue, setValue, patchValues, fieldNames, registerField }),
    [activeLocale, values, getValue, setValue, patchValues, fieldNames, registerField],
  );

  // Build the JSON blob of non-native keys for submission.
  const localizationsBlob = useMemo(() => {
    const out: Record<string, string> = {};
    for (const name of fieldNames) {
      for (const loc of ADMIN_LOCALES) {
        if (isNativeLocale(loc)) continue;
        const k = fieldKey(name, loc);
        const v = values[k];
        if (typeof v === 'string' && v.length > 0) out[k] = v;
      }
    }
    return JSON.stringify(out);
  }, [values, fieldNames]);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <input type="hidden" name="localizations" value={localizationsBlob} />
    </Ctx.Provider>
  );
}
