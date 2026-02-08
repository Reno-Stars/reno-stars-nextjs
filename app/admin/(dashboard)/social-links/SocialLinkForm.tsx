'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

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
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.socialLinks.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form action={formAction}>
      <div
        className="admin-form-card"
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
          <FormField label={t.socialLinks.platform} htmlFor="platform">
            <input
              id="platform"
              value={initialData.platform}
              readOnly
              style={{ ...readOnlyStyle, textTransform: 'capitalize' }}
            />
          </FormField>

          <FormField label={t.socialLinks.url} htmlFor="url">
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={initialData.url}
              required
              style={fieldStyle}
            />
          </FormField>

          <FormField label={t.socialLinks.label} htmlFor="label">
            <input
              id="label"
              name="label"
              defaultValue={initialData.label}
              style={fieldStyle}
            />
          </FormField>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.socialLinks.displayOrder} htmlFor="displayOrder">
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
              {t.socialLinks.isActive}
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
