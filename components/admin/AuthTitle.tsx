'use client';

import { NAVY } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

export default function AuthTitle() {
  const t = useAdminTranslations();

  return (
    <h1
      style={{
        color: NAVY,
        fontSize: '1.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '1.5rem',
      }}
    >
      {t.login.title}
    </h1>
  );
}
