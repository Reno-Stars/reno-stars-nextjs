'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualInput from '@/components/admin/BilingualInput';
import AIContentEditor from '@/components/admin/AIContentEditor';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useSaveWarning } from '@/hooks/useSaveWarning';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

/** Project summary for the dropdown */
export interface ProjectOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface BlogPostFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    slug: string;
    titleEn: string;
    titleZh: string;
    excerptEn: string;
    excerptZh: string;
    contentEn: string;
    contentZh: string;
    featuredImageUrl: string;
    author: string;
    isPublished: boolean;
    publishedAt: string;
    projectId?: string;
    // SEO fields
    metaTitleEn?: string;
    metaTitleZh?: string;
    metaDescriptionEn?: string;
    metaDescriptionZh?: string;
    focusKeywordEn?: string;
    focusKeywordZh?: string;
    seoKeywordsEn?: string;
    seoKeywordsZh?: string;
    readingTimeMinutes?: number;
  };
  /** Available projects for the related project dropdown */
  projects?: ProjectOption[];
  submitLabel?: string;
}

export default function BlogPostForm({ action, initialData, projects = [], submitLabel }: BlogPostFormProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [selectedProjectId, setSelectedProjectId] = useState(initialData?.projectId ?? '');
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.blog.saved);

  // Dirty form tracking — warns before navigating away with unsaved changes
  const [dirty, setDirty] = useState(false);
  useBeforeUnload(dirty);
  useEffect(() => { if (state.success) setDirty(false); }, [state.success]);

  // Pre-save warning
  const { showWarning, missingFields, requestSave, confirm: confirmSave, cancel: cancelSave } = useSaveWarning(formAction);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const missing: string[] = [];
    if (!fd.get('featuredImageUrl')) missing.push(t.blog.heroImage);
    if (!fd.get('excerptEn') && !fd.get('excerptZh')) missing.push(t.blog.excerpt);
    if (!fd.get('metaTitleEn') && !fd.get('metaTitleZh')) missing.push(t.blog.metaTitle);
    if (!fd.get('metaDescriptionEn') && !fd.get('metaDescriptionZh')) missing.push(t.blog.metaDescription);
    if (!fd.get('focusKeywordEn') && !fd.get('focusKeywordZh')) missing.push(t.blog.focusKeyword);
    if (!fd.get('seoKeywordsEn') && !fd.get('seoKeywordsZh')) missing.push(t.blog.seoKeywords);

    requestSave(fd, missing);
  }, [requestSave, t]);

  // Sync selectedProjectId when initialData changes (after save + revalidation)
  useEffect(() => {
    setSelectedProjectId(initialData?.projectId ?? '');
  }, [initialData?.projectId]);

  // Convert projects to SearchableSelect options format
  const projectOptions = useMemo(() =>
    projects.map((p) => ({
      id: p.id,
      label: locale === 'zh' ? `${p.titleZh} / ${p.titleEn}` : `${p.titleEn} / ${p.titleZh}`,
    })),
    [projects, locale]
  );

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
        {isEdit && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label={t.blog.slugLabel} htmlFor="slug">
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.blog.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.blog.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required />

          <AIContentEditor
            nameContentEn="contentEn"
            nameContentZh="contentZh"
            nameExcerptEn="excerptEn"
            nameExcerptZh="excerptZh"
            defaultContentEn={initialData?.contentEn}
            defaultContentZh={initialData?.contentZh}
            defaultExcerptEn={initialData?.excerptEn}
            defaultExcerptZh={initialData?.excerptZh}
            defaultSeo={{
              metaTitleEn: initialData?.metaTitleEn,
              metaTitleZh: initialData?.metaTitleZh,
              metaDescriptionEn: initialData?.metaDescriptionEn,
              metaDescriptionZh: initialData?.metaDescriptionZh,
              focusKeywordEn: initialData?.focusKeywordEn,
              focusKeywordZh: initialData?.focusKeywordZh,
              seoKeywordsEn: initialData?.seoKeywordsEn,
              seoKeywordsZh: initialData?.seoKeywordsZh,
              readingTimeMinutes: initialData?.readingTimeMinutes,
            }}
            label={t.blog.content}
            excerptLabel={t.blog.excerpt}
            required
            disabled={!editing}
          />

          <ImageUrlInput name="featuredImageUrl" label={t.blog.heroImage} defaultValue={initialData?.featuredImageUrl ?? ''} />

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.blog.authorLabel} htmlFor="author">
              <input id="author" name="author" defaultValue={initialData?.author ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label={t.blog.publishedAt} htmlFor="publishedAt">
              <input id="publishedAt" name="publishedAt" type="date" defaultValue={initialData?.publishedAt ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          {projects.length > 0 && (
            <FormField label={t.blog.relatedProject}>
              <SearchableSelect
                name="projectId"
                options={projectOptions}
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                placeholder={t.blog.selectProject}
                noResultsText={t.common.noRecords}
                disabled={!editing}
              />
            </FormField>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={initialData?.isPublished ?? false} />
              {t.blog.publishedLabel}
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
