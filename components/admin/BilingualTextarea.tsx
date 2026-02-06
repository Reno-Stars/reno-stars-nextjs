'use client';

import { useState } from 'react';
import { NAVY, TEXT_MID, CARD } from '@/lib/theme';
import { inputStyle } from './shared-styles';

interface BilingualTextareaProps {
  nameEn: string;
  nameZh: string;
  label: string;
  defaultValueEn?: string;
  defaultValueZh?: string;
  required?: boolean;
  rows?: number;
  tooltip?: string;
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
  required = false,
  rows = 4,
  tooltip,
}: BilingualTextareaProps) {
  const [showTooltip, setShowTooltip] = useState(false);

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
        {tooltip && (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: `1px solid ${TEXT_MID}`,
                backgroundColor: 'transparent',
                color: TEXT_MID,
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'help',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              aria-label="Help"
            >
              ?
            </button>
            {showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  marginTop: '6px',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: NAVY,
                  color: CARD,
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  width: '220px',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label htmlFor={nameEn} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            EN
          </label>
          <textarea
            id={nameEn}
            name={nameEn}
            defaultValue={defaultValueEn}
            required={required}
            rows={rows}
            style={textareaStyle}
          />
        </div>
        <div>
          <label htmlFor={nameZh} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            ZH
          </label>
          <textarea
            id={nameZh}
            name={nameZh}
            defaultValue={defaultValueZh}
            required={required}
            rows={rows}
            style={textareaStyle}
          />
        </div>
      </div>
    </fieldset>
  );
}
