'use client';

import { useTranslations } from 'next-intl';
import { CARD, NAVY, GOLD, ERROR, ERROR_BG, SURFACE, neu } from '@/lib/theme';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('common');

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: SURFACE,
      }}
    >
      <div
        style={{
          backgroundColor: CARD,
          boxShadow: neu(8),
          borderRadius: '1rem',
          padding: '3rem 2rem',
          maxWidth: '28rem',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          role="alert"
          style={{
            backgroundColor: ERROR_BG,
            color: ERROR,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
          }}
        >
          {t('error')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: GOLD,
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('tryAgain')}
          </button>

          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Error boundary: router may be broken */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              color: NAVY,
              border: `2px solid ${NAVY}`,
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {t('backToHome')}
          </a>
        </div>
      </div>
    </div>
  );
}
