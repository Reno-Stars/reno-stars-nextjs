'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import BilingualInput from '@/components/admin/BilingualInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ServiceAreaFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    slug: string;
    nameEn: string;
    nameZh: string;
    descriptionEn: string;
    descriptionZh: string;
    contentEn: string;
    contentZh: string;
    highlightsEn: string;
    highlightsZh: string;
    metaTitleEn: string;
    metaTitleZh: string;
    metaDescriptionEn: string;
    metaDescriptionZh: string;
    displayOrder: number;
    isActive: boolean;
  };
  isNew?: boolean;
}

export default function ServiceAreaForm({ action, initialData, isNew = false }: ServiceAreaFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.serviceAreas.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    slug: '',
    nameEn: '',
    nameZh: '',
    descriptionEn: '',
    descriptionZh: '',
    contentEn: '',
    contentZh: '',
    highlightsEn: '',
    highlightsZh: '',
    metaTitleEn: '',
    metaTitleZh: '',
    metaDescriptionEn: '',
    metaDescriptionZh: '',
    displayOrder: 0,
    isActive: true,
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
          <FormField label={t.serviceAreas.slug} htmlFor="slug" tooltip={isNew ? undefined : t.serviceAreas.slugTooltip}>
            {isNew ? (
              <input id="slug" name="slug" defaultValue={defaults.slug} required style={fieldStyle} />
            ) : (
              <input id="slug" value={defaults.slug} readOnly style={readOnlyStyle} />
            )}
          </FormField>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.serviceAreas.nameEn} htmlFor="nameEn">
              <input id="nameEn" name="nameEn" defaultValue={defaults.nameEn} required style={fieldStyle} />
            </FormField>
            <FormField label={t.serviceAreas.nameZh} htmlFor="nameZh">
              <input id="nameZh" name="nameZh" defaultValue={defaults.nameZh} required style={fieldStyle} />
            </FormField>
          </div>

          <BilingualTextarea
            nameEn="descriptionEn"
            nameZh="descriptionZh"
            label={t.serviceAreas.descriptionLabel}
            defaultValueEn={defaults.descriptionEn}
            defaultValueZh={defaults.descriptionZh}
            rows={4}
          />

          <BilingualTextarea
            nameEn="contentEn"
            nameZh="contentZh"
            label={t.serviceAreas.contentLabel}
            defaultValueEn={defaults.contentEn}
            defaultValueZh={defaults.contentZh}
            rows={8}
            tooltip={t.serviceAreas.contentHelp}
          />

          <BilingualTextarea
            nameEn="highlightsEn"
            nameZh="highlightsZh"
            label={t.serviceAreas.highlightsLabel}
            defaultValueEn={defaults.highlightsEn}
            defaultValueZh={defaults.highlightsZh}
            rows={5}
            tooltip={t.serviceAreas.highlightsHelp}
          />

          {/* SEO Settings */}
          <div style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: NAVY }}>{t.serviceAreas.seoSettings}</h3>
            <p style={{ fontSize: '0.75rem', color: TEXT_MID, marginTop: '0.25rem' }}>
              {t.serviceAreas.seoHelp}
            </p>
          </div>

          <BilingualInput
            nameEn="metaTitleEn"
            nameZh="metaTitleZh"
            label={t.serviceAreas.metaTitleLabel}
            defaultValueEn={defaults.metaTitleEn}
            defaultValueZh={defaults.metaTitleZh}
            maxLength={120}
          />

          <BilingualInput
            nameEn="metaDescriptionEn"
            nameZh="metaDescriptionZh"
            label={t.serviceAreas.metaDescriptionLabel}
            defaultValueEn={defaults.metaDescriptionEn}
            defaultValueZh={defaults.metaDescriptionZh}
            maxLength={320}
          />

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.serviceAreas.displayOrder} htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} />
              {t.serviceAreas.isActive}
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.serviceAreas.createServiceArea : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
