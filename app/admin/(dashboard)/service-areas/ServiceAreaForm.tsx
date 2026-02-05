'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';

interface ServiceAreaFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData: {
    slug: string;
    nameEn: string;
    nameZh: string;
    descriptionEn: string;
    descriptionZh: string;
    displayOrder: number;
    isActive: boolean;
  };
}

export default function ServiceAreaForm({ action, initialData }: ServiceAreaFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Service area saved.');

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
          <FormField label="Slug" htmlFor="slug">
            <input id="slug" value={initialData.slug} readOnly style={readOnlyStyle} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Name (EN)" htmlFor="nameEn">
              <input id="nameEn" name="nameEn" defaultValue={initialData.nameEn} required style={fieldStyle} />
            </FormField>
            <FormField label="Name (ZH)" htmlFor="nameZh">
              <input id="nameZh" name="nameZh" defaultValue={initialData.nameZh} required style={fieldStyle} />
            </FormField>
          </div>

          <BilingualTextarea
            nameEn="descriptionEn"
            nameZh="descriptionZh"
            label="Description"
            defaultValueEn={initialData.descriptionEn}
            defaultValueZh={initialData.descriptionZh}
            rows={4}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Display Order" htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initialData.displayOrder} required style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isActive" defaultChecked={initialData.isActive} />
              Active
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label="Update Service Area" />
          )}
        </fieldset>
      </div>
    </form>
  );
}
