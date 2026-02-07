'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle, selectStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

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
    seoKeywords: string;
    isPublished: boolean;
    publishedAt: string;
    projectId?: string;
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

  // Sync selectedProjectId when initialData changes (after save + revalidation)
  useEffect(() => {
    setSelectedProjectId(initialData?.projectId ?? '');
  }, [initialData?.projectId]);

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
        {isEdit && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label={t.blog.slugLabel} htmlFor="slug">
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder={t.blog.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.blog.titleLabel} defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required />
          <BilingualTextarea nameEn="excerptEn" nameZh="excerptZh" label={t.blog.excerpt} defaultValueEn={initialData?.excerptEn} defaultValueZh={initialData?.excerptZh} rows={2} />
          <BilingualTextarea nameEn="contentEn" nameZh="contentZh" label={t.blog.content} defaultValueEn={initialData?.contentEn} defaultValueZh={initialData?.contentZh} required rows={10} />

          <ImageUrlInput name="featuredImageUrl" label={t.blog.heroImage} defaultValue={initialData?.featuredImageUrl ?? ''} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.blog.authorLabel} htmlFor="author">
              <input id="author" name="author" defaultValue={initialData?.author ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label={t.blog.publishedAt} htmlFor="publishedAt">
              <input id="publishedAt" name="publishedAt" type="date" defaultValue={initialData?.publishedAt ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <FormField label={t.blog.seoKeywords} htmlFor="seoKeywords" hint="Comma-separated">
            <input id="seoKeywords" name="seoKeywords" defaultValue={initialData?.seoKeywords ?? ''} style={fieldStyle} />
          </FormField>

          {projects.length > 0 && (
            <FormField label={t.blog.relatedProject} htmlFor="projectId">
              <select
                id="projectId"
                name="projectId"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={editing ? selectStyle : readOnlyStyle}
              >
                <option value="">{t.blog.noProject}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {locale === 'zh' ? p.titleZh : p.titleEn}
                  </option>
                ))}
              </select>
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
