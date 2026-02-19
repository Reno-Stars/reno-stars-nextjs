'use client';

import { useState } from 'react';
import { NAVY, GOLD, ERROR, TEXT_MUTED } from '@/lib/theme';
import { inputStyle } from './shared-styles';
import Tooltip from './Tooltip';

interface BilingualInputProps {
  nameEn: string;
  nameZh: string;
  label: string;
  defaultValueEn?: string;
  defaultValueZh?: string;
  /** Controlled value for EN field. When provided, the input uses controlled mode. */
  valueEn?: string;
  /** Change handler for controlled EN field */
  onChangeEn?: (value: string) => void;
  /** Controlled value for ZH field. When provided, the input uses controlled mode. */
  valueZh?: string;
  /** Change handler for controlled ZH field */
  onChangeZh?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
  /** When provided, shows a character counter below each input */
  maxLength?: number;
}

function getCounterColor(length: number, max: number): string {
  if (length >= max) return ERROR;
  if (length >= max * 0.8) return GOLD;
  return TEXT_MUTED;
}

export default function BilingualInput({
  nameEn,
  nameZh,
  label,
  defaultValueEn = '',
  defaultValueZh = '',
  valueEn,
  onChangeEn,
  valueZh,
  onChangeZh,
  required = false,
  placeholder,
  tooltip,
  maxLength,
}: BilingualInputProps) {
  // Dual-mode: controlled (valueEn/onChangeEn) for AI-populated fields,
  // uncontrolled (defaultValueEn) for static fields. Avoids React warnings
  // about switching between controlled/uncontrolled by spreading conditionally.
  const isControlledEn = valueEn !== undefined;
  const isControlledZh = valueZh !== undefined;

  // Track input length for uncontrolled mode (only meaningful when maxLength is set)
  const [uncontrolledEnLen, setUncontrolledEnLen] = useState(defaultValueEn.length);
  const [uncontrolledZhLen, setUncontrolledZhLen] = useState(defaultValueZh.length);

  const enLen = isControlledEn ? valueEn!.length : uncontrolledEnLen;
  const zhLen = isControlledZh ? valueZh!.length : uncontrolledZhLen;

  return (
    <fieldset style={{ marginBottom: '1rem', border: 'none', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <legend
          style={{
            color: NAVY,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {label}
        </legend>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label htmlFor={nameEn} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            <span role="img" aria-label="English">🇺🇸</span> EN
          </label>
          <input
            id={nameEn}
            name={nameEn}
            {...(isControlledEn
              ? { value: valueEn, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeEn?.(e.target.value) }
              : {
                  defaultValue: defaultValueEn,
                  ...(maxLength !== undefined
                    ? { onInput: (e: React.FormEvent<HTMLInputElement>) => setUncontrolledEnLen(e.currentTarget.value.length) }
                    : {}
                  ),
                }
            )}
            required={required}
            placeholder={placeholder}
            style={inputStyle}
          />
          {maxLength !== undefined && (
            <span style={{ fontSize: '0.6875rem', color: getCounterColor(enLen, maxLength), marginTop: '0.125rem', display: 'block', textAlign: 'right' }}>
              {enLen}/{maxLength}
            </span>
          )}
        </div>
        <div>
          <label htmlFor={nameZh} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            <span role="img" aria-label="Chinese">🇨🇳</span> ZH
          </label>
          <input
            id={nameZh}
            name={nameZh}
            {...(isControlledZh
              ? { value: valueZh, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeZh?.(e.target.value) }
              : {
                  defaultValue: defaultValueZh,
                  ...(maxLength !== undefined
                    ? { onInput: (e: React.FormEvent<HTMLInputElement>) => setUncontrolledZhLen(e.currentTarget.value.length) }
                    : {}
                  ),
                }
            )}
            required={required}
            placeholder={placeholder}
            style={inputStyle}
          />
          {maxLength !== undefined && (
            <span style={{ fontSize: '0.6875rem', color: getCounterColor(zhLen, maxLength), marginTop: '0.125rem', display: 'block', textAlign: 'right' }}>
              {zhLen}/{maxLength}
            </span>
          )}
        </div>
      </div>
    </fieldset>
  );
}
