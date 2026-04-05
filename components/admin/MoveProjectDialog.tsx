'use client';

import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, neu, neuIn } from '@/lib/theme';
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
        borderRadius: '14px',
        padding: 0,
        maxWidth: '420px',
        width: '90%',
        boxShadow: neu(12),
        backgroundColor: CARD,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0,
        overflow: 'visible',
      }}
      onClose={handleCancel}
      data-move-dialog=""
    >
      {/* Header accent bar */}
      <div
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${GOLD}, ${NAVY})`,
          borderRadius: '14px 14px 0 0',
        }}
      />

      <div style={{ padding: '1.75rem' }}>
        {/* Title with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: SURFACE,
              boxShadow: neuIn(3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </div>
          <h3
            id={titleId}
            style={{ color: NAVY, fontSize: '1.125rem', fontWeight: 700, margin: 0 }}
          >
            {t.sites.moveProjectTitle}
          </h3>
        </div>

        <p
          id={descId}
          style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}
        >
          {t.sites.moveProjectMessage}
        </p>

        {hasOptions ? (
          <div
            style={{
              marginBottom: '1.75rem',
              padding: '0.75rem',
              backgroundColor: SURFACE,
              borderRadius: '10px',
              boxShadow: neuIn(3),
            }}
          >
            <SearchableSelect
              name="targetSiteId"
              options={siteOptions}
              value={selectedSiteId}
              onChange={setSelectedSiteId}
              placeholder={t.sites.selectDestinationSite}
            />
          </div>
        ) : (
          <p style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1.75rem', fontStyle: 'italic' }}>
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
              padding: '0.5rem 1.125rem',
              borderRadius: '8px',
              border: `1.5px solid rgba(27,54,93,0.2)`,
              backgroundColor: 'transparent',
              color: TEXT_MID,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'border-color 0.15s',
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
              padding: '0.5rem 1.125rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: GOLD,
              color: '#fff',
              cursor: !selectedSiteId || loading || !hasOptions ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: !selectedSiteId || loading || !hasOptions ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? t.common.processing : t.sites.moveProjectConfirm}
          </button>
        </div>
      </div>
    </dialog>
  );
}
