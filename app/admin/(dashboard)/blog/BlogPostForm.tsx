'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, neu } from '@/lib/theme';

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
  };
  submitLabel?: string;
}

export default function BlogPostForm({ action, initialData, submitLabel = 'Save' }: BlogPostFormProps) {
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, 'Blog post saved.');

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
          <FormField label="Slug" htmlFor="slug">
            <input id="slug" name="slug" defaultValue={initialData?.slug ?? ''} required style={fieldStyle} placeholder="my-blog-post" />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label="Title" defaultValueEn={initialData?.titleEn} defaultValueZh={initialData?.titleZh} required />
          <BilingualTextarea nameEn="excerptEn" nameZh="excerptZh" label="Excerpt" defaultValueEn={initialData?.excerptEn} defaultValueZh={initialData?.excerptZh} rows={2} />
          <BilingualTextarea nameEn="contentEn" nameZh="contentZh" label="Content" defaultValueEn={initialData?.contentEn} defaultValueZh={initialData?.contentZh} required rows={10} />

          <ImageUrlInput name="featuredImageUrl" label="Featured Image URL" defaultValue={initialData?.featuredImageUrl ?? ''} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Author" htmlFor="author">
              <input id="author" name="author" defaultValue={initialData?.author ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Published At" htmlFor="publishedAt">
              <input id="publishedAt" name="publishedAt" type="date" defaultValue={initialData?.publishedAt ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <FormField label="SEO Keywords" htmlFor="seoKeywords" hint="Comma-separated">
            <input id="seoKeywords" name="seoKeywords" defaultValue={initialData?.seoKeywords ?? ''} style={fieldStyle} />
          </FormField>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isPublished" defaultChecked={initialData?.isPublished ?? false} />
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
