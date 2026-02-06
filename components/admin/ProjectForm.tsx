'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import { useFormToast } from './useFormToast';
import { inputStyle } from './shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, TEXT_MID, SURFACE, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

const SERVICE_TYPE_KEYS = ['kitchen', 'bathroom', 'whole-house', 'basement', 'cabinet', 'commercial'] as const;

interface ImageEntry {
  id: string;
  url: string;
  altEn: string;
  altZh: string;
  isBefore: boolean;
}

interface ScopeEntry {
  id: string;
  en: string;
  zh: string;
}

interface SiteOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface ProjectFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    id?: string;
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    serviceType: string;
    categoryEn: string;
    categoryZh: string;
    locationCity: string;
    budgetRange: string;
    durationEn: string;
    durationZh: string;
    spaceTypeEn: string;
    spaceTypeZh: string;
    heroImageUrl: string;
    challengeEn: string;
    challengeZh: string;
    solutionEn: string;
    solutionZh: string;
    badgeEn: string;
    badgeZh: string;
    featured: boolean;
    isPublished: boolean;
    siteId: string | null;
    displayOrderInSite: number;
    images: Omit<ImageEntry, 'id'>[];
    scopes: Omit<ScopeEntry, 'id'>[];
  };
  /** Available sites to link this project to (required) */
  sites?: SiteOption[];
  submitLabel?: string;
}

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: 'default',
};

export default function ProjectForm({
  action,
  initialData,
  sites = [],
  submitLabel,
}: ProjectFormProps) {
  const t = useAdminTranslations();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.projects.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const [images, setImages] = useState<ImageEntry[]>(
    initialData?.images.map((img) => ({ ...img, id: crypto.randomUUID() })) ?? [{ id: crypto.randomUUID(), url: '', altEn: '', altZh: '', isBefore: false }]
  );
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    initialData?.scopes.map((s) => ({ ...s, id: crypto.randomUUID() })) ?? [{ id: crypto.randomUUID(), en: '', zh: '' }]
  );

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
          <FormField label={t.projects.slug} htmlFor="slug">
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.projects.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.projects.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.projects.description} defaultValueEn={initialData?.descriptionEn} defaultValueZh={initialData?.descriptionZh} required rows={3} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.projects.serviceType} htmlFor="serviceType">
              <select id="serviceType" name="serviceType" defaultValue={initialData?.serviceType ?? 'kitchen'} style={fieldStyle}>
                {SERVICE_TYPE_KEYS.map((key) => (
                  <option key={key} value={key}>{t.projects.serviceTypes[key]}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t.projects.locationCity} htmlFor="locationCity">
              <input id="locationCity" name="locationCity" defaultValue={initialData?.locationCity ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <BilingualInput nameEn="categoryEn" nameZh="categoryZh" label={t.projects.category} defaultValueEn={initialData?.categoryEn} defaultValueZh={initialData?.categoryZh} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.projects.budgetRange} htmlFor="budgetRange">
              <input id="budgetRange" name="budgetRange" defaultValue={initialData?.budgetRange ?? ''} style={fieldStyle} placeholder={t.projects.budgetPlaceholder} />
            </FormField>
          </div>

          <BilingualInput nameEn="durationEn" nameZh="durationZh" label={t.projects.duration} defaultValueEn={initialData?.durationEn} defaultValueZh={initialData?.durationZh} />
          <BilingualInput nameEn="spaceTypeEn" nameZh="spaceTypeZh" label={t.projects.spaceType} defaultValueEn={initialData?.spaceTypeEn} defaultValueZh={initialData?.spaceTypeZh} />

          <ImageUrlInput name="heroImageUrl" label={t.projects.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} />

          <BilingualTextarea nameEn="challengeEn" nameZh="challengeZh" label={t.projects.challenge} defaultValueEn={initialData?.challengeEn} defaultValueZh={initialData?.challengeZh} rows={3} />
          <BilingualTextarea nameEn="solutionEn" nameZh="solutionZh" label={t.projects.solution} defaultValueEn={initialData?.solutionEn} defaultValueZh={initialData?.solutionZh} rows={3} />
          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.projects.badge} defaultValueEn={initialData?.badgeEn} defaultValueZh={initialData?.badgeZh} />

          {/* Images */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              {t.projects.images}
            </div>
            {images.map((img, idx) => (
              <div key={img.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <input name={`images[${idx}].url`} value={img.url} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], url: e.target.value }; setImages(n); }} placeholder={t.projects.imageUrl} aria-label={`Image ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.375rem' }}>
                  <input name={`images[${idx}].altEn`} value={img.altEn} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altEn: e.target.value }; setImages(n); }} placeholder={t.projects.altEn} aria-label={`Image ${idx + 1} alt text (English)`} style={fieldStyle} />
                  <input name={`images[${idx}].altZh`} value={img.altZh} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altZh: e.target.value }; setImages(n); }} placeholder={t.projects.altZh} aria-label={`Image ${idx + 1} alt text (Chinese)`} style={fieldStyle} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: NAVY }}>
                    <input type="checkbox" checked={img.isBefore} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], isBefore: e.target.checked }; setImages(n); }} />
                    <input type="hidden" name={`images[${idx}].isBefore`} value={String(img.isBefore)} />
                    {t.projects.before}
                  </label>
                </div>
                {editing && images.length > 1 && (
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} aria-label={`Remove image ${idx + 1}`} style={{ marginTop: '0.25rem', color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    {t.common.remove}
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setImages([...images, { id: crypto.randomUUID(), url: '', altEn: '', altZh: '', isBefore: false }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                {t.projects.addImage}
              </button>
            )}
          </div>

          {/* Scopes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              {t.projects.serviceScope}
            </div>
            {scopes.map((scope, idx) => (
              <div key={scope.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center' }}>
                <input name={`scopes[${idx}].en`} value={scope.en} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], en: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeEn} aria-label={`Scope ${idx + 1} (English)`} style={{ ...fieldStyle, flex: 1 }} />
                <input name={`scopes[${idx}].zh`} value={scope.zh} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], zh: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeZh} aria-label={`Scope ${idx + 1} (Chinese)`} style={{ ...fieldStyle, flex: 1 }} />
                {editing && scopes.length > 1 && (
                  <button type="button" onClick={() => setScopes(scopes.filter((_, i) => i !== idx))} aria-label={`Remove scope ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    x
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setScopes([...scopes, { id: crypto.randomUUID(), en: '', zh: '' }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                {t.projects.addScope}
              </button>
            )}
          </div>

          {/* Site Settings (Required) */}
          <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              {t.projects.siteSettings}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <FormField label={t.projects.linkedSite} htmlFor="siteId">
                <select
                  id="siteId"
                  name="siteId"
                  defaultValue={initialData?.siteId ?? ''}
                  required
                  style={fieldStyle}
                >
                  <option value="">{t.projects.selectSite}</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.titleEn} / {s.titleZh}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Display Order in Site */}
              <FormField label={t.projects.displayOrderInSite} htmlFor="displayOrderInSite">
                <input
                  id="displayOrderInSite"
                  name="displayOrderInSite"
                  type="number"
                  min="0"
                  defaultValue={initialData?.displayOrderInSite ?? 0}
                  style={{ ...fieldStyle, width: '100px' }}
                />
              </FormField>
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="featured" defaultChecked={initialData?.featured ?? false} />
              {t.projects.featured}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={initialData?.isPublished ?? true} />
              {t.projects.published}
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
