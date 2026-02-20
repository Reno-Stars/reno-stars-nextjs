'use client';

import { NAVY, SURFACE } from '@/lib/theme';
import { inputStyle } from './shared-styles';
import Tooltip from './Tooltip';

interface BilingualTextareaProps {
  nameEn: string;
  nameZh: string;
  label: string;
  defaultValueEn?: string;
  defaultValueZh?: string;
  /** Controlled value for EN field */
  valueEn?: string;
  /** Change handler for controlled EN field */
  onChangeEn?: (value: string) => void;
  /** Controlled value for ZH field */
  valueZh?: string;
  /** Change handler for controlled ZH field */
  onChangeZh?: (value: string) => void;
  required?: boolean;
  rows?: number;
  tooltip?: string;
  disabled?: boolean;
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
};

export default function BilingualTextarea({
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
  rows = 4,
  tooltip,
  disabled = false,
}: BilingualTextareaProps) {
  const isControlledEn = valueEn !== undefined;
  const isControlledZh = valueZh !== undefined;

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
          <textarea
            id={nameEn}
            name={nameEn}
            {...(isControlledEn
              ? { value: valueEn, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChangeEn?.(e.target.value) }
              : { defaultValue: defaultValueEn }
            )}
            required={required}
            rows={rows}
            style={{ ...textareaStyle, background: SURFACE, opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor={nameZh} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            <span role="img" aria-label="Chinese">🇨🇳</span> ZH
          </label>
          <textarea
            id={nameZh}
            name={nameZh}
            {...(isControlledZh
              ? { value: valueZh, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChangeZh?.(e.target.value) }
              : { defaultValue: defaultValueZh }
            )}
            required={required}
            rows={rows}
            style={{ ...textareaStyle, background: SURFACE, opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  );
}
