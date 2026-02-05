'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, neu } from '@/lib/theme';

interface TestimonialFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    name: string;
    textEn: string;
    textZh: string;
    rating: number;
    location: string;
    isFeatured: boolean;
    verified: boolean;
  };
  submitLabel?: string;
}

export default function TestimonialForm({ action, initialData, submitLabel = 'Save' }: TestimonialFormProps) {
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Testimonial saved.');

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
        {isEdit && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label="Name" htmlFor="name">
            <input id="name" name="name" defaultValue={initialData?.name ?? ''} required style={fieldStyle} />
          </FormField>

          <BilingualTextarea nameEn="textEn" nameZh="textZh" label="Review Text" defaultValueEn={initialData?.textEn} defaultValueZh={initialData?.textZh} required rows={4} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Rating (1-5)" htmlFor="rating">
              <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={initialData?.rating ?? 5} required style={fieldStyle} />
            </FormField>
            <FormField label="Location" htmlFor="location">
              <input id="location" name="location" defaultValue={initialData?.location ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isFeatured" defaultChecked={initialData?.isFeatured ?? false} />
              Featured
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="verified" defaultChecked={initialData?.verified ?? false} />
              Verified
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
              {isPending ? 'Saving...' : submitLabel}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
