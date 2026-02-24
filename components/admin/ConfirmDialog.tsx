'use client';

import { useEffect, useCallback, useRef, useId } from 'react';
import { CARD, NAVY, TEXT_MID, ERROR, GOLD, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  items?: string[];
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  items,
  variant = 'danger',
  onConfirm,
  onCancel,
  confirmLabel,
  loading = false,
}: ConfirmDialogProps) {
  const t = useAdminTranslations();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = (e: Event) => {
      e.preventDefault();
      handleCancel();
    };
    dialog.addEventListener('cancel', handler);
    return () => dialog.removeEventListener('cancel', handler);
  }, [handleCancel]);

  // Focus trap: keep Tab/Shift+Tab within the dialog
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      style={{
        border: 'none',
        borderRadius: '12px',
        padding: 0,
        maxWidth: '400px',
        width: '90%',
        boxShadow: neu(10),
        backgroundColor: CARD,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0,
      }}
      onClose={handleCancel}
    >
      <div style={{ padding: '1.5rem' }}>
        <h3
          id={titleId}
          style={{ color: NAVY, fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}
        >
          {title}
        </h3>
        <div id={descId}>
          <p style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: items?.length ? '0.75rem' : '1.5rem' }}>
            {message}
          </p>
          {items && items.length > 0 && (
            <ul style={{ color: TEXT_MID, fontSize: '0.8125rem', marginBottom: '1.5rem', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={handleCancel}
            className="confirm-dialog-btn"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: TEXT_MID,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="confirm-dialog-btn"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: variant === 'warning' ? GOLD : ERROR,
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t.common.processing : (confirmLabel ?? t.common.delete)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
