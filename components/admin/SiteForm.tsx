'use client';

import { useState, useEffect, useCallback } from 'react';
import { useActionState } from 'react';
import AISiteGenerator from './AISiteGenerator';
import type { SiteDescription } from '@/lib/ai/content-optimizer';
import AIBilingualTextarea from './AIBilingualTextarea';
import BilingualInput from './BilingualInput';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import ImagePairEditor, { ImagePairEntry } from './ImagePairEditor';
import Tooltip from './Tooltip';
import { useFormToast } from './useFormToast';
import { inputStyle, readOnlyStyle } from './shared-styles';
import SubmitButton from './SubmitButton';
import { SEO_META_TITLE_MAX, SEO_META_DESCRIPTION_MAX, SEO_FOCUS_KEYWORD_MAX } from '@/lib/db/schema';
import { CARD, NAVY, GOLD, SURFACE, TEXT_MID, neu, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';
import { useSaveWarning } from '@/hooks/useSaveWarning';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

interface City {
  nameEn: string;
  nameZh: string;
}

interface SiteFormProps {
  action: (
    prevState: { success?: boolean; error?: string; renamedSlug?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string; renamedSlug?: string }>;
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
    excerptEn?: string;
    excerptZh?: string;
    metaTitleEn?: string;
    metaTitleZh?: string;
    metaDescriptionEn?: string;
    metaDescriptionZh?: string;
    focusKeywordEn?: string;
    focusKeywordZh?: string;
    seoKeywordsEn?: string;
    seoKeywordsZh?: string;
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
  useFormToast(state, t.sites.saved, { slugRenameLabel: t.common.slugRenamed });

  // Dirty form tracking — warns before navigating away with unsaved changes
  const [dirty, setDirty] = useState(false);
  useBeforeUnload(dirty);
  useEffect(() => { if (state.success) setDirty(false); }, [state.success]);

  const [siteImagePairs, setSiteImagePairs] = useState<ImagePairEntry[]>(
    initialData?.imagePairs?.map((p) => ({ ...p, id: crypto.randomUUID() })) ?? []
  );

  // State for AI-generated text fields
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? '');
  const [titleZh, setTitleZh] = useState(initialData?.titleZh ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? '');
  const [descriptionZh, setDescriptionZh] = useState(initialData?.descriptionZh ?? '');
  const [badgeEn, setBadgeEn] = useState(initialData?.badgeEn ?? '');
  const [badgeZh, setBadgeZh] = useState(initialData?.badgeZh ?? '');
  const [excerptEn, setExcerptEn] = useState(initialData?.excerptEn ?? '');
  const [excerptZh, setExcerptZh] = useState(initialData?.excerptZh ?? '');
  // SEO fields state
  const [metaTitleEn, setMetaTitleEn] = useState(initialData?.metaTitleEn ?? '');
  const [metaTitleZh, setMetaTitleZh] = useState(initialData?.metaTitleZh ?? '');
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(initialData?.metaDescriptionEn ?? '');
  const [metaDescriptionZh, setMetaDescriptionZh] = useState(initialData?.metaDescriptionZh ?? '');
  const [focusKeywordEn, setFocusKeywordEn] = useState(initialData?.focusKeywordEn ?? '');
  const [focusKeywordZh, setFocusKeywordZh] = useState(initialData?.focusKeywordZh ?? '');
  const [seoKeywordsEn, setSeoKeywordsEn] = useState(initialData?.seoKeywordsEn ?? '');
  const [seoKeywordsZh, setSeoKeywordsZh] = useState(initialData?.seoKeywordsZh ?? '');

  // Sync state when initialData changes (after save + revalidation)
  useEffect(() => {
    setSlug(initialData?.slug ?? '');
    setSelectedCity(initialData?.locationCity ?? '');
    setTitleEn(initialData?.titleEn ?? '');
    setTitleZh(initialData?.titleZh ?? '');
    setDescriptionEn(initialData?.descriptionEn ?? '');
    setDescriptionZh(initialData?.descriptionZh ?? '');
    setBadgeEn(initialData?.badgeEn ?? '');
    setBadgeZh(initialData?.badgeZh ?? '');
    setExcerptEn(initialData?.excerptEn ?? '');
    setExcerptZh(initialData?.excerptZh ?? '');
    setMetaTitleEn(initialData?.metaTitleEn ?? '');
    setMetaTitleZh(initialData?.metaTitleZh ?? '');
    setMetaDescriptionEn(initialData?.metaDescriptionEn ?? '');
    setMetaDescriptionZh(initialData?.metaDescriptionZh ?? '');
    setFocusKeywordEn(initialData?.focusKeywordEn ?? '');
    setFocusKeywordZh(initialData?.focusKeywordZh ?? '');
    setSeoKeywordsEn(initialData?.seoKeywordsEn ?? '');
    setSeoKeywordsZh(initialData?.seoKeywordsZh ?? '');
  }, [initialData]);

  // Callback for AI site generator
  const handleAIGenerate = useCallback((data: Omit<SiteDescription, 'detectedLanguage'>) => {
    setSlug(data.slug);
    setTitleEn(data.titleEn);
    setTitleZh(data.titleZh);
    // Match AI-generated city against available dropdown options (case-insensitive)
    if (data.locationCity) {
      const match = cities.find((c) => c.nameEn.toLowerCase() === data.locationCity.toLowerCase());
      if (match) setSelectedCity(match.nameEn);
    }
    setDescriptionEn(data.descriptionEn);
    setDescriptionZh(data.descriptionZh);
    setBadgeEn(data.badgeEn);
    setBadgeZh(data.badgeZh);
    setExcerptEn(data.excerptEn);
    setExcerptZh(data.excerptZh);
    setMetaTitleEn(data.metaTitleEn);
    setMetaTitleZh(data.metaTitleZh);
    setMetaDescriptionEn(data.metaDescriptionEn);
    setMetaDescriptionZh(data.metaDescriptionZh);
    setFocusKeywordEn(data.focusKeywordEn);
    setFocusKeywordZh(data.focusKeywordZh);
    setSeoKeywordsEn(data.seoKeywordsEn);
    setSeoKeywordsZh(data.seoKeywordsZh);
  }, [cities]);

  // Pre-save warning
  const { showWarning, missingFields, requestSave, confirm: confirmSave, cancel: cancelSave } = useSaveWarning(formAction);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const missing: string[] = [];
    if (!fd.get('heroImageUrl')) missing.push(t.sites.heroImageUrl);
    if (siteImagePairs.length === 0) missing.push(t.imagePairs.title);
    if (!fd.get('locationCity')) missing.push(t.sites.locationCity);
    if (!fd.get('badgeEn') && !fd.get('badgeZh')) missing.push(t.sites.badge);
    if (!fd.get('excerptEn') && !fd.get('excerptZh')) missing.push(t.sites.excerpt);
    if (!fd.get('metaTitleEn') && !fd.get('metaTitleZh')) missing.push(t.sites.metaTitle);
    if (!fd.get('metaDescriptionEn') && !fd.get('metaDescriptionZh')) missing.push(t.sites.metaDescription);
    if (!fd.get('focusKeywordEn') && !fd.get('focusKeywordZh')) missing.push(t.sites.focusKeyword);
    if (!fd.get('seoKeywordsEn') && !fd.get('seoKeywordsZh')) missing.push(t.sites.seoKeywords);

    requestSave(fd, missing);
  }, [siteImagePairs.length, requestSave, t]);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)}>
      <ConfirmDialog
        open={showWarning}
        title={t.common.saveWarningTitle}
        message={t.common.saveWarningMessage}
        items={missingFields}
        variant="warning"
        confirmLabel={t.common.saveAnyway}
        onConfirm={confirmSave}
        onCancel={cancelSave}
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
          {/* AI Site Generator - only show when editing */}
          {editing && (
            <AISiteGenerator onGenerate={handleAIGenerate} />
          )}

          <FormField label={t.sites.slug} htmlFor="slug" tooltip={t.sites.tooltips.slug}>
            <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required style={fieldStyle} placeholder={t.sites.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.sites.titleLabel} valueEn={titleEn} onChangeEn={setTitleEn} valueZh={titleZh} onChangeZh={setTitleZh} required tooltip={t.sites.tooltips.title} />

          <AIBilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.sites.description} defaultValueEn={descriptionEn} defaultValueZh={descriptionZh} required rows={6} tooltip={t.sites.tooltips.description} disabled={!editing} />

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

          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.sites.badge} valueEn={badgeEn} onChangeEn={setBadgeEn} valueZh={badgeZh} onChangeZh={setBadgeZh} tooltip={t.sites.tooltips.badge} />

          {/* SEO Settings */}
          <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.sites.seoSettings}
              </span>
              <Tooltip content={t.sites.tooltips.seoSettings} />
            </div>

            <BilingualInput
              nameEn="metaTitleEn"
              nameZh="metaTitleZh"
              label={t.sites.metaTitle}
              valueEn={metaTitleEn}
              onChangeEn={setMetaTitleEn}
              valueZh={metaTitleZh}
              onChangeZh={setMetaTitleZh}
              tooltip={t.sites.tooltips.metaTitle}
              maxLength={SEO_META_TITLE_MAX}
            />
            <BilingualInput
              nameEn="metaDescriptionEn"
              nameZh="metaDescriptionZh"
              label={t.sites.metaDescription}
              valueEn={metaDescriptionEn}
              onChangeEn={setMetaDescriptionEn}
              valueZh={metaDescriptionZh}
              onChangeZh={setMetaDescriptionZh}
              tooltip={t.sites.tooltips.metaDescription}
              maxLength={SEO_META_DESCRIPTION_MAX}
            />
            <BilingualInput
              nameEn="focusKeywordEn"
              nameZh="focusKeywordZh"
              label={t.sites.focusKeyword}
              valueEn={focusKeywordEn}
              onChangeEn={setFocusKeywordEn}
              valueZh={focusKeywordZh}
              onChangeZh={setFocusKeywordZh}
              tooltip={t.sites.tooltips.focusKeyword}
              maxLength={SEO_FOCUS_KEYWORD_MAX}
            />
            <BilingualInput
              nameEn="seoKeywordsEn"
              nameZh="seoKeywordsZh"
              label={t.sites.seoKeywords}
              valueEn={seoKeywordsEn}
              onChangeEn={setSeoKeywordsEn}
              valueZh={seoKeywordsZh}
              onChangeZh={setSeoKeywordsZh}
              tooltip={t.sites.tooltips.seoKeywords}
            />
            <AIBilingualTextarea nameEn="excerptEn" nameZh="excerptZh" label={t.sites.excerpt} defaultValueEn={excerptEn} defaultValueZh={excerptZh} rows={2} tooltip={t.sites.tooltips.excerpt} disabled={!editing} />
          </div>

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
