'use client';

import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, INFO, INFO_BG, GOLD } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { ContactStatus } from '@/lib/admin/form-utils';

const statusStyle: Record<ContactStatus, { bg: string; color: string }> = {
  new: { bg: INFO_BG, color: INFO },
  contacted: { bg: 'rgba(200, 146, 42, 0.12)', color: GOLD },
  converted: { bg: SUCCESS_BG, color: SUCCESS },
  rejected: { bg: ERROR_BG, color: ERROR },
};

interface StatusBadgeProps {
  status: ContactStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const t = useAdminTranslations();
  const style = statusStyle[status];
  const label = t.status[status];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {label}
    </span>
  );
}
