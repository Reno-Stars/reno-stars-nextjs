'use client';

import { useState } from 'react';
import { CARD, NAVY, TEXT_MID, neu } from '@/lib/theme';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LineItem {
  id: string;
  label: string;
  description: string;
  amountCents: number;
  displayOrder: number;
  sectionType: string | null;
}

interface InvoiceLineItemRowProps {
  item: LineItem;
  index: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceLineItemRow({ item, index }: InvoiceLineItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: CARD,
        borderRadius: '8px',
        boxShadow: neu(3),
        marginBottom: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: TEXT_MID, fontSize: '0.75rem', minWidth: '1.5rem' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ color: TEXT_MID, fontSize: '0.75rem', minWidth: '1.5rem' }}>
          {index + 1}
        </span>
        <span style={{ flex: 1, fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>
          {item.label}
        </span>
        {item.sectionType && (
          <span
            style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(27,54,93,0.06)',
              color: TEXT_MID,
              fontSize: '0.6875rem',
            }}
          >
            {item.sectionType}
          </span>
        )}
        <span style={{ fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>
          {formatCents(item.amountCents)}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 0.75rem 0.75rem 3.75rem',
            borderTop: '1px solid rgba(27,54,93,0.08)',
          }}
        >
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.8125rem',
              color: TEXT_MID,
              lineHeight: 1.5,
              margin: '0.5rem 0 0',
              fontFamily: 'inherit',
            }}
          >
            {item.description}
          </pre>
        </div>
      )}
    </div>
  );
}
