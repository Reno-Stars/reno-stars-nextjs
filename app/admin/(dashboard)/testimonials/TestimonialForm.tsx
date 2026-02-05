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
import { useAdminTranslations } from '@/lib/admin/translations';

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

export default function TestimonialForm({ action, initialData, submitLabel }: TestimonialFormProps) {
  const t = useAdminTranslations();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.testimonials.saved);

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
          <FormField label={t.testimonials.name} htmlFor="name">
            <input id="name" name="name" defaultValue={initialData?.name ?? ''} required style={fieldStyle} />
          </FormField>

          <BilingualTextarea nameEn="textEn" nameZh="textZh" label={t.testimonials.reviewText} defaultValueEn={initialData?.textEn} defaultValueZh={initialData?.textZh} required rows={4} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.testimonials.ratingRange} htmlFor="rating">
              <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={initialData?.rating ?? 5} required style={fieldStyle} />
            </FormField>
            <FormField label={t.testimonials.location} htmlFor="location">
              <input id="location" name="location" defaultValue={initialData?.location ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isFeatured" defaultChecked={initialData?.isFeatured ?? false} />
              {t.testimonials.featured}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="verified" defaultChecked={initialData?.verified ?? false} />
              {t.testimonials.verified}
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
              {isPending ? t.common.saving : (submitLabel ?? t.common.save)}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
