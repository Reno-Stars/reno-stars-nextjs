'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import Tooltip from '@/components/admin/Tooltip';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface PartnerFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    nameEn: string;
    nameZh: string;
    logoUrl: string;
    websiteUrl: string | null;
    displayOrder: number;
    isActive: boolean;
    isHiddenVisually: boolean;
  };
  isNew?: boolean;
}

export default function PartnerForm({ action, initialData, isNew = false }: PartnerFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.partners.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    nameEn: '',
    nameZh: '',
    logoUrl: '',
    websiteUrl: null,
    displayOrder: 0,
    isActive: true,
    isHiddenVisually: false,
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
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.partners.nameEn} htmlFor="nameEn">
              <input id="nameEn" name="nameEn" defaultValue={defaults.nameEn} required style={fieldStyle} />
            </FormField>
            <FormField label={t.partners.nameZh} htmlFor="nameZh">
              <input id="nameZh" name="nameZh" defaultValue={defaults.nameZh} required style={fieldStyle} />
            </FormField>
          </div>

          <ImageUrlInput
            name="logoUrl"
            label={t.partners.logoUrl}
            defaultValue={defaults.logoUrl}
            required
            imageRole="logo"
          />

          <FormField label={t.partners.websiteUrl} htmlFor="websiteUrl">
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              defaultValue={defaults.websiteUrl ?? ''}
              placeholder="https://..."
              style={fieldStyle}
            />
          </FormField>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.partners.displayOrder} htmlFor="displayOrder">
              <input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min={0}
                defaultValue={defaults.displayOrder}
                required
                style={fieldStyle}
              />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} />
              {t.partners.isActive}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isHiddenVisually" defaultChecked={defaults.isHiddenVisually} />
              {t.partners.isHiddenVisually}
              <Tooltip content={t.partners.tooltips.hiddenVisually} size="sm" />
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.partners.createPartner : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
