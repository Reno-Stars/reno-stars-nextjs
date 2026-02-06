'use client';

import { NAVY, ERROR, TEXT_MID } from '@/lib/theme';
import Tooltip from './Tooltip';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, hint, tooltip, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <label
          htmlFor={htmlFor}
          style={{
            color: NAVY,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {label}
        </label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      {children}
      {hint && !error && (
        <div style={{ color: TEXT_MID, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {hint}
        </div>
      )}
      {error && (
        <div role="alert" style={{ color: ERROR, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
