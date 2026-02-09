'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import Tooltip from './Tooltip';
import SearchableSelect from './SearchableSelect';
import { useFormToast } from './useFormToast';
import SubmitButton from './SubmitButton';
import { inputStyle, readOnlyStyle } from './shared-styles';
import { uploadImage } from '@/app/actions/admin/upload';
import { getAssetUrl } from '@/lib/storage';
import { SPACE_TYPES, SERVICE_TYPES } from '@/lib/admin/constants';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';

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

interface ExternalProductEntry {
  id: string;
  url: string;
  imageUrl: string;
  labelEn: string;
  labelZh: string;
}

interface SiteOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface CityOption {
  nameEn: string;
  nameZh: string;
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
    locationCity: string;
    budgetMin: string;
    budgetMax: string;
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
    images: Omit<ImageEntry, 'id'>[];
    scopes: Omit<ScopeEntry, 'id'>[];
    externalProducts?: Omit<ExternalProductEntry, 'id'>[];
  };
  /** Available sites to link this project to (required when not using fixedSiteId) */
  sites?: SiteOption[];
  /** Available cities for location selection */
  cities?: CityOption[];
  submitLabel?: string;
  /** Hide the site selector dropdown and use fixedSiteId instead */
  hideSiteSelector?: boolean;
  /** Fixed site ID when hideSiteSelector is true */
  fixedSiteId?: string;
}

