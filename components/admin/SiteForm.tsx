'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import Tooltip from './Tooltip';
import { useFormToast } from './useFormToast';
import { inputStyle, readOnlyStyle } from './shared-styles';
import SubmitButton from './SubmitButton';
import { CARD, NAVY, GOLD, TEXT_MID, neu, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';
import { getAssetUrl } from '@/lib/storage';

interface SiteImageEntry {
  id: string;
  url: string;
  altEn: string;
  altZh: string;
  isBefore: boolean;
}

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
    images?: { url: string; altEn: string; altZh: string; isBefore: boolean }[];
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
  const [selectedCity, setSelectedCity] = useState(initialData?.locationCity ?? '');
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.sites.saved);

  const [siteImages, setSiteImages] = useState<SiteImageEntry[]>(
    initialData?.images?.map((img) => ({ ...img, id: crypto.randomUUID() })) ?? []
  );

  // Sync selectedCity when initialData changes (after save + revalidation)
  useEffect(() => {
    setSelectedCity(initialData?.locationCity ?? '');
  }, [initialData?.locationCity]);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form action={formAction}>
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
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.sites.slugPlaceholder} />
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

          <ImageUrlInput name="heroImageUrl" label={t.sites.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} tooltip={t.sites.tooltips.heroImage} />

          {/* Site Images */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.sites.images}
              </span>
              <Tooltip content={t.sites.tooltips.images} size="sm" />
            </div>
            {siteImages.map((img, idx) => (
              <div key={img.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '8px', boxShadow: neu(2), backgroundColor: CARD }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {img.url && (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#f0f0f0',
                        boxShadow: neu(2),
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAssetUrl(img.url)}
                        alt={img.altEn || `Image ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input name={`siteImages[${idx}].url`} value={img.url} onChange={(e) => { const n = [...siteImages]; n[idx] = { ...n[idx], url: e.target.value }; setSiteImages(n); }} placeholder={t.projects.imageUrl} aria-label={`Site image ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                    <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', marginBottom: '0.375rem' }}>
                      <div>
                        <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                          <span role="img" aria-label="English">🇺🇸</span> {t.projects.altEn}
                        </label>
                        <input name={`siteImages[${idx}].altEn`} value={img.altEn} onChange={(e) => { const n = [...siteImages]; n[idx] = { ...n[idx], altEn: e.target.value }; setSiteImages(n); }} placeholder={t.projects.altEn} aria-label={`Site image ${idx + 1} alt text (English)`} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                          <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.altZh}
                        </label>
                        <input name={`siteImages[${idx}].altZh`} value={img.altZh} onChange={(e) => { const n = [...siteImages]; n[idx] = { ...n[idx], altZh: e.target.value }; setSiteImages(n); }} placeholder={t.projects.altZh} aria-label={`Site image ${idx + 1} alt text (Chinese)`} style={fieldStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: NAVY }}>
                        <input type="checkbox" checked={img.isBefore} onChange={(e) => { const n = [...siteImages]; n[idx] = { ...n[idx], isBefore: e.target.checked }; setSiteImages(n); }} />
                        <input type="hidden" name={`siteImages[${idx}].isBefore`} value={String(img.isBefore)} />
                        {t.projects.before}
                      </label>
                      {editing && (
                        <button type="button" onClick={() => setSiteImages(siteImages.filter((_, i) => i !== idx))} aria-label={`Remove site image ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                          {t.common.remove}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setSiteImages([...siteImages, { id: crypto.randomUUID(), url: '', altEn: '', altZh: '', isBefore: false }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                {t.sites.addImage}
              </button>
            )}
          </div>

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
