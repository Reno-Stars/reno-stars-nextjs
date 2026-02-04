'use client';

import { logoutAction } from '@/app/actions/admin-auth';
import { CARD, NAVY, TEXT_MID, neu } from '@/lib/theme';

export default function TopBar() {
  return (
    <header
      style={{
        backgroundColor: CARD,
        boxShadow: neu(3),
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.875rem' }}>
        Reno Stars Admin
      </span>
      <form action={logoutAction}>
        <button
          type="submit"
          style={{
            background: 'none',
            border: 'none',
            color: TEXT_MID,
            cursor: 'pointer',
            fontSize: '0.8125rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
          }}
        >
          Logout
        </button>
      </form>
    </header>
  );
}
