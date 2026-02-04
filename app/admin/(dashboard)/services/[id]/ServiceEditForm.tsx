'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateService } from '@/app/actions/admin/services';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle } from '@/components/admin/shared-styles';
import { CARD, GOLD, GOLD_HOVER, TEXT_MID, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import type { DbService } from '@/lib/db/schema';

interface Props {
  service: DbService;
}

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: 'default',
};

export default function ServiceEditForm({ service }: Props) {
  const [editing, setEditing] = useState(false);
  const boundAction = updateService.bind(null, service.id);
  const [state, formAction, isPending] = useActionState(boundAction, {});
  useFormToast(state, 'Service updated.');

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form action={formAction}>
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          maxWidth: '800px',
        }}
      >
        {/* Header with Edit / Cancel button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
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
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
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
              Cancel
            </button>
          )}
        </div>

        {state.error && (
          <div role="alert" style={{ backgroundColor: ERROR_BG, color: ERROR, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {state.error}
          </div>
        )}
        {state.success && (
          <div role="alert" style={{ backgroundColor: SUCCESS_BG, color: SUCCESS, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Updated successfully.
          </div>
        )}

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <BilingualInput nameEn="titleEn" nameZh="titleZh" label="Title" defaultValueEn={service.titleEn} defaultValueZh={service.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label="Description" defaultValueEn={service.descriptionEn} defaultValueZh={service.descriptionZh} required rows={3} />
          <BilingualTextarea nameEn="longDescriptionEn" nameZh="longDescriptionZh" label="Long Description" defaultValueEn={service.longDescriptionEn ?? ''} defaultValueZh={service.longDescriptionZh ?? ''} rows={5} />

          <FormField label="Icon Name" htmlFor="iconName">
            <input id="iconName" name="iconName" defaultValue={service.iconName ?? ''} style={fieldStyle} placeholder="e.g. Hammer" />
          </FormField>

          <ImageUrlInput name="imageUrl" label="Image URL" defaultValue={service.imageUrl ?? ''} />

          {editing && (
            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: '1rem',
                padding: '0.625rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isPending ? GOLD_HOVER : GOLD,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
