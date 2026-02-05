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
import { GALLERY_CATEGORY_OPTIONS } from '@/lib/admin/gallery-categories';

interface GalleryItemFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData: {
    imageUrl: string;
    titleEn: string;
    titleZh: string;
    category: string;
    displayOrder: number;
    isPublished: boolean;
  };
}

export default function GalleryItemForm({ action, initialData }: GalleryItemFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Gallery item saved.');

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
          <ImageUrlInput name="imageUrl" label="Image URL" defaultValue={initialData.imageUrl} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Title (EN)" htmlFor="titleEn">
              <input id="titleEn" name="titleEn" defaultValue={initialData.titleEn} style={fieldStyle} />
            </FormField>
            <FormField label="Title (ZH)" htmlFor="titleZh">
              <input id="titleZh" name="titleZh" defaultValue={initialData.titleZh} style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Category" htmlFor="category">
              <select id="category" name="category" defaultValue={initialData.category} required style={fieldStyle}>
                {GALLERY_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Display Order" htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initialData.displayOrder} required style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={initialData.isPublished} />
              Published
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label="Update Gallery Item" />
          )}
        </fieldset>
      </div>
    </form>
  );
}
