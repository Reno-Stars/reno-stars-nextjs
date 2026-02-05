'use client';

import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, INFO, INFO_BG, GOLD } from '@/lib/theme';
import type { ContactStatus } from '@/lib/admin/form-utils';

const statusConfig: Record<ContactStatus, { bg: string; color: string; label: string }> = {
  new: { bg: INFO_BG, color: INFO, label: 'New' },
  contacted: { bg: 'rgba(200, 146, 42, 0.12)', color: GOLD, label: 'Contacted' },
  converted: { bg: SUCCESS_BG, color: SUCCESS, label: 'Converted' },
  rejected: { bg: ERROR_BG, color: ERROR, label: 'Rejected' },
};

interface StatusBadgeProps {
  status: ContactStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
