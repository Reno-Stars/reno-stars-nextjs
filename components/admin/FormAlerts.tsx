'use client';

import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface FormAlertsProps {
  state: { success?: boolean; error?: string };
  successMessage?: string;
}

export default function FormAlerts({ state, successMessage }: FormAlertsProps) {
  const t = useAdminTranslations();
  const msg = successMessage ?? t.common.savedSuccessfully;
  return (
    <>
      {state.error && (
        <div role="alert" style={{ backgroundColor: ERROR_BG, color: ERROR, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {state.error}
        </div>
      )}
      {state.success && (
        <div role="alert" style={{ backgroundColor: SUCCESS_BG, color: SUCCESS, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {msg}
        </div>
      )}
    </>
  );
}
