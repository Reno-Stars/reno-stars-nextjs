'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import SubmitButton from '@/components/admin/SubmitButton';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ServiceFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    longDescriptionEn: string | null;
    longDescriptionZh: string | null;
    iconUrl: string | null;
    imageUrl: string | null;
    displayOrder: number;
  };
  isNew?: boolean;
}

export default function ServiceForm({ action, initialData, isNew = false }: ServiceFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.services.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    slug: '',
    titleEn: '',
    titleZh: '',
    descriptionEn: '',
    descriptionZh: '',
    longDescriptionEn: '',
    longDescriptionZh: '',
    iconUrl: '',
    imageUrl: '',
    displayOrder: 0,
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
          <FormField label={t.services.slug} htmlFor="slug">
            {isNew ? (
              <input id="slug" name="slug" defaultValue={defaults.slug} required style={fieldStyle} placeholder={t.services.slugPlaceholder} />
            ) : (
              <input id="slug" value={defaults.slug} readOnly style={readOnlyStyle} />
            )}
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.services.nameLabel} defaultValueEn={defaults.titleEn} defaultValueZh={defaults.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.services.shortDescription} defaultValueEn={defaults.descriptionEn} defaultValueZh={defaults.descriptionZh} required rows={3} />
          <BilingualTextarea nameEn="longDescriptionEn" nameZh="longDescriptionZh" label={t.services.longDescription} defaultValueEn={defaults.longDescriptionEn ?? ''} defaultValueZh={defaults.longDescriptionZh ?? ''} rows={5} />

          <ImageUrlInput name="iconUrl" label={t.services.iconImage} defaultValue={defaults.iconUrl ?? ''} slug={defaults.slug || undefined} imageRole="icon" disabled={!editing} />

          <ImageUrlInput name="imageUrl" label={t.services.heroImage} defaultValue={defaults.imageUrl ?? ''} disabled={!editing} />

          <FormField label={t.services.displayOrder} htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={fieldStyle} />
          </FormField>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.services.createService : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
