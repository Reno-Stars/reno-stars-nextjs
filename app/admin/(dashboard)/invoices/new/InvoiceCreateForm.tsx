'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { createInvoiceAction } from '@/app/actions/admin/invoices';
import { useToast } from '@/components/admin/ToastProvider';

interface Props {
  type: 'estimate' | 'invoice';
}

export default function InvoiceCreateForm({ type }: Props) {
  const t = useAdminTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createInvoiceAction(formData);
      if (result.error) {
        toast(result.error, 'error');
      } else if (result.id) {
        toast(t.invoices.created);
        router.push(`/admin/invoices/${result.id}`);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="type" value={type} />
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          boxShadow: neu(4),
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxWidth: '640px',
        }}
      >
        {/* Client Name */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.clientName} *</label>
          <input
            type="text"
            name="clientName"
            required
            style={inputStyle}
            placeholder="Client name"
          />
        </div>

        {/* Client Email */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.clientEmail}</label>
          <input
            type="email"
            name="clientEmail"
            style={inputStyle}
            placeholder="client@example.com"
          />
        </div>

        {/* Client Phone */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.clientPhone}</label>
          <input
            type="tel"
            name="clientPhone"
            style={inputStyle}
            placeholder="778-000-0000"
          />
        </div>

        {/* Client Address */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.clientAddress}</label>
          <textarea
            name="clientAddress"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="123 Main St, Vancouver, BC"
          />
        </div>

        {/* Language */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.language}</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: NAVY }}>
              <input type="radio" name="language" value="english" defaultChecked />
              {t.invoices.english}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: NAVY }}>
              <input type="radio" name="language" value="chinese" />
              {t.invoices.chinese}
            </label>
          </div>
        </div>

        {/* Tax Rate */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.taxRate}</label>
          <select name="taxRate" defaultValue="5" style={inputStyle}>
            <option value="5">5% (GST)</option>
            <option value="0">0%</option>
          </select>
        </div>

        {/* Payment Schedule */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.paymentSchedule}</label>
          <select name="paymentScheduleKey" defaultValue="100%" style={inputStyle}>
            <option value="100%">100% (single line — customise below)</option>
            <option value="70/30">70/30 (Deposit + Completion)</option>
            <option value="milestone-5">5 Milestones</option>
            <option value="milestone-large">6 Milestones (Large Project)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Invoice Date */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.invoiceDate}</label>
          <input
            type="date"
            name="invoiceDate"
            defaultValue={new Date().toISOString().split('T')[0]}
            style={inputStyle}
          />
        </div>

        {/* Due Date */}
        <div style={fieldGroup}>
          <label style={labelStyle}>{t.invoices.dueDate}</label>
          <input
            type="date"
            name="dueDate"
            style={inputStyle}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: GOLD,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: isPending ? 0.6 : 1,
            alignSelf: 'flex-start',
          }}
        >
          {isPending
            ? t.common.processing
            : type === 'invoice'
              ? t.invoices.createInvoice
              : t.invoices.createEstimate}
        </button>
      </div>
    </form>
  );
}

const fieldGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: TEXT_MID,
};

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(27,54,93,0.2)',
  fontSize: '0.875rem',
  color: NAVY,
  backgroundColor: '#fff',
};
