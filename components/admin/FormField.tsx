'use client';

import { NAVY, ERROR, TEXT_MID } from '@/lib/theme';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          color: NAVY,
          fontWeight: 600,
          fontSize: '0.8125rem',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </label>
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
