'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import ImagePairEditor, { ImagePairEntry } from './ImagePairEditor';
import Tooltip from './Tooltip';
import { useFormToast } from './useFormToast';
import { inputStyle, readOnlyStyle } from './shared-styles';
import SubmitButton from './SubmitButton';
import { CARD, NAVY, GOLD, TEXT_MID, neu, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG } from '@/lib/theme';
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
    imagePairs?: Omit<ImagePairEntry, 'id'>[];
  };
  submitLabel?: string;
}

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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        {label}
      </label>
      <Tooltip content={tooltip} size="sm" />
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
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [selectedCity, setSelectedCity] = useState(initialData?.locationCity ?? '');
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.sites.saved);

  const [siteImagePairs, setSiteImagePairs] = useState<ImagePairEntry[]>(
    initialData?.imagePairs?.map((p) => ({ ...p, id: crypto.randomUUID() })) ?? []
  );

  // Sync state when initialData changes (after save + revalidation)
  useEffect(() => {
    setSlug(initialData?.slug ?? '');
    setSelectedCity(initialData?.locationCity ?? '');
  }, [initialData?.slug, initialData?.locationCity]);

  // Pre-save warning state
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const missing: string[] = [];
    if (!fd.get('heroImageUrl')) missing.push(t.sites.heroImageUrl);
    if (siteImagePairs.length === 0) missing.push(t.imagePairs.title);
    if (!fd.get('locationCity')) missing.push(t.sites.locationCity);
    if (!fd.get('badgeEn') && !fd.get('badgeZh')) missing.push(t.sites.badge);

    if (missing.length > 0) {
      setPendingFormData(fd);
      setMissingFields(missing);
      setShowSaveWarning(true);
    } else {
      startTransition(() => formAction(fd));
    }
  }, [siteImagePairs.length, formAction, t]);

  const handleSaveConfirm = useCallback(() => {
    if (pendingFormData) {
      startTransition(() => formAction(pendingFormData));
    }
    setShowSaveWarning(false);
    setPendingFormData(null);
    setMissingFields([]);
  }, [pendingFormData, formAction]);

  const handleSaveCancel = useCallback(() => {
    setShowSaveWarning(false);
    setPendingFormData(null);
    setMissingFields([]);
  }, []);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form onSubmit={handleSubmit}>
      <ConfirmDialog
        open={showSaveWarning}
        title={t.common.saveWarningTitle}
        message={t.common.saveWarningMessage}
        items={missingFields}
        variant="warning"
        confirmLabel={t.common.saveAnyway}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
      />
      <div
        className="admin-form-card"
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
            <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required style={fieldStyle} placeholder={t.sites.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.sites.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required tooltip={t.sites.tooltips.title} />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.sites.description} defaultValueEn={initialData?.descriptionEn} defaultValueZh={initialData?.descriptionZh} required rows={3} tooltip={t.sites.tooltips.description} />

          <FormField label={t.sites.locationCity} htmlFor="locationCity" tooltip={t.sites.tooltips.city}>
            <select
              id="locationCity"
              name="locationCity"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={fieldStyle}
            >
              <option value="">{t.sites.selectCity}</option>
              {cities.map((city) => (
                <option key={city.nameEn} value={city.nameEn}>
                  {locale === 'zh' ? city.nameZh : city.nameEn}
                </option>
              ))}
            </select>
          </FormField>

          <ImageUrlInput name="heroImageUrl" label={t.sites.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} tooltip={t.sites.tooltips.heroImage} slug={slug} />

          {/* Site Image Pairs */}
          <ImagePairEditor
            namePrefix="siteImagePairs"
            pairs={siteImagePairs}
            onChange={setSiteImagePairs}
            editing={editing}
            label={t.imagePairs?.title}
            tooltip={t.imagePairs?.tooltips?.title}
            slug={slug}
          />

          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.sites.badge} defaultValueEn={initialData?.badgeEn} defaultValueZh={initialData?.badgeZh} tooltip={t.sites.tooltips.badge} />

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <CheckboxWithTooltip name="showAsProject" label={t.sites.showAsProject} defaultChecked={initialData?.showAsProject ?? true} tooltip={t.sites.tooltips.showAsProject} />
            <CheckboxWithTooltip name="featured" label={t.sites.featured} defaultChecked={initialData?.featured ?? false} tooltip={t.sites.tooltips.featured} />
            <CheckboxWithTooltip name="isPublished" label={t.sites.published} defaultChecked={initialData?.isPublished ?? true} tooltip={t.sites.tooltips.published} />
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={submitLabel} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
