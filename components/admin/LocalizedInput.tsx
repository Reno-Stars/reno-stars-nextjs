'use client';

import { useEffect } from 'react';
import { ADMIN_LOCALES, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';
import { localeNames } from '@/i18n/config';
import { useLocalizedForm } from './LocalizedFormContext';
import { NAVY, GOLD, ERROR, TEXT_MUTED } from '@/lib/theme';
import { inputStyle } from './shared-styles';
import Tooltip from './Tooltip';
import { useAdminTranslations } from '@/lib/admin/translations';

interface LocalizedInputProps {
  /** Field name root, e.g. 'title'. The component derives the per-locale key as `${name}${LocaleSuffix}`. */
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
  maxLength?: number;
}

function getCounterColor(length: number, max: number): string {
  if (length >= max) return ERROR;
  if (length >= max * 0.8) return GOLD;
  return TEXT_MUTED;
}

/**
 * Replaces `<BilingualInput>`. Renders a single visible input for the active
 * locale. The form provider tracks values for all 14 locales; the visible
 * field swaps when the user changes locale via `<LocaleSwitcher>`.
 *
 * Native `*En` / `*Zh` form fields are emitted as hidden inputs so existing
 * server actions that read `formData.get('titleEn')` keep working unchanged.
 * The other 12 locales travel inside the provider's hidden `localizations`
 * JSON blob — the `parse-localizations.ts` helper unwraps it on the server.
 */
export default function LocalizedInput({
  name,
  label,
  required = false,
  placeholder,
  tooltip,
  maxLength,
}: LocalizedInputProps) {
  const t = useAdminTranslations();
  const { activeLocale, getValue, setValue, registerField } = useLocalizedForm();

  useEffect(() => {
    registerField(name);
  }, [name, registerField]);

  const activeKey = fieldKey(name, activeLocale);
  const value = getValue(activeKey);

  return (
    <fieldset style={{ marginBottom: '1rem', border: 'none', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <legend style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
          {label}
          <span style={{ fontWeight: 400, color: TEXT_MUTED, fontSize: '0.6875rem', marginLeft: '0.375rem' }}>
            ({localeNames[activeLocale]})
          </span>
          {maxLength !== undefined && (
            <span style={{ fontWeight: 400, color: TEXT_MUTED, fontSize: '0.6875rem', marginLeft: '0.375rem' }}>
              ({t.common.maxLength.replace('{count}', String(maxLength))})
            </span>
          )}
        </legend>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <input
        id={activeKey}
        value={value}
        onChange={(e) => setValue(activeKey, e.target.value)}
        required={required && activeLocale === 'en'}
        placeholder={placeholder}
        style={inputStyle}
      />
      {maxLength !== undefined && (
        <span style={{ fontSize: '0.6875rem', color: getCounterColor(value.length, maxLength), marginTop: '0.125rem', display: 'block', textAlign: 'right' }}>
          {value.length}/{maxLength}
        </span>
      )}

      {/* Hidden inputs for native EN/ZH so existing server actions parse them
          via formData.get('titleEn') / 'titleZh' unchanged. The other 12
          locales travel inside the provider's `localizations` blob. */}
      {ADMIN_LOCALES.filter(isNativeLocale).map((loc) => {
        const k = fieldKey(name, loc);
        if (k === activeKey) return null;
        return <input key={k} type="hidden" name={k} value={getValue(k)} readOnly />;
      })}
      {/* The visible input is the active one — give it a name so it submits.
          Done as a parallel hidden field rather than reusing the visible
          element's name, because controlled inputs render fine with a name
          but server actions for native locales rely on consistent naming. */}
      {isNativeLocale(activeLocale) && (
        <input type="hidden" name={activeKey} value={value} readOnly />
      )}
    </fieldset>
  );
}
