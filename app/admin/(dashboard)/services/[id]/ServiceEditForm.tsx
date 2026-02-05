'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateService } from '@/app/actions/admin/services';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, GOLD, GOLD_HOVER, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { DbService } from '@/lib/db/schema';

interface Props {
  service: DbService;
}

export default function ServiceEditForm({ service }: Props) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(false);
  const boundAction = updateService.bind(null, service.id);
  const [state, formAction, isPending] = useActionState(boundAction, {});
  useFormToast(state, t.services.saved);

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
        <FormAlerts state={state} successMessage="Updated successfully." />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.services.nameLabel} defaultValueEn={service.titleEn} defaultValueZh={service.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.services.shortDescription} defaultValueEn={service.descriptionEn} defaultValueZh={service.descriptionZh} required rows={3} />
          <BilingualTextarea nameEn="longDescriptionEn" nameZh="longDescriptionZh" label={t.services.longDescription} defaultValueEn={service.longDescriptionEn ?? ''} defaultValueZh={service.longDescriptionZh ?? ''} rows={5} />

          <FormField label={t.services.iconName} htmlFor="iconName">
            <input id="iconName" name="iconName" defaultValue={service.iconName ?? ''} style={fieldStyle} placeholder="e.g. Hammer" />
          </FormField>

          <ImageUrlInput name="imageUrl" label={t.services.heroImage} defaultValue={service.imageUrl ?? ''} />

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
              {isPending ? t.common.saving : t.common.save}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
