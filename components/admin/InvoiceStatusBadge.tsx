'use client';

import { useAdminTranslations } from '@/lib/admin/translations';

type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'void';

const statusStyle: Record<InvoiceStatus, { bg: string; color: string }> = {
  draft: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  sent: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  viewed: { bg: 'rgba(234,179,8,0.12)', color: '#ca8a04' },
  approved: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  in_progress: { bg: 'rgba(249,115,22,0.12)', color: '#ea580c' },
  completed: { bg: 'rgba(147,51,234,0.12)', color: '#9333ea' },
  paid: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  void: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
};

const statusLabelKey: Record<InvoiceStatus, string> = {
  draft: 'statusDraft',
  sent: 'statusSent',
  viewed: 'statusViewed',
  approved: 'statusApproved',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
  paid: 'statusPaid',
  void: 'statusVoid',
};

interface InvoiceStatusBadgeProps {
  status: string;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const t = useAdminTranslations();
  const s = status as InvoiceStatus;
  const style = statusStyle[s] ?? statusStyle.draft;
  const key = statusLabelKey[s] ?? 'statusDraft';
  const label = (t.invoices as Record<string, string>)[key] ?? status;

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
