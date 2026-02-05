'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, neu } from '@/lib/theme';

interface SocialLinkFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData: {
    platform: string;
    url: string;
    label: string;
    displayOrder: number;
    isActive: boolean;
  };
}

export default function SocialLinkForm({ action, initialData }: SocialLinkFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Social link saved.');

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
        <EditModeToggle editing={editing} setEditing={setEditing} />
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label="Platform" htmlFor="platform">
            <input
              id="platform"
              value={initialData.platform}
              readOnly
              style={{ ...readOnlyStyle, textTransform: 'capitalize' }}
            />
          </FormField>

          <FormField label="URL" htmlFor="url">
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={initialData.url}
              required
              style={fieldStyle}
            />
          </FormField>

          <FormField label="Label" htmlFor="label">
            <input
              id="label"
              name="label"
              defaultValue={initialData.label}
              style={fieldStyle}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Display Order" htmlFor="displayOrder">
              <input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min={0}
                defaultValue={initialData.displayOrder}
                required
                style={fieldStyle}
              />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: NAVY,
                fontSize: '0.875rem',
              }}
            >
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={initialData.isActive}
              />
              Active
            </label>
          </div>

          {editing && (
            <button
              type="submit"
              disabled={isPending}
              style={{
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
              {isPending ? 'Saving...' : 'Update Social Link'}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
