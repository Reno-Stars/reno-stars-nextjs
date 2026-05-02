'use client';

import { useEffect } from 'react';
import { ADMIN_LOCALES, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';
import { localeNames } from '@/i18n/config';
import { useLocalizedForm } from './LocalizedFormContext';
import { NAVY, SURFACE, TEXT_MUTED } from '@/lib/theme';
import { inputStyle } from './shared-styles';
import Tooltip from './Tooltip';

interface LocalizedTextareaProps {
  name: string;
  label: string;
  required?: boolean;
  rows?: number;
  tooltip?: string;
  disabled?: boolean;
}

const textareaStyle = { ...inputStyle, resize: 'vertical' as const };

export default function LocalizedTextarea({
  name,
  label,
  required = false,
  rows = 4,
  tooltip,
  disabled = false,
}: LocalizedTextareaProps) {
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
        </legend>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <textarea
        id={activeKey}
        value={value}
        onChange={(e) => setValue(activeKey, e.target.value)}
        required={required && activeLocale === 'en'}
        rows={rows}
        disabled={disabled}
        style={{ ...textareaStyle, background: SURFACE, opacity: disabled ? 0.6 : 1 }}
      />

      {ADMIN_LOCALES.filter(isNativeLocale).map((loc) => {
        const k = fieldKey(name, loc);
        if (k === activeKey) return null;
        return <input key={k} type="hidden" name={k} value={getValue(k)} readOnly />;
      })}
      {isNativeLocale(activeLocale) && (
        <input type="hidden" name={activeKey} value={value} readOnly />
      )}
    </fieldset>
  );
}
