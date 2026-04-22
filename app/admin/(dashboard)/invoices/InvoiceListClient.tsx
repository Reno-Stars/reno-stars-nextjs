'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE_ALT, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import InvoiceStatusBadge from '@/components/admin/InvoiceStatusBadge';
import InvoiceTypeBadge from '@/components/admin/InvoiceTypeBadge';

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  clientName: string;
  totalCents: number;
  createdAt: Date | string;
}

interface Props {
  invoices: InvoiceRow[];
  total: number;
  page: number;
  totalPages: number;
  currentStatus: string;
  currentType: string;
  currentQuery: string;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceListClient({
  invoices,
  total,
  page,
  totalPages,
  currentStatus,
  currentType,
  currentQuery,
}: Props) {
  const router = useRouter();
  const t = useAdminTranslations();
  const [search, setSearch] = useState(currentQuery);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const status = overrides.status ?? currentStatus;
      const type = overrides.type ?? currentType;
      const q = overrides.q ?? search;
      const p = overrides.page ?? String(page);

      if (status && status !== 'all') params.set('status', status);
      if (type && type !== 'all') params.set('type', type);
      if (q) params.set('q', q);
      if (p && p !== '1') params.set('page', p);

      const qs = params.toString();
      return `/admin/invoices${qs ? `?${qs}` : ''}`;
    },
    [currentStatus, currentType, search, page]
  );

  const handleSearch = () => {
    router.push(buildUrl({ q: search, page: '1' }));
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.625rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderBottom: active ? `3px solid ${GOLD}` : '3px solid transparent',
    backgroundColor: 'transparent',
    color: active ? NAVY : TEXT_MID,
    transition: 'all 0.15s',
  });

  return (
    <div>
      {/* Type tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid rgba(27,54,93,0.1)`,
        marginBottom: '1rem',
      }}>
        <button
          type="button"
          onClick={() => router.push(buildUrl({ type: 'estimate', page: '1' }))}
          style={tabStyle(currentType === 'estimate')}
        >
          {t.invoices.estimate}s
        </button>
        <button
          type="button"
          onClick={() => router.push(buildUrl({ type: 'invoice', page: '1' }))}
          style={tabStyle(currentType === 'invoice')}
        >
          {t.invoices.invoice}s
        </button>
        <button
          type="button"
          onClick={() => router.push(buildUrl({ type: 'all', page: '1' }))}
          style={tabStyle(currentType === 'all')}
        >
          All
        </button>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <select
          value={currentStatus}
          onChange={(e) => router.push(buildUrl({ status: e.target.value, page: '1' }))}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(27,54,93,0.2)',
            fontSize: '0.875rem',
            color: NAVY,
            backgroundColor: '#fff',
          }}
        >
          <option value="all">{t.invoices.allStatuses}</option>
          <option value="draft">{t.invoices.statusDraft}</option>
          <option value="sent">{t.invoices.statusSent}</option>
          <option value="viewed">{t.invoices.statusViewed}</option>
          <option value="approved">{t.invoices.statusApproved}</option>
          <option value="in_progress">{t.invoices.statusInProgress}</option>
          <option value="completed">{t.invoices.statusCompleted}</option>
          <option value="paid">{t.invoices.statusPaid}</option>
          <option value="void">{t.invoices.statusVoid}</option>
        </select>

        <div style={{ display: 'flex', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={t.common.search}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '8px 0 0 8px',
              border: '1px solid rgba(27,54,93,0.2)',
              borderRight: 'none',
              fontSize: '0.875rem',
              color: NAVY,
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0 8px 8px 0',
              border: '1px solid rgba(27,54,93,0.2)',
              backgroundColor: NAVY,
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.common.search}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.8125rem', color: TEXT_MID, marginBottom: '0.75rem' }}>
        {total} {total === 1 ? t.common.record : t.common.records}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: CARD, borderRadius: '12px', boxShadow: neu(4), overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${SURFACE_ALT}` }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>{t.invoices.clientName}</th>
              <th style={thStyle}>{t.invoices.status}</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>{t.invoices.total}</th>
              <th style={thStyle}>{t.invoices.date}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: TEXT_MID, fontSize: '0.875rem' }}>
                  {t.common.noRecords}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                  style={{ borderBottom: `1px solid ${SURFACE_ALT}`, cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,146,42,0.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: NAVY }}>{inv.invoiceNumber}</span>
                  </td>
                  <td style={tdStyle}>{inv.clientName}</td>
                  <td style={tdStyle}><InvoiceStatusBadge status={inv.status} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCents(inv.totalCents)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <Link
            href={buildUrl({ page: String(Math.max(1, page - 1)) })}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(27,54,93,0.2)',
              color: page <= 1 ? TEXT_MID : NAVY,
              textDecoration: 'none',
              fontSize: '0.875rem',
              pointerEvents: page <= 1 ? 'none' : 'auto',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            {t.common.prev}
          </Link>
          <span style={{ fontSize: '0.875rem', color: TEXT_MID }}>
            {page} / {totalPages}
          </span>
          <Link
            href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(27,54,93,0.2)',
              color: page >= totalPages ? TEXT_MID : NAVY,
              textDecoration: 'none',
              fontSize: '0.875rem',
              pointerEvents: page >= totalPages ? 'none' : 'auto',
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            {t.common.next}
          </Link>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: TEXT_MID,
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontSize: '0.875rem',
  color: NAVY,
};
