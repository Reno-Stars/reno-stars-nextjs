'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface DesignItemFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    imageUrl: string;
    titleEn: string;
    titleZh: string;
    displayOrder: number;
    isPublished: boolean;
  };
  isNew?: boolean;
}

export default function DesignItemForm({ action, initialData, isNew = false }: DesignItemFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.designs.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    imageUrl: '',
    titleEn: '',
    titleZh: '',
    displayOrder: 0,
    isPublished: true,
  };

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
        {!isNew && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <ImageUrlInput name="imageUrl" label={t.designs.imageUrl} defaultValue={defaults.imageUrl} required disabled={!editing} />

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.designs.titleEn} htmlFor="titleEn">
              <input id="titleEn" name="titleEn" defaultValue={defaults.titleEn} style={fieldStyle} />
            </FormField>
            <FormField label={t.designs.titleZh} htmlFor="titleZh">
              <input id="titleZh" name="titleZh" defaultValue={defaults.titleZh} style={fieldStyle} />
            </FormField>
          </div>

          <FormField label={t.designs.displayOrder} htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={{ ...fieldStyle, maxWidth: '200px' }} />
          </FormField>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} />
              {t.designs.published}
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.designs.createDesignItem : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
