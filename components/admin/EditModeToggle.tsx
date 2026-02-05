'use client';

import { useCallback } from 'react';
import { GOLD, TEXT_MID } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface EditModeToggleProps {
  editing: boolean;
  setEditing: (editing: boolean) => void;
}

export default function EditModeToggle({ editing, setEditing }: EditModeToggleProps) {
  const t = useAdminTranslations();
  const handleEdit = useCallback(() => setEditing(true), [setEditing]);
  const handleCancel = useCallback(() => setEditing(false), [setEditing]);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      {!editing ? (
        <button
          type="button"
          onClick={handleEdit}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: GOLD,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {t.common.edit}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            border: `1px solid ${TEXT_MID}`,
            backgroundColor: 'transparent',
            color: TEXT_MID,
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {t.common.cancel}
        </button>
      )}
    </div>
  );
}
