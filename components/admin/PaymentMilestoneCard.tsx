'use client';

import { useState, useTransition } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { recordPaymentAction } from '@/app/actions/admin/invoices';
import { useToast } from '@/components/admin/ToastProvider';

interface Milestone {
  id: string;
  label: string;
  labelZh: string | null;
  percentage: number;
  amountCents: number;
  isPaid: boolean;
  paidAt: Date | string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
}

interface PaymentMilestoneCardProps {
  milestone: Milestone;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentMilestoneCard({ milestone }: PaymentMilestoneCardProps) {
  const t = useAdminTranslations();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRecordPayment = (formData: FormData) => {
    startTransition(async () => {
      const result = await recordPaymentAction(milestone.id, formData);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.invoices.paymentRecorded);
        setShowForm(false);
      }
    });
  };

  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: CARD,
        borderRadius: '8px',
        boxShadow: neu(3),
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>
            {milestone.label}
          </span>
          <span style={{ color: TEXT_MID, fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
            ({milestone.percentage}%)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>
            {formatCents(milestone.amountCents)}
          </span>
          <span
            style={{
              display: 'inline-block',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: milestone.isPaid ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
              color: milestone.isPaid ? '#059669' : '#6b7280',
            }}
          >
            {milestone.isPaid ? t.invoices.paid : t.invoices.unpaid}
          </span>
        </div>
      </div>

      {milestone.isPaid && milestone.paidAt && (
        <div style={{ fontSize: '0.75rem', color: TEXT_MID, marginTop: '0.25rem' }}>
          {new Date(milestone.paidAt).toLocaleDateString()}
          {milestone.paymentMethod && ` — ${milestone.paymentMethod.replace('_', ' ')}`}
          {milestone.paymentReference && ` (${milestone.paymentReference})`}
        </div>
      )}

      {!milestone.isPaid && (
        <>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                marginTop: '0.5rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: GOLD,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.invoices.recordPayment}
            </button>
          ) : (
            <form action={handleRecordPayment} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="date"
                  name="paidAt"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(27,54,93,0.2)',
                    fontSize: '0.8125rem',
                    color: NAVY,
                  }}
                />
                <select
                  name="paymentMethod"
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(27,54,93,0.2)',
                    fontSize: '0.8125rem',
                    color: NAVY,
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="e_transfer">{t.invoices.eTransfer}</option>
                  <option value="cheque">{t.invoices.cheque}</option>
                  <option value="cash">{t.invoices.cash}</option>
                  <option value="wire">{t.invoices.wire}</option>
                  <option value="credit_card">{t.invoices.creditCard}</option>
                </select>
              </div>
              <input
                type="text"
                name="paymentReference"
                placeholder={t.invoices.paymentReference}
                style={{
                  padding: '0.375rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(27,54,93,0.2)',
                  fontSize: '0.8125rem',
                  color: NAVY,
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: GOLD,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? t.common.processing : t.invoices.recordPayment}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    color: TEXT_MID,
                    border: '1px solid rgba(27,54,93,0.2)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
