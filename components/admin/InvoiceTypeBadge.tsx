'use client';

import { useAdminTranslations } from '@/lib/admin/translations';

interface InvoiceTypeBadgeProps {
  type: string;
}

const typeStyle: Record<string, { bg: string; color: string }> = {
  estimate: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  invoice: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
};

export default function InvoiceTypeBadge({ type }: InvoiceTypeBadgeProps) {
  const t = useAdminTranslations();
  const style = typeStyle[type] ?? typeStyle.estimate;
  const label = type === 'invoice' ? t.invoices.invoice : t.invoices.estimate;

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