export default function ProjectForm({
  action,
  initialData,
  sites = [],
  cities = [],
  submitLabel,
  hideSiteSelector = false,
  fixedSiteId,
}: ProjectFormProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [selectedServiceType, setSelectedServiceType] = useState(initialData?.serviceType ?? 'kitchen');
  const [selectedLocationCity, setSelectedLocationCity] = useState(initialData?.locationCity ?? '');
  const [selectedSpaceType, setSelectedSpaceType] = useState(initialData?.spaceTypeEn ?? '');
  const [selectedSiteId, setSelectedSiteId] = useState(initialData?.siteId ?? '');
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.projects.saved);

  // Sync state when initialData changes (after save + revalidation)
  useEffect(() => {
    setSelectedServiceType(initialData?.serviceType ?? 'kitchen');
    setSelectedLocationCity(initialData?.locationCity ?? '');
    setSelectedSpaceType(initialData?.spaceTypeEn ?? '');
    setSelectedSiteId(initialData?.siteId ?? '');
  }, [initialData?.serviceType, initialData?.locationCity, initialData?.spaceTypeEn, initialData?.siteId]);

  // Convert sites to SearchableSelect options format
  const siteOptions = useMemo(() =>
    sites.map((s) => ({
      id: s.id,
      label: locale === 'zh' ? `${s.titleZh} / ${s.titleEn}` : `${s.titleEn} / ${s.titleZh}`,
    })),
    [sites, locale]
  );

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const [images, setImages] = useState<ImageEntry[]>(
    initialData?.images.map((img) => ({ ...img, id: crypto.randomUUID() })) ?? [{ id: crypto.randomUUID(), url: '', altEn: '', altZh: '', isBefore: false }]
  );
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    initialData?.scopes.map((s) => ({ ...s, id: crypto.randomUUID() })) ?? [{ id: crypto.randomUUID(), en: '', zh: '' }]
  );
  const [externalProducts, setExternalProducts] = useState<ExternalProductEntry[]>(
    initialData?.externalProducts?.map((ep) => ({ ...ep, id: crypto.randomUUID() })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle batch image upload — uploads in parallel for speed
  const handleBatchUpload = async (files: FileList) => {
    setUploading(true);
    setUploadError('');

    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const skipped = files.length - imageFiles.length;

    const results = await Promise.allSettled(
      imageFiles.map(async (file) => {
        const fd = new FormData();
        fd.set('file', file);
        const result = await uploadImage({}, fd);
        if (result.error || !result.url) throw new Error(`${file.name}: ${result.error ?? 'No URL returned'}`);
        return { url: result.url, name: file.name };
      })
    );

    const newImages: ImageEntry[] = [];
    const errors: string[] = [];
    if (skipped > 0) errors.push(t.upload.notImage.replace('{count}', String(skipped)));

    for (const r of results) {
      if (r.status === 'fulfilled') {
        newImages.push({ id: crypto.randomUUID(), url: r.value.url, altEn: '', altZh: '', isBefore: false });
      } else {
        errors.push(r.reason?.message ?? t.upload.failed);
      }
    }

    if (newImages.length > 0) {
      if (images.length === 1 && !images[0].url) {
        setImages(newImages);
      } else {
        setImages([...images, ...newImages]);
      }
    }

    if (errors.length > 0) {
      const ok = newImages.length;
      const fail = errors.length;
      setUploadError(
        ok > 0
          ? t.upload.partialSuccess.replace('{success}', String(ok)).replace('{fail}', String(fail)).replace('{error}', errors[0])
          : t.upload.allFailed.replace('{error}', errors[0]).replace('{more}', fail > 1 ? ` (+${fail - 1})` : '')
      );
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleBatchUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items?.length) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
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
          <FormField label={t.projects.slug} htmlFor="slug" tooltip={t.projects.tooltips.slug}>
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.projects.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.projects.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required tooltip={t.projects.tooltips.title} />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.projects.description} defaultValueEn={initialData?.descriptionEn} defaultValueZh={initialData?.descriptionZh} required rows={3} tooltip={t.projects.tooltips.description} />

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.projects.serviceType} htmlFor="serviceType" tooltip={t.projects.tooltips.serviceType}>
              <select id="serviceType" name="serviceType" value={selectedServiceType} onChange={(e) => setSelectedServiceType(e.target.value)} style={fieldStyle}>
                {SERVICE_TYPES.map((key) => (
                  <option key={key} value={key}>{t.projects.serviceTypes[key]}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t.projects.locationCity} htmlFor="locationCity" tooltip={t.projects.tooltips.locationCity}>
              <select id="locationCity" name="locationCity" value={selectedLocationCity} onChange={(e) => setSelectedLocationCity(e.target.value)} style={fieldStyle}>
                <option value="">{t.sites.selectCity}</option>
                {cities.map((city) => (
                  <option key={city.nameEn} value={city.nameEn}>
                    {locale === 'zh' ? city.nameZh : city.nameEn}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label={t.projects.budgetRange} htmlFor="budgetMin" tooltip={t.projects.tooltips.budgetRange}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: TEXT_MID, fontSize: '0.875rem' }}>$</span>
                <input
                  id="budgetMin"
                  name="budgetMin"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={initialData?.budgetMin ?? ''}
                  style={{ ...fieldStyle, paddingLeft: '1.5rem' }}
                  placeholder="15000"
                />
              </div>
              <span style={{ color: TEXT_MID, fontSize: '0.875rem' }}>–</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: TEXT_MID, fontSize: '0.875rem' }}>$</span>
                <input
                  id="budgetMax"
                  name="budgetMax"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={initialData?.budgetMax ?? ''}
                  style={{ ...fieldStyle, paddingLeft: '1.5rem' }}
                  placeholder="25000"
                />
              </div>
            </div>
          </FormField>

          <BilingualInput nameEn="durationEn" nameZh="durationZh" label={t.projects.duration} defaultValueEn={initialData?.durationEn} defaultValueZh={initialData?.durationZh} tooltip={t.projects.tooltips.duration} />

          <FormField label={t.projects.spaceType} htmlFor="spaceType" tooltip={t.projects.tooltips.spaceType}>
            <select id="spaceType" name="spaceType" value={selectedSpaceType} onChange={(e) => setSelectedSpaceType(e.target.value)} style={fieldStyle}>
              <option value="">{t.projects.selectSpaceType}</option>
              {SPACE_TYPES.map(({ en, zh }) => (
                <option key={en} value={en}>
                  {locale === 'zh' ? zh : en}
                </option>
              ))}
            </select>
          </FormField>

          <ImageUrlInput name="heroImageUrl" label={t.projects.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} tooltip={t.projects.tooltips.heroImage} />

          <BilingualTextarea nameEn="challengeEn" nameZh="challengeZh" label={t.projects.challenge} defaultValueEn={initialData?.challengeEn} defaultValueZh={initialData?.challengeZh} rows={3} tooltip={t.projects.tooltips.challenge} />
          <BilingualTextarea nameEn="solutionEn" nameZh="solutionZh" label={t.projects.solution} defaultValueEn={initialData?.solutionEn} defaultValueZh={initialData?.solutionZh} rows={3} tooltip={t.projects.tooltips.solution} />
          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.projects.badge} defaultValueEn={initialData?.badgeEn} defaultValueZh={initialData?.badgeZh} tooltip={t.projects.tooltips.badge} />

          {/* Images */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.projects.images}
              </span>
              <Tooltip content={t.projects.tooltips.images} />
            </div>

            {/* Batch upload drop zone */}
            {editing && (
              <button
                type="button"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                style={{
                  width: '100%',
                  marginBottom: '0.75rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `2px dashed ${isDragging ? GOLD : uploading ? GOLD : TEXT_MID}`,
                  backgroundColor: isDragging ? 'rgba(200, 146, 42, 0.08)' : CARD,
                  textAlign: 'center',
                  cursor: uploading ? 'wait' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease',
                  transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
                aria-label={t.upload.clickOrDrag}
                disabled={uploading}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                  multiple
                  onChange={(e) => e.target.files && handleBatchUpload(e.target.files)}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
                <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
                  {uploading ? t.upload.uploading : t.upload.clickOrDrag}
                </div>
                <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                  {t.upload.formatHint}
                </div>
              </button>
            )}

            {uploadError && (
              <div role="alert" style={{ color: ERROR, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                {uploadError}
              </div>
            )}

            {images.map((img, idx) => (
              <div key={img.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {/* Square preview */}
                  {img.url && (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        flexShrink: 0,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0',
                        boxShadow: neu(2),
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAssetUrl(img.url)}
                        alt={img.altEn || `Image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input name={`images[${idx}].url`} value={img.url} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], url: e.target.value }; setImages(n); }} placeholder={t.projects.imageUrl} aria-label={`Image ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                    <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', marginBottom: '0.375rem' }}>
                      <div>
                        <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                          <span role="img" aria-label="English">🇺🇸</span> {t.projects.altEn}
                        </label>
                        <input name={`images[${idx}].altEn`} value={img.altEn} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altEn: e.target.value }; setImages(n); }} placeholder={t.projects.altEn} aria-label={`Image ${idx + 1} alt text (English)`} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                          <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.altZh}
                        </label>
                        <input name={`images[${idx}].altZh`} value={img.altZh} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], altZh: e.target.value }; setImages(n); }} placeholder={t.projects.altZh} aria-label={`Image ${idx + 1} alt text (Chinese)`} style={fieldStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: NAVY }}>
                        <input type="checkbox" checked={img.isBefore} onChange={(e) => { const n = [...images]; n[idx] = { ...n[idx], isBefore: e.target.checked }; setImages(n); }} />
                        <input type="hidden" name={`images[${idx}].isBefore`} value={String(img.isBefore)} />
                        {t.projects.before}
                      </label>
                      {editing && images.length > 1 && (
                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} aria-label={`Remove image ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                          {t.common.remove}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.projects.serviceScope}
              </span>
              <Tooltip content={t.projects.tooltips.serviceScope} />
            </div>
            {scopes.map((scope, idx) => (
              <div key={scope.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.375rem' }}>
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="English">🇺🇸</span> {t.projects.scopeEn}
                    </label>
                    <input name={`scopes[${idx}].en`} value={scope.en} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], en: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeEn} aria-label={`Scope ${idx + 1} (English)`} style={fieldStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.scopeZh}
                    </label>
                    <input name={`scopes[${idx}].zh`} value={scope.zh} onChange={(e) => { const n = [...scopes]; n[idx] = { ...n[idx], zh: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeZh} aria-label={`Scope ${idx + 1} (Chinese)`} style={fieldStyle} />
                  </div>
                </div>
                {editing && scopes.length > 1 && (
                  <button type="button" onClick={() => setScopes(scopes.filter((_, i) => i !== idx))} aria-label={`Remove scope ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    {t.common.remove}
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

          {/* External Products */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.projects.externalProducts}
              </span>
              <Tooltip content={t.projects.tooltips.externalProducts} />
            </div>
            {externalProducts.map((ep, idx) => (
              <div key={ep.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.375rem' }}>
                <input name={`externalProducts[${idx}].url`} value={ep.url} onChange={(e) => { const n = [...externalProducts]; n[idx] = { ...n[idx], url: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productUrl} aria-label={`Product ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                <input name={`externalProducts[${idx}].imageUrl`} value={ep.imageUrl} onChange={(e) => { const n = [...externalProducts]; n[idx] = { ...n[idx], imageUrl: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productImageUrl} aria-label={`Product ${idx + 1} image URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="English">🇺🇸</span> {t.projects.productLabelEn}
                    </label>
                    <input name={`externalProducts[${idx}].labelEn`} value={ep.labelEn} onChange={(e) => { const n = [...externalProducts]; n[idx] = { ...n[idx], labelEn: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productLabelEn} aria-label={`Product ${idx + 1} label (English)`} style={fieldStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.productLabelZh}
                    </label>
                    <input name={`externalProducts[${idx}].labelZh`} value={ep.labelZh} onChange={(e) => { const n = [...externalProducts]; n[idx] = { ...n[idx], labelZh: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productLabelZh} aria-label={`Product ${idx + 1} label (Chinese)`} style={fieldStyle} />
                  </div>
                </div>
                {editing && (
                  <button type="button" onClick={() => setExternalProducts(externalProducts.filter((_, i) => i !== idx))} aria-label={`Remove product ${idx + 1}`} style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                    {t.common.remove}
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setExternalProducts([...externalProducts, { id: crypto.randomUUID(), url: '', imageUrl: '', labelEn: '', labelZh: '' }])} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                {t.projects.addExternalProduct}
              </button>
            )}
          </div>

          {/* Site Settings (Required) */}
          {hideSiteSelector && fixedSiteId ? (
            <input type="hidden" name="siteId" value={fixedSiteId} />
          ) : (
            <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                {t.projects.siteSettings}
              </div>
              <FormField label={t.projects.linkedSite}>
                <SearchableSelect
                  name="siteId"
                  options={siteOptions}
                  value={selectedSiteId}
                  onChange={setSelectedSiteId}
                  placeholder={t.projects.selectSite}
                  noResultsText={t.common.noRecords}
                  disabled={!editing}
                />
              </FormField>
            </div>
          )}

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
            <SubmitButton isPending={isPending} label={submitLabel} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
