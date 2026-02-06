'use client';

import { useState } from 'react';
import { NAVY, TEXT_MID, CARD } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface TooltipProps {
  content: string;
  /** Size variant - 'sm' for checkbox tooltips, 'md' for form fields */
  size?: 'sm' | 'md';
}

/**
 * Reusable tooltip component for admin forms.
 * Shows a help icon that displays tooltip content on hover/focus.
 */
export default function Tooltip({ content, size = 'md' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const t = useAdminTranslations();

  const buttonSize = size === 'sm' ? '14px' : '16px';
  const fontSize = size === 'sm' ? '9px' : '10px';

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: `1px solid ${TEXT_MID}`,
          backgroundColor: 'transparent',
          color: TEXT_MID,
          fontSize,
          fontWeight: 600,
          cursor: 'help',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
        aria-label={t.common.help}
      >
        ?
      </button>
      {show && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '6px',
            padding: '0.5rem 0.75rem',
            backgroundColor: NAVY,
            color: CARD,
            fontSize: '0.75rem',
            lineHeight: 1.4,
            borderRadius: '6px',
            whiteSpace: 'pre-wrap',
            width: '220px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
