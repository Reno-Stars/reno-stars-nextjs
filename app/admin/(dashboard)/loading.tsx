'use client';

import { GOLD, TEXT_MID } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

export default function AdminLoading() {
  const t = useAdminTranslations();

  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: `3px solid ${GOLD}20`,
          borderTopColor: GOLD,
          borderRadius: '50%',
          animation: 'admin-spin 0.8s linear infinite',
        }}
      />
      <span style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.common.loading}</span>
    </div>
  );
}
