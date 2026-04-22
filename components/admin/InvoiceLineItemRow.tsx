'use client';

import { useState } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StepData {
  text: string;
  remarks: string[];
}

interface LineItem {
  id: string;
  label: string;
  description: string;
  steps?: StepData[] | null;
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

function StepRow({ step, stepNum }: { step: StepData; stepNum: number }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <span
          style={{
            minWidth: '1.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: NAVY,
            textAlign: 'right',
            paddingTop: '1px',
          }}
        >
          {stepNum}.
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#222', lineHeight: 1.5 }}>
          {step.text}
        </span>
      </div>
      {step.remarks.length > 0 && (
        <div style={{ paddingLeft: '2.25rem' }}>
          {step.remarks.map((remark, i) => (
            <div
              key={i}
              style={{
                fontSize: '0.75rem',
                color: TEXT_MID,
                lineHeight: 1.4,
                paddingLeft: '0.5rem',
                borderLeft: `2px solid ${GOLD}33`,
                marginBottom: '1px',
              }}
            >
              {remark}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvoiceLineItemRow({ item, index }: InvoiceLineItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSteps = item.steps && item.steps.length > 0;

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
        {hasSteps && (
          <span
            style={{
              padding: '0.125rem 0.375rem',
              borderRadius: '4px',
              backgroundColor: `${GOLD}15`,
              color: GOLD,
              fontSize: '0.625rem',
              fontWeight: 600,
            }}
          >
            {item.steps!.length} steps
          </span>
        )}
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
            padding: '0.5rem 0.75rem 0.75rem 2.5rem',
            borderTop: '1px solid rgba(27,54,93,0.08)',
          }}
        >
          {hasSteps ? (
            <div style={{ marginTop: '0.25rem' }}>
              {item.steps!.map((step, i) => (
                <StepRow key={i} step={step} stepNum={i + 1} />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
