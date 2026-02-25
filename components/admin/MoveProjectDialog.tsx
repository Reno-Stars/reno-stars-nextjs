'use client';

import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import SearchableSelect, { type SearchableSelectOption } from './SearchableSelect';

interface MoveProjectDialogProps {
  open: boolean;
  siteOptions: SearchableSelectOption[];
  onConfirm: (targetSiteId: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function MoveProjectDialog({
  open,
  siteOptions,
  onConfirm,
  onCancel,
  loading = false,
}: MoveProjectDialogProps) {
  const t = useAdminTranslations();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  const [selectedSiteId, setSelectedSiteId] = useState('');

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) setSelectedSiteId('');
  }, [open]);

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

  // Focus trap
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

  const hasOptions = siteOptions.length > 0;

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
          {t.sites.moveProjectTitle}
        </h3>
        <p
          id={descId}
          style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1rem' }}
        >
          {t.sites.moveProjectMessage}
        </p>

        {hasOptions ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchableSelect
              name="targetSiteId"
              options={siteOptions}
              value={selectedSiteId}
              onChange={setSelectedSiteId}
              placeholder={t.sites.selectDestinationSite}
            />
          </div>
        ) : (
          <p style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            {t.sites.noOtherSites}
          </p>
        )}

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
            onClick={() => selectedSiteId && onConfirm(selectedSiteId)}
            disabled={!selectedSiteId || loading || !hasOptions}
            className="confirm-dialog-btn"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: GOLD,
              color: '#fff',
              cursor: !selectedSiteId || loading || !hasOptions ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: !selectedSiteId || loading || !hasOptions ? 0.5 : 1,
            }}
          >
            {loading ? t.common.processing : t.sites.moveProjectConfirm}
          </button>
        </div>
      </div>
    </dialog>
  );
}
