'use client';

import { useActionState } from 'react';
import { loginAction, type AuthResult } from '@/app/actions/admin-auth';
import { CARD, NAVY, GOLD, GOLD_HOVER, ERROR, ERROR_BG, neu, neuIn } from '@/lib/theme';

const initialState: AuthResult = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: neu(8),
        }}
      >
        {state.error && (
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
            {state.error}
          </div>
        )}
        <label
          htmlFor="password"
          style={{
            display: 'block',
            color: NAVY,
            fontWeight: 600,
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: 'none',
            boxShadow: neuIn(4),
            backgroundColor: CARD,
            color: NAVY,
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isPending ? GOLD_HOVER : GOLD,
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
