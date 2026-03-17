'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useActionState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualTextarea from './BilingualTextarea';
import AIProjectGenerator from './AIProjectGenerator';
import type { ProjectDescription } from '@/lib/ai/content-optimizer';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';
import ImageUrlInput from './ImageUrlInput';
import ImagePairEditor, { ImagePairEntry } from './ImagePairEditor';
import Tooltip from './Tooltip';
import SearchableSelect from './SearchableSelect';
import { useFormToast } from './useFormToast';
import SubmitButton from './SubmitButton';
import { inputStyle, readOnlyStyle } from './shared-styles';
import { SPACE_TYPES } from '@/lib/admin/constants';
import { SEO_META_TITLE_MAX, SEO_META_DESCRIPTION_MAX, SEO_FOCUS_KEYWORD_MAX } from '@/lib/db/schema';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from './AdminLocaleProvider';
import EditModeToggle from './EditModeToggle';
import { useSaveWarning } from '@/hooks/useSaveWarning';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

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

interface ServiceOption {
  slug: string;
  titleEn: string;
  titleZh: string;
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
    prevState: { success?: boolean; error?: string; renamedSlug?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string; renamedSlug?: string }>;
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
    excerptEn: string;
    excerptZh: string;
    poNumber?: string;
    metaTitleEn: string;
    metaTitleZh: string;
    metaDescriptionEn: string;
    metaDescriptionZh: string;
    focusKeywordEn: string;
    focusKeywordZh: string;
    seoKeywordsEn: string;
    seoKeywordsZh: string;
    featured: boolean;
    isPublished: boolean;
    siteId: string | null;
    imagePairs?: Omit<ImagePairEntry, 'id'>[];
    scopes: Omit<ScopeEntry, 'id'>[];
    externalProducts?: Omit<ExternalProductEntry, 'id'>[];
  };
  /** Available service types from the DB */
  services?: ServiceOption[];
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
  services = [],
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
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [selectedServiceType, setSelectedServiceType] = useState(initialData?.serviceType ?? 'kitchen');
  const [selectedLocationCity, setSelectedLocationCity] = useState(initialData?.locationCity ?? '');
  const [selectedSpaceType, setSelectedSpaceType] = useState(initialData?.spaceTypeEn ?? '');
  const [selectedSiteId, setSelectedSiteId] = useState(initialData?.siteId ?? '');
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.projects.saved, { slugRenameLabel: t.common.slugRenamed });

  // Dirty form tracking — warns before navigating away with unsaved changes
  const [dirty, setDirty] = useState(false);
  useBeforeUnload(dirty);
  useEffect(() => { if (state.success) setDirty(false); }, [state.success]);

  // State for AI-generated text fields
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? '');
  const [titleZh, setTitleZh] = useState(initialData?.titleZh ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? '');
  const [descriptionZh, setDescriptionZh] = useState(initialData?.descriptionZh ?? '');
  const [challengeEn, setChallengeEn] = useState(initialData?.challengeEn ?? '');
  const [challengeZh, setChallengeZh] = useState(initialData?.challengeZh ?? '');
  const [solutionEn, setSolutionEn] = useState(initialData?.solutionEn ?? '');
  const [solutionZh, setSolutionZh] = useState(initialData?.solutionZh ?? '');
  const [badgeEn, setBadgeEn] = useState(initialData?.badgeEn ?? '');
  const [badgeZh, setBadgeZh] = useState(initialData?.badgeZh ?? '');
  // SEO fields state
  const [metaTitleEn, setMetaTitleEn] = useState(initialData?.metaTitleEn ?? '');
  const [metaTitleZh, setMetaTitleZh] = useState(initialData?.metaTitleZh ?? '');
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(initialData?.metaDescriptionEn ?? '');
  const [metaDescriptionZh, setMetaDescriptionZh] = useState(initialData?.metaDescriptionZh ?? '');
  const [focusKeywordEn, setFocusKeywordEn] = useState(initialData?.focusKeywordEn ?? '');
  const [focusKeywordZh, setFocusKeywordZh] = useState(initialData?.focusKeywordZh ?? '');
  const [seoKeywordsEn, setSeoKeywordsEn] = useState(initialData?.seoKeywordsEn ?? '');
  const [seoKeywordsZh, setSeoKeywordsZh] = useState(initialData?.seoKeywordsZh ?? '');
  // Fields that AI can also populate
  const [poNumber, setPoNumber] = useState(initialData?.poNumber ?? '');
  const [budgetMin, setBudgetMin] = useState(initialData?.budgetMin ?? '');
  const [budgetMax, setBudgetMax] = useState(initialData?.budgetMax ?? '');
  const [durationEn, setDurationEn] = useState(initialData?.durationEn ?? '');
  const [durationZh, setDurationZh] = useState(initialData?.durationZh ?? '');
  const [excerptEn, setExcerptEn] = useState(initialData?.excerptEn ?? '');
  const [excerptZh, setExcerptZh] = useState(initialData?.excerptZh ?? '');

  // Sync state when initialData changes (after save + revalidation)
  useEffect(() => {
    setSlug(initialData?.slug ?? '');
    setSelectedServiceType(initialData?.serviceType ?? 'kitchen');
    setSelectedLocationCity(initialData?.locationCity ?? '');
    setSelectedSpaceType(initialData?.spaceTypeEn ?? '');
    setSelectedSiteId(initialData?.siteId ?? '');
    setTitleEn(initialData?.titleEn ?? '');
    setTitleZh(initialData?.titleZh ?? '');
    setDescriptionEn(initialData?.descriptionEn ?? '');
    setDescriptionZh(initialData?.descriptionZh ?? '');
    setChallengeEn(initialData?.challengeEn ?? '');
    setChallengeZh(initialData?.challengeZh ?? '');
    setSolutionEn(initialData?.solutionEn ?? '');
    setSolutionZh(initialData?.solutionZh ?? '');
    setBadgeEn(initialData?.badgeEn ?? '');
    setBadgeZh(initialData?.badgeZh ?? '');
    setMetaTitleEn(initialData?.metaTitleEn ?? '');
    setMetaTitleZh(initialData?.metaTitleZh ?? '');
    setMetaDescriptionEn(initialData?.metaDescriptionEn ?? '');
    setMetaDescriptionZh(initialData?.metaDescriptionZh ?? '');
    setFocusKeywordEn(initialData?.focusKeywordEn ?? '');
    setFocusKeywordZh(initialData?.focusKeywordZh ?? '');
    setSeoKeywordsEn(initialData?.seoKeywordsEn ?? '');
    setSeoKeywordsZh(initialData?.seoKeywordsZh ?? '');
    setPoNumber(initialData?.poNumber ?? '');
    setBudgetMin(initialData?.budgetMin ?? '');
    setBudgetMax(initialData?.budgetMax ?? '');
    setDurationEn(initialData?.durationEn ?? '');
    setDurationZh(initialData?.durationZh ?? '');
    setExcerptEn(initialData?.excerptEn ?? '');
    setExcerptZh(initialData?.excerptZh ?? '');
  }, [initialData]);

  // Callback for AI project generator
  const handleAIGenerate = useCallback((data: Omit<ProjectDescription, 'detectedLanguage'>) => {
    setSlug(data.slug);
    setTitleEn(data.titleEn);
    setTitleZh(data.titleZh);
    // Match AI-generated city against available dropdown options (case-insensitive)
    if (data.locationCity) {
      const match = cities.find((c) => c.nameEn.toLowerCase() === data.locationCity.toLowerCase());
      if (match) setSelectedLocationCity(match.nameEn);
    }
    setDescriptionEn(data.descriptionEn);
    setDescriptionZh(data.descriptionZh);
    setChallengeEn(data.challengeEn);
    setChallengeZh(data.challengeZh);
    setSolutionEn(data.solutionEn);
    setSolutionZh(data.solutionZh);
    setBadgeEn(data.badgeEn);
    setBadgeZh(data.badgeZh);
    if (data.excerptEn) setExcerptEn(data.excerptEn);
    if (data.excerptZh) setExcerptZh(data.excerptZh);
    if (data.durationEn) setDurationEn(data.durationEn);
    if (data.durationZh) setDurationZh(data.durationZh);
    // Parse AI budget string (e.g., "$22,000" or "$15,000 - $25,000") into min/max
    if (data.budgetRange) {
      const nums = data.budgetRange.match(/[\d,]+/g)?.map((s) => s.replace(/,/g, '')) ?? [];
      if (nums.length >= 2) {
        setBudgetMin(nums[0]);
        setBudgetMax(nums[1]);
      } else if (nums.length === 1) {
        setBudgetMin(nums[0]);
        setBudgetMax(nums[0]);
      }
    }
    setMetaTitleEn(data.metaTitleEn);
    setMetaTitleZh(data.metaTitleZh);
    setMetaDescriptionEn(data.metaDescriptionEn);
    setMetaDescriptionZh(data.metaDescriptionZh);
    setFocusKeywordEn(data.focusKeywordEn);
    setFocusKeywordZh(data.focusKeywordZh);
    setSeoKeywordsEn(data.seoKeywordsEn);
    setSeoKeywordsZh(data.seoKeywordsZh);
    if (data.poNumber) setPoNumber(data.poNumber);
    if (data.serviceType) setSelectedServiceType(data.serviceType);
  }, [cities]);

  // Convert sites to SearchableSelect options format
  const siteOptions = useMemo(() =>
    sites.map((s) => ({
      id: s.id,
      label: locale === 'zh' ? `${s.titleZh} / ${s.titleEn}` : `${s.titleEn} / ${s.titleZh}`,
    })),
    [sites, locale]
  );

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const [imagePairs, setImagePairs] = useState<ImagePairEntry[]>(
    initialData?.imagePairs?.map((p) => ({ ...p, id: crypto.randomUUID() })) ?? []
  );
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    initialData?.scopes.map((s) => ({ ...s, id: crypto.randomUUID() })) ?? [{ id: crypto.randomUUID(), en: '', zh: '' }]
  );
  const [externalProducts, setExternalProducts] = useState<ExternalProductEntry[]>(
    initialData?.externalProducts?.map((ep) => ({ ...ep, id: crypto.randomUUID() })) ?? []
  );

  const COLLAPSE_THRESHOLD = 3;
  const [showAllScopes, setShowAllScopes] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Pre-save warning
  const { showWarning, missingFields, requestSave, confirm: confirmSave, cancel: cancelSave } = useSaveWarning(formAction);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const missing: string[] = [];
    if (!fd.get('heroImageUrl')) missing.push(t.projects.heroImageUrl);
    if (imagePairs.length === 0) missing.push(t.imagePairs.title);
    if (!fd.get('challengeEn') && !fd.get('challengeZh')) missing.push(t.projects.challenge);
    if (!fd.get('solutionEn') && !fd.get('solutionZh')) missing.push(t.projects.solution);
    if (!fd.get('locationCity')) missing.push(t.projects.locationCity);
    if (!fd.get('budgetMin') && !fd.get('budgetMax')) missing.push(t.projects.budgetRange);
    if (!fd.get('durationEn') && !fd.get('durationZh')) missing.push(t.projects.duration);
    if (!fd.get('badgeEn') && !fd.get('badgeZh')) missing.push(t.projects.badge);
    if (!fd.get('metaTitleEn') && !fd.get('metaTitleZh')) missing.push(t.projects.metaTitle);
    if (!fd.get('metaDescriptionEn') && !fd.get('metaDescriptionZh')) missing.push(t.projects.metaDescription);
    if (!fd.get('focusKeywordEn') && !fd.get('focusKeywordZh')) missing.push(t.projects.focusKeyword);
    if (!fd.get('seoKeywordsEn') && !fd.get('seoKeywordsZh')) missing.push(t.projects.seoKeywords);
    if (!fd.get('excerptEn') && !fd.get('excerptZh')) missing.push(t.projects.excerpt);

    requestSave(fd, missing);
  }, [imagePairs.length, requestSave, t]);

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
        {isEdit && <EditModeToggle editing={editing} setEditing={setEditing} />}

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
          {/* AI Project Generator - only show when editing */}
          {editing && (
            <AIProjectGenerator onGenerate={handleAIGenerate} />
          )}

          <FormField label={t.projects.slug} htmlFor="slug" tooltip={t.projects.tooltips.slug}>
            <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required style={fieldStyle} placeholder={t.projects.slugPlaceholder} />
          </FormField>

          <FormField label={t.projects.poNumber} htmlFor="poNumber" tooltip={t.projects.tooltips.poNumber}>
            <input id="poNumber" name="poNumber" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} style={fieldStyle} placeholder="PO-12345" />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.projects.titleLabel} valueEn={titleEn} onChangeEn={setTitleEn} valueZh={titleZh} onChangeZh={setTitleZh} required tooltip={t.projects.tooltips.title} />

          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.projects.description} valueEn={descriptionEn} onChangeEn={setDescriptionEn} valueZh={descriptionZh} onChangeZh={setDescriptionZh} required rows={6} tooltip={t.projects.tooltips.description} disabled={!editing} />

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.projects.serviceType} htmlFor="serviceType" tooltip={t.projects.tooltips.serviceType}>
              <select id="serviceType" name="serviceType" value={selectedServiceType} onChange={(e) => setSelectedServiceType(e.target.value)} style={fieldStyle}>
                {services.map((svc) => (
                  <option key={svc.slug} value={svc.slug}>
                    {locale === 'zh' ? svc.titleZh : svc.titleEn}
                  </option>
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
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
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
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  style={{ ...fieldStyle, paddingLeft: '1.5rem' }}
                  placeholder="25000"
                />
              </div>
            </div>
          </FormField>

          <BilingualInput nameEn="durationEn" nameZh="durationZh" label={t.projects.duration} valueEn={durationEn} onChangeEn={setDurationEn} valueZh={durationZh} onChangeZh={setDurationZh} tooltip={t.projects.tooltips.duration} />

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

          <ImageUrlInput name="heroImageUrl" label={t.projects.heroImageUrl} defaultValue={initialData?.heroImageUrl ?? ''} tooltip={t.projects.tooltips.heroImage} slug={slug} disabled={!editing} />

          <BilingualTextarea nameEn="challengeEn" nameZh="challengeZh" label={t.projects.challenge} valueEn={challengeEn} onChangeEn={setChallengeEn} valueZh={challengeZh} onChangeZh={setChallengeZh} rows={3} tooltip={t.projects.tooltips.challenge} disabled={!editing} />
          <BilingualTextarea nameEn="solutionEn" nameZh="solutionZh" label={t.projects.solution} valueEn={solutionEn} onChangeEn={setSolutionEn} valueZh={solutionZh} onChangeZh={setSolutionZh} rows={3} tooltip={t.projects.tooltips.solution} disabled={!editing} />
          <BilingualInput nameEn="badgeEn" nameZh="badgeZh" label={t.projects.badge} valueEn={badgeEn} onChangeEn={setBadgeEn} valueZh={badgeZh} onChangeZh={setBadgeZh} tooltip={t.projects.tooltips.badge} />

          {/* SEO Settings */}
          <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.projects.seoSettings}
              </span>
              <Tooltip content={t.projects.tooltips.seoSettings} />
            </div>

            <BilingualInput
              nameEn="metaTitleEn"
              nameZh="metaTitleZh"
              label={t.projects.metaTitle}
              valueEn={metaTitleEn}
              onChangeEn={setMetaTitleEn}
              valueZh={metaTitleZh}
              onChangeZh={setMetaTitleZh}
              tooltip={t.projects.tooltips.metaTitle}
              maxLength={SEO_META_TITLE_MAX}
            />
            <BilingualInput
              nameEn="metaDescriptionEn"
              nameZh="metaDescriptionZh"
              label={t.projects.metaDescription}
              valueEn={metaDescriptionEn}
              onChangeEn={setMetaDescriptionEn}
              valueZh={metaDescriptionZh}
              onChangeZh={setMetaDescriptionZh}
              tooltip={t.projects.tooltips.metaDescription}
              maxLength={SEO_META_DESCRIPTION_MAX}
            />
            <BilingualInput
              nameEn="focusKeywordEn"
              nameZh="focusKeywordZh"
              label={t.projects.focusKeyword}
              valueEn={focusKeywordEn}
              onChangeEn={setFocusKeywordEn}
              valueZh={focusKeywordZh}
              onChangeZh={setFocusKeywordZh}
              tooltip={t.projects.tooltips.focusKeyword}
              maxLength={SEO_FOCUS_KEYWORD_MAX}
            />
            <BilingualInput
              nameEn="seoKeywordsEn"
              nameZh="seoKeywordsZh"
              label={t.projects.seoKeywords}
              valueEn={seoKeywordsEn}
              onChangeEn={setSeoKeywordsEn}
              valueZh={seoKeywordsZh}
              onChangeZh={setSeoKeywordsZh}
              tooltip={t.projects.tooltips.seoKeywords}
            />
            <BilingualTextarea
              nameEn="excerptEn"
              nameZh="excerptZh"
              label={t.projects.excerpt}
              valueEn={excerptEn}
              onChangeEn={setExcerptEn}
              valueZh={excerptZh}
              onChangeZh={setExcerptZh}
              rows={2}
              tooltip={t.projects.tooltips.excerpt}
              disabled={!editing}
            />
          </div>

          {/* Image Pairs */}
          <ImagePairEditor
            namePrefix="imagePairs"
            pairs={imagePairs}
            onChange={setImagePairs}
            editing={editing}
            label={t.imagePairs?.title}
            tooltip={t.imagePairs?.tooltips?.title}
            slug={slug}
          />

          {/* Scopes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
                {t.projects.serviceScope}
              </span>
              <Tooltip content={t.projects.tooltips.serviceScope} />
            </div>
            {/* Hidden inputs for ALL scopes (form submission) */}
            {scopes.map((scope, idx) => (
              <div key={`hidden-scope-${scope.id}`}>
                <input type="hidden" name={`scopes[${idx}].en`} value={scope.en} />
                <input type="hidden" name={`scopes[${idx}].zh`} value={scope.zh} />
              </div>
            ))}
            {/* Visible scope cards */}
            {(showAllScopes ? scopes : scopes.slice(0, COLLAPSE_THRESHOLD)).map((scope, idx) => (
              <div key={scope.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.375rem' }}>
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="English">🇺🇸</span> {t.projects.scopeEn}
                    </label>
                    <input value={scope.en} onChange={(e) => { const n = [...scopes]; const realIdx = scopes.indexOf(scope); n[realIdx] = { ...n[realIdx], en: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeEn} aria-label={`Scope ${idx + 1} (English)`} style={fieldStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.scopeZh}
                    </label>
                    <input value={scope.zh} onChange={(e) => { const n = [...scopes]; const realIdx = scopes.indexOf(scope); n[realIdx] = { ...n[realIdx], zh: e.target.value }; setScopes(n); }} placeholder={t.projects.scopeZh} aria-label={`Scope ${idx + 1} (Chinese)`} style={fieldStyle} />
                  </div>
                </div>
                {editing && scopes.length > 1 && (
                  <button type="button" onClick={() => setScopes(scopes.filter((s) => s.id !== scope.id))} aria-label={`Remove scope ${idx + 1}`} style={{ color: ERROR, background: 'none', border: `1px solid ${ERROR}`, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    {t.common.remove}
                  </button>
                )}
              </div>
            ))}
            {scopes.length > COLLAPSE_THRESHOLD && (
              <button type="button" onClick={() => setShowAllScopes((prev) => !prev)} style={{ color: NAVY, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0', marginBottom: '0.25rem' }}>
                {showAllScopes ? t.common.showLess : t.common.showAll.replace('{count}', String(scopes.length))}
              </button>
            )}
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
            {/* Hidden inputs for ALL products (form submission) */}
            {externalProducts.map((ep, idx) => (
              <div key={`hidden-product-${ep.id}`}>
                <input type="hidden" name={`externalProducts[${idx}].url`} value={ep.url} />
                <input type="hidden" name={`externalProducts[${idx}].imageUrl`} value={ep.imageUrl} />
                <input type="hidden" name={`externalProducts[${idx}].labelEn`} value={ep.labelEn} />
                <input type="hidden" name={`externalProducts[${idx}].labelZh`} value={ep.labelZh} />
              </div>
            ))}
            {/* Visible product cards */}
            {(showAllProducts ? externalProducts : externalProducts.slice(0, COLLAPSE_THRESHOLD)).map((ep, idx) => (
              <div key={ep.id} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.375rem' }}>
                <input value={ep.url} onChange={(e) => { const n = [...externalProducts]; const realIdx = externalProducts.indexOf(ep); n[realIdx] = { ...n[realIdx], url: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productUrl} aria-label={`Product ${idx + 1} URL`} style={{ ...fieldStyle, marginBottom: '0.375rem' }} />
                <ImageUrlInput
                  name={`product-image-${ep.id}`}
                  label={t.projects.productImageUrl}
                  value={ep.imageUrl}
                  onChange={(newUrl) => { const n = [...externalProducts]; const realIdx = externalProducts.indexOf(ep); n[realIdx] = { ...n[realIdx], imageUrl: newUrl }; setExternalProducts(n); }}
                  slug={slug}
                  imageRole={`product-${idx + 1}`}
                  disabled={!editing}
                  hideLabel
                  placeholder={t.projects.productImageUrl}
                />
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="English">🇺🇸</span> {t.projects.productLabelEn}
                    </label>
                    <input value={ep.labelEn} onChange={(e) => { const n = [...externalProducts]; const realIdx = externalProducts.indexOf(ep); n[realIdx] = { ...n[realIdx], labelEn: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productLabelEn} aria-label={`Product ${idx + 1} label (English)`} style={fieldStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      <span role="img" aria-label="Chinese">🇨🇳</span> {t.projects.productLabelZh}
                    </label>
                    <input value={ep.labelZh} onChange={(e) => { const n = [...externalProducts]; const realIdx = externalProducts.indexOf(ep); n[realIdx] = { ...n[realIdx], labelZh: e.target.value }; setExternalProducts(n); }} placeholder={t.projects.productLabelZh} aria-label={`Product ${idx + 1} label (Chinese)`} style={fieldStyle} />
                  </div>
                </div>
                {editing && (
                  <button type="button" onClick={() => setExternalProducts(externalProducts.filter((p) => p.id !== ep.id))} aria-label={`Remove product ${idx + 1}`} style={{ color: ERROR, background: 'none', border: `1px solid ${ERROR}`, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    {t.common.remove}
                  </button>
                )}
              </div>
            ))}
            {externalProducts.length > COLLAPSE_THRESHOLD && (
              <button type="button" onClick={() => setShowAllProducts((prev) => !prev)} style={{ color: NAVY, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0', marginBottom: '0.25rem' }}>
                {showAllProducts ? t.common.showLess : t.common.showAll.replace('{count}', String(externalProducts.length))}
              </button>
            )}
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
