'use client';

import { useEffect, useCallback, useRef, useId } from 'react';
import { CARD, NAVY, TEXT_MID, ERROR, neu } from '@/lib/theme';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  loading = false,
}: ConfirmDialogProps) {
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
        <p id={descId} style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={handleCancel}
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
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: ERROR,
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
