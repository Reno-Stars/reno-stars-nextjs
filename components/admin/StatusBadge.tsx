'use client';

import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, GOLD, NAVY } from '@/lib/theme';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'New' },
  contacted: { bg: 'rgba(200, 146, 42, 0.12)', color: GOLD, label: 'Contacted' },
  converted: { bg: SUCCESS_BG, color: SUCCESS, label: 'Converted' },
  rejected: { bg: ERROR_BG, color: ERROR, label: 'Rejected' },
};

type ContactStatus = 'new' | 'contacted' | 'converted' | 'rejected';

interface StatusBadgeProps {
  status: ContactStatus | (string & {});
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: 'rgba(27,54,93,0.05)',
    color: NAVY,
    label: status,
  };

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
