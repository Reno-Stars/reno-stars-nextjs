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

const SERVICE_TYPES = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'whole-house', label: 'Whole House' },
  { value: 'basement', label: 'Basement' },
  { value: 'cabinet', label: 'Cabinet' },
  { value: 'commercial', label: 'Commercial' },
];

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

interface ProjectFormProps {
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
    images: Omit<ImageEntry, 'id'>[];
    scopes: Omit<ScopeEntry, 'id'>[];
  };
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
  submitLabel = 'Save',
}: ProjectFormProps) {
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Project saved.');

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
                Edit
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
                Cancel
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
            Saved successfully.
          </div>
        )}

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label="Slug" htmlFor="slug">
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder="my-project-slug" />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label="Title" defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label="Description" defaultValueEn={initialData?.descriptionEn} defaultValueZh={initialData?.descriptionZh} required rows={3} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Service Type" htmlFor="serviceType">
              <select id="serviceType" name="serviceType" defaultValue={initialData?.serviceType ?? 'kitchen'} style={fieldStyle}>
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Location City" htmlFor="locationCity">
              <input id="locationCity" name="locationCity" defaultValue={initialData?.locationCity ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <BilingualInput nameEn="categoryEn" nameZh="categoryZh" label="Category" defaultValueEn={initialData?.categoryEn} defaultValueZh={initialData?.categoryZh} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Budget Range" htmlFor="budgetRange">
              <input id="budgetRange" name="budgetRange" defaultValue={initialData?.budgetRange ?? ''} style={fieldStyle} placeholder="$15,000 - $25,000" />
            </FormField>
          </div>

          <BilingualInput nameEn="durationEn" nameZh="durationZh" label="Duration" defaultValueEn={initialData?.durationEn} defaultValueZh={initialData?.durationZh} />
          <BilingualInput nameEn="spaceTypeEn" nameZh="spaceTypeZh" label="Space Type" defaultValueEn={initialData?.spaceTypeEn} defaultValueZh={initialData?.spaceTypeZh} />

          <ImageUrlInput name="heroImageUrl" label="Hero Image URL" defaultValue={initialData?.heroImageUrl ?? ''} />

          <BilingualTextarea nameEn="challengeEn" nameZh="challengeZh" label="Challenge" defaultValueEn={initialData?.challengeEn} defaultValueZh={initialData?.challengeZh} rows={3} />
          <BilingualTextarea nameEn="solutionEn" nameZh="solutionZh" label="Solution" defaultValueEn={initialData?.solutionEn} defaultValueZh={initialData?.solutionZh} rows={3} />
          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label="Badge" defaultValueEn={initialData?.badgeEn} defaultValueZh={initialData?.badgeZh} />

          {/* Images */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              Images
            </div>
            {images.map((img, idx) => (
              <div key={img.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <input name={`images[${idx}].url`} value={img.url} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], url: e.target.value }; setImages(n); }} placeholder="Image URL" aria-label={`Image ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.375rem' }}>
                  <input name={`images[${idx}].altEn`} value={img.altEn} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altEn: e.target.value }; setImages(n); }} placeholder="Alt EN" aria-label={`Image ${idx + 1} alt text (English)`} style={fieldStyle} />
                  <input name={`images[${idx}].altZh`} value={img.altZh} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altZh: e.target.value }; setImages(n); }} placeholder="Alt ZH" aria-label={`Image ${idx + 1} alt text (Chinese)`} style={fieldStyle} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: NAVY }}>
                    <input type="checkbox" checked={img.isBefore} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], isBefore: e.target.checked }; setImages(n); }} />
                    <input type="hidden" name={`images[${idx}].isBefore`} value={String(img.isBefore)} />
                    Before
                  </label>
                </div>
                {editing && images.length > 1 && (
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} aria-label={`Remove image ${idx + 1}`} style={{ marginTop: '0.25rem', color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setImages([...images, { id: crypto.randomUUID(), url: '', altEn: '', altZh: '', isBefore: false }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                + Add Image
              </button>
            )}
          </div>

          {/* Scopes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              Service Scope
            </div>
            {scopes.map((scope, idx) => (
              <div key={scope.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center' }}>
                <input name={`scopes[${idx}].en`} value={scope.en} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], en: e.target.value }; setScopes(n); }} placeholder="Scope EN" aria-label={`Scope ${idx + 1} (English)`} style={{ ...fieldStyle, flex: 1 }} />
                <input name={`scopes[${idx}].zh`} value={scope.zh} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], zh: e.target.value }; setScopes(n); }} placeholder="Scope ZH" aria-label={`Scope ${idx + 1} (Chinese)`} style={{ ...fieldStyle, flex: 1 }} />
                {editing && scopes.length > 1 && (
                  <button type="button" onClick={() => setScopes(scopes.filter((_, i) => i !== idx))} aria-label={`Remove scope ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    x
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setScopes([...scopes, { id: crypto.randomUUID(), en: '', zh: '' }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                + Add Scope
              </button>
            )}
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="featured" defaultChecked={initialData?.featured ?? false} />
              Featured
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={initialData?.isPublished ?? true} />
              Published
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
              {isPending ? 'Saving...' : submitLabel}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
