'use client';

import { logoutAction } from '@/app/actions/admin-auth';
import { CARD, NAVY, TEXT_MID, GOLD, neu } from '@/lib/theme';
import { useAdminLocale } from './AdminLocaleProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { localeNames, type Locale } from '@/i18n/config';

export default function TopBar() {
  const { locale, setLocale, setSidebarOpen } = useAdminLocale();
  const t = useAdminTranslations();

  return (
    <header
      className="admin-topbar"
      style={{
        backgroundColor: CARD,
        boxShadow: neu(3),
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="admin-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label={t.topBar.openMenu}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: NAVY,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.875rem' }}>
          {t.topBar.title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['en', 'zh'] as Locale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              style={{
                background: locale === loc ? GOLD : 'transparent',
                border: 'none',
                color: locale === loc ? '#fff' : TEXT_MID,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: locale === loc ? 600 : 400,
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
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
            {t.topBar.logout}
          </button>
        </form>
      </div>
    </header>
  );
}
