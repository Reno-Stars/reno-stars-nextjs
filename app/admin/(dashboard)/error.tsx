'use client';

import { CARD, NAVY, ERROR, ERROR_BG, GOLD, neu } from '@/lib/theme';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
        }}
      >
        <h1 style={{ color: NAVY, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Something went wrong
        </h1>
        <div
          role="alert"
          style={{
            backgroundColor: ERROR_BG,
            color: ERROR,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error.message || 'An unexpected error occurred.'}
        </div>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: GOLD,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
