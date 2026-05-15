'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useToast } from '@/components/admin/ToastProvider';
import InvoiceStatusBadge from '@/components/admin/InvoiceStatusBadge';
import InvoiceTypeBadge from '@/components/admin/InvoiceTypeBadge';
import InvoiceLineItemRow from '@/components/admin/InvoiceLineItemRow';
import PaymentMilestoneCard from '@/components/admin/PaymentMilestoneCard';
import { updateInvoiceAction, updateStatusAction, deleteInvoiceAction, addLineItemAction } from '@/app/actions/admin/invoices';
import { Plus } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface SerializedInvoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  language: string;
  taxRate: number;
  gstNumber: string;
  paymentScheduleKey: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  shareToken: string;
  invoiceDate: string;
  dueDate: string | null;
  approvedAt: string | null;
  viewedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    id: string;
    label: string;
    description: string;
    steps?: Array<{ text: string; remarks: string[] }> | null;
    footerLines?: string[] | null;
    amountCents: number;
    displayOrder: number;
    sectionType: string | null;
    createdAt: string;
  }>;
  paymentMilestones: Array<{
    id: string;
    label: string;
    labelZh: string | null;
    percentage: number;
    amountCents: number;
    isPaid: boolean;
    paidAt: string | null;
    paymentMethod: string | null;
    paymentReference: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  versions: Array<{
    id: string;
    version: number;
    changeType: string;
    changeSummary: string;
    changedBy: string;
    createdAt: string;
  }>;
}

interface Props {
  invoice: SerializedInvoice;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Next valid status transitions */
function getNextStatuses(current: string): string[] {
  const transitions: Record<string, string[]> = {
    draft: ['sent'],
    sent: ['viewed', 'approved'],
    viewed: ['approved'],
    approved: ['in_progress'],
    in_progress: ['completed'],
    completed: ['paid'],
    paid: [],
    void: [],
  };
  return transitions[current] ?? [];
}

function AddLineItemButton({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!label.trim()) return;
    startTransition(async () => {
      const result = await addLineItemAction(invoiceId, label.trim(), [{ text: '', remarks: [] }]);
      if (result.error) {
        alert(result.error);
      } else {
        setLabel('');
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
          border: `1px solid ${NAVY}22`, background: 'none', color: NAVY,
          cursor: 'pointer', fontWeight: 500,
        }}
      >
        <Plus size={14} /> Add Section
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Section name (e.g. Kitchen, Others)"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        autoFocus
        style={{ fontSize: '0.8125rem', padding: '4px 8px', border: `1px solid ${NAVY}33`, borderRadius: '4px', width: '220px', fontFamily: 'inherit' }}
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || !label.trim()}
        style={{
          padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem',
          border: 'none', backgroundColor: NAVY, color: '#fff',
          cursor: 'pointer', opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? '...' : 'Add'}
      </button>
      <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MID, fontSize: '0.75rem' }}>
        Cancel
      </button>
    </div>
  );
}

