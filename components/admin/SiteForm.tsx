'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import { useFormToast } from './useFormToast';
import { inputStyle } from './shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, TEXT_MID, neu, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';

interface City {
  nameEn: string;
  nameZh: string;
}

interface SiteFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  cities: City[];
  initialData?: {
    id?: string;
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    locationCity: string;
    heroImageUrl: string;
    badgeEn: string;
    badgeZh: string;
    showAsProject: boolean;
    featured: boolean;
    isPublished: boolean;
  };
  submitLabel?: string;
}

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: 'default',
};

function CheckboxWithTooltip({
  name,
  label,
  defaultChecked,
  tooltip,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  tooltip: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        {label}
      </label>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: `1px solid ${TEXT_MID}`,
            backgroundColor: 'transparent',
            color: TEXT_MID,
            fontSize: '9px',
            fontWeight: 600,
            cursor: 'help',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          aria-label="Help"
        >
          ?
        </button>
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '6px',
              padding: '0.5rem 0.75rem',
              backgroundColor: NAVY,
              color: CARD,
              fontSize: '0.75rem',
              lineHeight: 1.4,
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
              width: '200px',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SiteForm({
  action,
  cities,
  initialData,
  submitLabel,
}: SiteFormProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.sites.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form action={formAction}>
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          maxWidth: '900px',
        }}
      >
        {/* Edit / Cancel button — only for edit mode */}
        {isEdit && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: GOLD,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {t.common.edit}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${TEXT_MID}`,
                  backgroundColor: 'transparent',
                  color: TEXT_MID,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {t.common.cancel}
              </button>
            )}
          </div>
        )}

        {state.error && (
          <div role="alert" style={{ backgroundColor: ERROR_BG, color: ERROR, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {state.error}
          </div>
        )}
        {state.success && (
          <div role="alert" style={{ backgroundColor: SUCCESS_BG, color: SUCCESS, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {t.common.savedSuccessfully}
          </div>
        )}

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label={t.sites.slug} htmlFor="slug" tooltip={t.sites.tooltips.slug}>
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.sites.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.sites.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required tooltip={t.sites.tooltips.title} />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.sites.description} defaultValueEn={initialData?.descriptionEn} defaultValueZh={initialData?.descriptionZh} required rows={3} tooltip={t.sites.tooltips.description} />

          <FormField label={t.sites.locationCity} htmlFor="locationCity" tooltip={t.sites.tooltips.city}>
            <select id="locationCity" name="locationCity" defaultValue={initialData?.locationCity ?? ''} style={fieldStyle}>
              <option value="">{t.sites.selectCity}</option>
              {cities.map((city) => (
                <option key={city.nameEn} value={city.nameEn}>
                  {locale === 'zh' ? city.nameZh : city.nameEn}
                </option>
              ))}
            </select>
          </FormField>

          <ImageUrlInput name="heroImageUrl" label={t.sites.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} tooltip={t.sites.tooltips.heroImage} />

          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.sites.badge} defaultValueEn={initialData?.badgeEn} defaultValueZh={initialData?.badgeZh} tooltip={t.sites.tooltips.badge} />

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <CheckboxWithTooltip name="showAsProject" label={t.sites.showAsProject} defaultChecked={initialData?.showAsProject ?? true} tooltip={t.sites.tooltips.showAsProject} />
            <CheckboxWithTooltip name="featured" label={t.sites.featured} defaultChecked={initialData?.featured ?? false} tooltip={t.sites.tooltips.featured} />
            <CheckboxWithTooltip name="isPublished" label={t.sites.published} defaultChecked={initialData?.isPublished ?? true} tooltip={t.sites.tooltips.published} />
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
