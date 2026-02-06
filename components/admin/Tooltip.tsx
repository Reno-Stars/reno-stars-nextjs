'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [flipUp, setFlipUp] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const t = useAdminTranslations();

  const buttonSize = size === 'sm' ? '14px' : '16px';
  const fontSize = size === 'sm' ? '9px' : '10px';

  const handleShow = useCallback(() => {
    setShow(true);
    // Check on next frame if tooltip clips below viewport
    requestAnimationFrame(() => {
      const el = tipRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setFlipUp(rect.bottom > window.innerHeight - 8);
    });
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
    setFlipUp(false);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
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
          ref={tipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            ...(flipUp
              ? { bottom: '100%', marginBottom: '6px' }
              : { top: '100%', marginTop: '6px' }),
            left: '0',
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