export default function InvoiceDetailClient({ invoice }: Props) {
  const t = useAdminTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const nextStatuses = getNextStatuses(invoice.status);

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      const result = await updateStatusAction(invoice.id, status);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.invoices.statusUpdated);
        router.refresh();
      }
    });
  };

  const handleVoid = () => {
    startTransition(async () => {
      const result = await deleteInvoiceAction(invoice.id);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.invoices.voided);
        router.refresh();
      }
      setShowVoidConfirm(false);
    });
  };

  const handleUpdateHeader = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateInvoiceAction(invoice.id, formData);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.invoices.updated);
        setShowEditHeader(false);
        router.refresh();
      }
    });
  };

  const handleCopyShareLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/en/invoice/${invoice.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast(t.invoices.shareLinkCopied);
    });
  };

  const paidTotal = invoice.paymentMilestones
    .filter((m) => m.isPaid)
    .reduce((sum, m) => sum + m.amountCents, 0);
  const paidPercent = invoice.totalCents > 0 ? Math.round((paidTotal / invoice.totalCents) * 100) : 0;

  return (
    <div>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontWeight: 700, color: NAVY, fontSize: '1.25rem' }}>
          {invoice.invoiceNumber}
        </span>
        <InvoiceTypeBadge type={invoice.type} />
        <InvoiceStatusBadge status={invoice.status} />

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <button type="button" onClick={() => setShowEditHeader(!showEditHeader)} style={actionBtnStyle}>
          {t.invoices.editHeader}
        </button>

        {nextStatuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleStatusChange(s)}
            disabled={isPending}
            style={{ ...actionBtnStyle, backgroundColor: GOLD, color: '#fff' }}
          >
            {(t.invoices as Record<string, string>)[`status${s.charAt(0).toUpperCase() + s.slice(1).replace(/_(\w)/g, (_, c: string) => c.toUpperCase())}`] ?? s}
          </button>
        ))}

        <button type="button" onClick={() => setShowPdfPreview(!showPdfPreview)} style={actionBtnStyle}>
          {showPdfPreview ? 'Close Preview' : 'Preview PDF'}
        </button>

        <a
          href={`/admin/api/invoices/${invoice.id}/pdf/?download=true`}
          target="_blank"
          rel="noopener noreferrer"
          style={actionBtnStyle as React.CSSProperties}
        >
          Export PDF
        </a>

        <button type="button" onClick={handleCopyShareLink} style={actionBtnStyle}>
          {t.invoices.copyShareLink}
        </button>

        {invoice.status !== 'void' && (
          <button
            type="button"
            onClick={() => setShowVoidConfirm(true)}
            style={{ ...actionBtnStyle, color: '#dc2626', borderColor: '#dc2626' }}
          >
            {t.invoices.statusVoid}
          </button>
        )}
      </div>

      {/* PDF Preview */}
      {showPdfPreview && (
        <div style={{ ...cardStyle, marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: `1px solid ${NAVY}15` }}>
            <span style={{ fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>PDF Preview</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={`/admin/api/invoices/${invoice.id}/pdf/?download=true`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: GOLD, fontWeight: 600, textDecoration: 'none' }}
              >
                Download
              </a>
              <button type="button" onClick={() => setShowPdfPreview(false)} style={{ fontSize: '0.75rem', color: TEXT_MID, background: 'none', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
          <iframe
            src={`/admin/api/invoices/${invoice.id}/pdf/`}
            title="Invoice PDF Preview"
            style={{ width: '100%', height: '80vh', border: 'none' }}
          />
        </div>
      )}

      {/* Edit header form */}
      {showEditHeader && (
        <div style={{ ...cardStyle, marginBottom: '1.5rem', maxWidth: '640px' }}>
          <form action={handleUpdateHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.clientName} *</label>
              <input type="text" name="clientName" defaultValue={invoice.clientName} required style={inputStyle} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.clientEmail}</label>
              <input type="email" name="clientEmail" defaultValue={invoice.clientEmail ?? ''} style={inputStyle} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.clientPhone}</label>
              <input type="tel" name="clientPhone" defaultValue={invoice.clientPhone ?? ''} style={inputStyle} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.clientAddress}</label>
              <textarea name="clientAddress" rows={2} defaultValue={invoice.clientAddress ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.language}</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: NAVY }}>
                  <input type="radio" name="language" value="english" defaultChecked={invoice.language === 'english'} />
                  {t.invoices.english}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: NAVY }}>
                  <input type="radio" name="language" value="chinese" defaultChecked={invoice.language === 'chinese'} />
                  {t.invoices.chinese}
                </label>
              </div>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.taxRate}</label>
              <select name="taxRate" defaultValue={String(invoice.taxRate)} style={inputStyle}>
                <option value="5">5% (GST)</option>
                <option value="0">0%</option>
              </select>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.dueDate}</label>
              <input type="date" name="dueDate" defaultValue={invoice.dueDate?.split('T')[0] ?? ''} style={inputStyle} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{t.invoices.notes}</label>
              <textarea name="notes" rows={3} defaultValue={invoice.notes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={isPending} style={{ ...actionBtnStyle, backgroundColor: GOLD, color: '#fff' }}>
                {isPending ? t.common.saving : t.common.save}
              </button>
              <button type="button" onClick={() => setShowEditHeader(false)} style={actionBtnStyle}>
                {t.common.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          {/* Client info card */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>{t.invoices.clientInfo}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={metaLabel}>{t.invoices.clientName}</div>
                <div style={metaValue}>{invoice.clientName}</div>
              </div>
              <div>
                <div style={metaLabel}>{t.invoices.clientEmail}</div>
                <div style={metaValue}>{invoice.clientEmail || '—'}</div>
              </div>
              <div>
                <div style={metaLabel}>{t.invoices.clientPhone}</div>
                <div style={metaValue}>{invoice.clientPhone || '—'}</div>
              </div>
              <div>
                <div style={metaLabel}>{t.invoices.invoiceDate}</div>
                <div style={metaValue}>{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
              </div>
            </div>
            {invoice.clientAddress && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={metaLabel}>{t.invoices.clientAddress}</div>
                <div style={metaValue}>{invoice.clientAddress}</div>
              </div>
            )}
          </div>

          {/* Line items */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ ...sectionHeading, marginBottom: 0 }}>{t.invoices.lineItems}</h2>
              <AddLineItemButton invoiceId={invoice.id} />
            </div>
            {invoice.lineItems.length === 0 ? (
              <p style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.invoices.noLineItems}</p>
            ) : (
              invoice.lineItems.map((item, idx) => (
                <InvoiceLineItemRow key={item.id} item={item} invoiceId={invoice.id} index={idx} />
              ))
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={cardStyle}>
              <h2 style={sectionHeading}>{t.invoices.notes}</h2>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem', color: NAVY, fontFamily: 'inherit', margin: 0 }}>
                {invoice.notes}
              </pre>
            </div>
          )}

          {/* Terms (collapsible) */}
          <div style={cardStyle}>
            <button
              type="button"
              onClick={() => setShowTerms(!showTerms)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: '100%',
              }}
            >
              <h2 style={{ ...sectionHeading, marginBottom: 0 }}>{t.invoices.terms}</h2>
              <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
                {showTerms ? '▲' : '▼'}
              </span>
            </button>
            {showTerms && (
              <p style={{ color: TEXT_MID, fontSize: '0.8125rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                Standard renovation terms and conditions apply. See the full invoice document for all 37 clauses covering scope, payment, warranty, and liability.
              </p>
            )}
          </div>
        </div>

        {/* Right column (sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Totals */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>{t.invoices.total}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.invoices.subtotal}</span>
                <span style={{ color: NAVY, fontSize: '0.875rem' }}>{formatCents(invoice.subtotalCents)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.invoices.gst} ({invoice.taxRate}%)</span>
                <span style={{ color: NAVY, fontSize: '0.875rem' }}>{formatCents(invoice.taxCents)}</span>
              </div>
              <div style={{ borderTop: `2px solid rgba(27,54,93,0.1)`, paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: NAVY, fontSize: '1rem', fontWeight: 700 }}>{t.invoices.total}</span>
                <span style={{ color: NAVY, fontSize: '1rem', fontWeight: 700 }}>{formatCents(invoice.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Payment schedule */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>{t.invoices.paymentMilestones}</h2>

            {/* Progress bar */}
            {invoice.totalCents > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
                    {t.invoices.progressPaid.replace('{percent}', String(paidPercent))}
                  </span>
                  <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
                    {formatCents(paidTotal)} / {formatCents(invoice.totalCents)}
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(27,54,93,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${paidPercent}%`,
                      backgroundColor: '#059669',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {invoice.paymentMilestones.length === 0 ? (
              <p style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.invoices.noMilestones}</p>
            ) : (
              invoice.paymentMilestones.map((m) => (
                <PaymentMilestoneCard key={m.id} milestone={m} />
              ))
            )}
          </div>

          {/* Version history (collapsible) */}
          <div style={cardStyle}>
            <button
              type="button"
              onClick={() => setShowVersions(!showVersions)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: '100%',
              }}
            >
              <h2 style={{ ...sectionHeading, marginBottom: 0 }}>{t.invoices.versionHistory}</h2>
              <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
                ({invoice.versions.length}) {showVersions ? '▲' : '▼'}
              </span>
            </button>
            {showVersions && (
              <div style={{ marginTop: '0.75rem' }}>
                {invoice.versions.length === 0 ? (
                  <p style={{ color: TEXT_MID, fontSize: '0.875rem' }}>{t.invoices.noVersions}</p>
                ) : (
                  invoice.versions.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: '0.5rem 0',
                        borderBottom: '1px solid rgba(27,54,93,0.06)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: NAVY }}>v{v.version}</span>
                        <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: TEXT_MID, marginTop: '0.125rem' }}>
                        {v.changeSummary}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showVoidConfirm}
        title={t.invoices.statusVoid}
        message={t.invoices.confirmVoid}
        onConfirm={handleVoid}
        onCancel={() => setShowVoidConfirm(false)}
        loading={isPending}
      />
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: CARD,
  borderRadius: '12px',
  boxShadow: neu(4),
  padding: '1.25rem',
};

const sectionHeading: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: NAVY,
  marginBottom: '0.75rem',
  marginTop: 0,
};

const metaLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: TEXT_MID,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const metaValue: React.CSSProperties = {
  fontSize: '0.875rem',
  color: NAVY,
  marginTop: '0.125rem',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid rgba(27,54,93,0.2)',
  backgroundColor: 'transparent',
  color: NAVY,
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

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
