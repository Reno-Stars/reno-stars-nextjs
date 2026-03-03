'use client';

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import BilingualInput from '@/components/admin/BilingualInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, SURFACE_ALT, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import {
  generateSocialPostFromBlog,
  generateSocialPostFromProject,
  generateSocialPostFromSite,
  getSourceImages,
  type GeneratedSocialContent,
} from '@/app/actions/admin/social-posts';
import { useToast } from '@/components/admin/ToastProvider';
import { getAssetUrl } from '@/lib/storage';

/** Source option for dropdowns */
export interface SourceOption {
  id: string;
  titleEn: string;
  titleZh: string;
}

interface SocialPostFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    titleEn: string;
    titleZh: string;
    instagramCaptionEn: string | null;
    instagramCaptionZh: string | null;
    instagramHashtagsEn: string | null;
    instagramHashtagsZh: string | null;
    facebookCaptionEn: string | null;
    facebookCaptionZh: string | null;
    facebookHashtagsEn: string | null;
    facebookHashtagsZh: string | null;
    xiaohongshuCaptionZh: string | null;
    xiaohongshuCaptionEn: string | null;
    xiaohongshuTopicTagsZh: string | null;
    selectedImageUrls: string[];
    blogPostId: string | null;
    projectId: string | null;
    siteId: string | null;
    status: string;
    scheduledAt: string | null;
    notes: string | null;
  };
  blogPosts?: SourceOption[];
  projects?: SourceOption[];
  sites?: SourceOption[];
  submitLabelKey?: 'createPost' | 'updatePost';
}

type SourceType = 'none' | 'blog' | 'project' | 'site';
type PlatformTab = 'instagram' | 'facebook' | 'xiaohongshu';
const PLATFORM_TABS: PlatformTab[] = ['instagram', 'facebook', 'xiaohongshu'];

function getInitialSourceType(data?: SocialPostFormProps['initialData']): SourceType {
  if (!data) return 'none';
  if (data.blogPostId) return 'blog';
  if (data.projectId) return 'project';
  if (data.siteId) return 'site';
  return 'none';
}

function getInitialSourceId(data?: SocialPostFormProps['initialData']): string {
  if (!data) return '';
  return data.blogPostId ?? data.projectId ?? data.siteId ?? '';
}

export default function SocialPostForm({
  action,
  initialData,
  blogPosts = [],
  projects = [],
  sites = [],
  submitLabelKey,
}: SocialPostFormProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const { toast } = useToast();
  const isEdit = !!initialData;
  const [editing, setEditing] = useState(!isEdit);

  // Form state
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.socialPosts.saved);

  // Dirty form tracking
  const [dirty, setDirty] = useState(false);
  useBeforeUnload(dirty);
  useEffect(() => { if (state.success) setDirty(false); }, [state.success]);

  // Source selection
  const [sourceType, setSourceType] = useState<SourceType>(getInitialSourceType(initialData));
  const [sourceId, setSourceId] = useState(getInitialSourceId(initialData));

  // Platform tab
  const [activeTab, setActiveTab] = useState<PlatformTab>('instagram');

  // AI-generated content fields (controlled)
  const [instagramCaptionEn, setInstagramCaptionEn] = useState(initialData?.instagramCaptionEn ?? '');
  const [instagramCaptionZh, setInstagramCaptionZh] = useState(initialData?.instagramCaptionZh ?? '');
  const [instagramHashtagsEn, setInstagramHashtagsEn] = useState(initialData?.instagramHashtagsEn ?? '');
  const [instagramHashtagsZh, setInstagramHashtagsZh] = useState(initialData?.instagramHashtagsZh ?? '');
  const [facebookCaptionEn, setFacebookCaptionEn] = useState(initialData?.facebookCaptionEn ?? '');
  const [facebookCaptionZh, setFacebookCaptionZh] = useState(initialData?.facebookCaptionZh ?? '');
  const [facebookHashtagsEn, setFacebookHashtagsEn] = useState(initialData?.facebookHashtagsEn ?? '');
  const [facebookHashtagsZh, setFacebookHashtagsZh] = useState(initialData?.facebookHashtagsZh ?? '');
  const [xiaohongshuCaptionZh, setXiaohongshuCaptionZh] = useState(initialData?.xiaohongshuCaptionZh ?? '');
  const [xiaohongshuCaptionEn, setXiaohongshuCaptionEn] = useState(initialData?.xiaohongshuCaptionEn ?? '');
  const [xiaohongshuTopicTagsZh, setXiaohongshuTopicTagsZh] = useState(initialData?.xiaohongshuTopicTagsZh ?? '');

  // Title fields (controlled for AI population)
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? '');
  const [titleZh, setTitleZh] = useState(initialData?.titleZh ?? '');

  // Selected images
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>(initialData?.selectedImageUrls ?? []);
  const [sourceImages, setSourceImages] = useState<string[]>([]);

  // AI generation state
  const [isGenerating, startGenerateTransition] = useTransition();

  // Load source images when source changes
  useEffect(() => {
    if (sourceType === 'none' || !sourceId) {
      setSourceImages([]);
      return;
    }
    let cancelled = false;
    getSourceImages(sourceType, sourceId).then((result) => {
      if (!cancelled) {
        setSourceImages(result.urls);
      }
    });
    return () => { cancelled = true; };
  }, [sourceType, sourceId]);

  // Source options for dropdown
  const sourceOptions = useMemo(() => {
    const list = sourceType === 'blog' ? blogPosts : sourceType === 'project' ? projects : sourceType === 'site' ? sites : [];
    return list.map((item) => ({
      id: item.id,
      label: locale === 'zh' ? `${item.titleZh} / ${item.titleEn}` : `${item.titleEn} / ${item.titleZh}`,
    }));
  }, [sourceType, blogPosts, projects, sites, locale]);

  const populateFromGenerated = useCallback((data: GeneratedSocialContent) => {
    setTitleEn(data.titleEn);
    setTitleZh(data.titleZh);
    setInstagramCaptionEn(data.instagramCaptionEn);
    setInstagramCaptionZh(data.instagramCaptionZh);
    setInstagramHashtagsEn(data.instagramHashtagsEn);
    setInstagramHashtagsZh(data.instagramHashtagsZh);
    setFacebookCaptionEn(data.facebookCaptionEn);
    setFacebookCaptionZh(data.facebookCaptionZh);
    setFacebookHashtagsEn(data.facebookHashtagsEn);
    setFacebookHashtagsZh(data.facebookHashtagsZh);
    setXiaohongshuCaptionZh(data.xiaohongshuCaptionZh);
    setXiaohongshuCaptionEn(data.xiaohongshuCaptionEn);
    setXiaohongshuTopicTagsZh(data.xiaohongshuTopicTagsZh);
    setDirty(true);
  }, []);

  const handleGenerate = useCallback(() => {
    if (sourceType === 'none' || !sourceId) {
      toast(t.socialPosts.selectSourceFirst, 'error');
      return;
    }

    startGenerateTransition(async () => {
      let result: { success?: true; data: GeneratedSocialContent } | { success?: false; error: string };
      if (sourceType === 'blog') {
        result = await generateSocialPostFromBlog(sourceId);
      } else if (sourceType === 'project') {
        result = await generateSocialPostFromProject(sourceId);
      } else {
        result = await generateSocialPostFromSite(sourceId);
      }

      if ('error' in result) {
        toast(result.error, 'error');
      } else {
        populateFromGenerated(result.data);
        toast(t.socialPosts.generated);
      }
    });
  }, [sourceType, sourceId, toast, t, populateFromGenerated]);

  const toggleImage = useCallback((url: string) => {
    setSelectedImageUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
    setDirty(true);
  }, []);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;
  const textareaStyle = { ...fieldStyle, resize: 'vertical' as const, minHeight: '100px' };

  const tabStyle = (tab: PlatformTab): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom: activeTab === tab ? `2px solid ${GOLD}` : '2px solid transparent',
    backgroundColor: 'transparent',
    color: activeTab === tab ? NAVY : TEXT_MID,
    fontWeight: activeTab === tab ? 600 : 400,
    cursor: 'pointer',
    fontSize: '0.875rem',
  });

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = PLATFORM_TABS.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(PLATFORM_TABS[(idx + 1) % PLATFORM_TABS.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(PLATFORM_TABS[(idx - 1 + PLATFORM_TABS.length) % PLATFORM_TABS.length]);
    }
  }, [activeTab]);

  return (
    <form action={formAction} onChange={() => setDirty(true)}>
      {/* Hidden fields for source FK and selected images */}
      <input type="hidden" name="blogPostId" value={sourceType === 'blog' ? sourceId : ''} />
      <input type="hidden" name="projectId" value={sourceType === 'project' ? sourceId : ''} />
      <input type="hidden" name="siteId" value={sourceType === 'site' ? sourceId : ''} />
      <input type="hidden" name="selectedImageUrls" value={JSON.stringify(selectedImageUrls)} />

      {/* Hidden fields for controlled platform content */}
      <input type="hidden" name="instagramCaptionEn" value={instagramCaptionEn} />
      <input type="hidden" name="instagramCaptionZh" value={instagramCaptionZh} />
      <input type="hidden" name="instagramHashtagsEn" value={instagramHashtagsEn} />
      <input type="hidden" name="instagramHashtagsZh" value={instagramHashtagsZh} />
      <input type="hidden" name="facebookCaptionEn" value={facebookCaptionEn} />
      <input type="hidden" name="facebookCaptionZh" value={facebookCaptionZh} />
      <input type="hidden" name="facebookHashtagsEn" value={facebookHashtagsEn} />
      <input type="hidden" name="facebookHashtagsZh" value={facebookHashtagsZh} />
      <input type="hidden" name="xiaohongshuCaptionZh" value={xiaohongshuCaptionZh} />
      <input type="hidden" name="xiaohongshuCaptionEn" value={xiaohongshuCaptionEn} />
      <input type="hidden" name="xiaohongshuTopicTagsZh" value={xiaohongshuTopicTagsZh} />

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
          {/* Source Selector */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: SURFACE_ALT, borderRadius: '8px' }}>
            <FormField label={t.socialPosts.source}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {(['none', 'blog', 'project', 'site'] as const).map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: NAVY, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="_sourceType"
                      value={type}
                      checked={sourceType === type}
                      onChange={() => { setSourceType(type); setSourceId(''); }}
                    />
                    {type === 'none' ? t.socialPosts.sourceNone :
                     type === 'blog' ? t.socialPosts.sourceBlog :
                     type === 'project' ? t.socialPosts.sourceProject :
                     t.socialPosts.sourceSite}
                  </label>
                ))}
              </div>

              {sourceType !== 'none' && (
                <SearchableSelect
                  name="_sourceId"
                  options={sourceOptions}
                  value={sourceId}
                  onChange={setSourceId}
                  placeholder={t.socialPosts.selectSource}
                  noResultsText={t.common.noRecords}
                  disabled={!editing}
                />
              )}
            </FormField>

            {/* AI Generate button */}
            {sourceType !== 'none' && sourceId && editing && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: NAVY,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? t.socialPosts.generating : t.socialPosts.generateAll}
              </button>
            )}
          </div>

          {/* Campaign Title */}
          <BilingualInput
            nameEn="titleEn"
            nameZh="titleZh"
            label={t.socialPosts.titleLabel}
            valueEn={titleEn}
            onChangeEn={setTitleEn}
            valueZh={titleZh}
            onChangeZh={setTitleZh}
            required
          />

          {/* Platform Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: NAVY, marginBottom: '0.5rem' }}>
              {t.socialPosts.platforms}
            </label>
            <div role="tablist" aria-label={t.socialPosts.platforms} style={{ display: 'flex', borderBottom: `1px solid ${SURFACE}`, marginBottom: '1rem' }}>
              <button type="button" role="tab" id="tab-instagram" aria-selected={activeTab === 'instagram'} aria-controls="tabpanel-instagram" tabIndex={activeTab === 'instagram' ? 0 : -1} onClick={() => setActiveTab('instagram')} onKeyDown={handleTabKeyDown} style={tabStyle('instagram')}>
                {t.socialPosts.instagram}
              </button>
              <button type="button" role="tab" id="tab-facebook" aria-selected={activeTab === 'facebook'} aria-controls="tabpanel-facebook" tabIndex={activeTab === 'facebook' ? 0 : -1} onClick={() => setActiveTab('facebook')} onKeyDown={handleTabKeyDown} style={tabStyle('facebook')}>
                {t.socialPosts.facebook}
              </button>
              <button type="button" role="tab" id="tab-xiaohongshu" aria-selected={activeTab === 'xiaohongshu'} aria-controls="tabpanel-xiaohongshu" tabIndex={activeTab === 'xiaohongshu' ? 0 : -1} onClick={() => setActiveTab('xiaohongshu')} onKeyDown={handleTabKeyDown} style={tabStyle('xiaohongshu')}>
                {t.socialPosts.xiaohongshu}
              </button>
            </div>

            {/* Instagram Tab */}
            <div id="tabpanel-instagram" role="tabpanel" aria-labelledby="tab-instagram" hidden={activeTab !== 'instagram'}>
              <FormField label={t.socialPosts.captionEn}>
                <textarea value={instagramCaptionEn} onChange={(e) => setInstagramCaptionEn(e.target.value)} style={textareaStyle} rows={5} />
              </FormField>
              <FormField label={t.socialPosts.captionZh}>
                <textarea value={instagramCaptionZh} onChange={(e) => setInstagramCaptionZh(e.target.value)} style={textareaStyle} rows={5} />
              </FormField>
              <FormField label={t.socialPosts.hashtagsEn}>
                <textarea value={instagramHashtagsEn} onChange={(e) => setInstagramHashtagsEn(e.target.value)} style={fieldStyle} rows={2} />
              </FormField>
              <FormField label={t.socialPosts.hashtagsZh}>
                <textarea value={instagramHashtagsZh} onChange={(e) => setInstagramHashtagsZh(e.target.value)} style={fieldStyle} rows={2} />
              </FormField>
            </div>

            {/* Facebook Tab */}
            <div id="tabpanel-facebook" role="tabpanel" aria-labelledby="tab-facebook" hidden={activeTab !== 'facebook'}>
              <FormField label={t.socialPosts.captionEn}>
                <textarea value={facebookCaptionEn} onChange={(e) => setFacebookCaptionEn(e.target.value)} style={textareaStyle} rows={5} />
              </FormField>
              <FormField label={t.socialPosts.captionZh}>
                <textarea value={facebookCaptionZh} onChange={(e) => setFacebookCaptionZh(e.target.value)} style={textareaStyle} rows={5} />
              </FormField>
              <FormField label={t.socialPosts.hashtagsEn}>
                <textarea value={facebookHashtagsEn} onChange={(e) => setFacebookHashtagsEn(e.target.value)} style={fieldStyle} rows={2} />
              </FormField>
              <FormField label={t.socialPosts.hashtagsZh}>
                <textarea value={facebookHashtagsZh} onChange={(e) => setFacebookHashtagsZh(e.target.value)} style={fieldStyle} rows={2} />
              </FormField>
            </div>

            {/* Xiaohongshu Tab */}
            <div id="tabpanel-xiaohongshu" role="tabpanel" aria-labelledby="tab-xiaohongshu" hidden={activeTab !== 'xiaohongshu'}>
              <FormField label={t.socialPosts.captionZh}>
                <textarea value={xiaohongshuCaptionZh} onChange={(e) => setXiaohongshuCaptionZh(e.target.value)} style={textareaStyle} rows={5} />
              </FormField>
              <FormField label={t.socialPosts.captionEn}>
                <textarea value={xiaohongshuCaptionEn} onChange={(e) => setXiaohongshuCaptionEn(e.target.value)} style={textareaStyle} rows={3} />
              </FormField>
              <FormField label={t.socialPosts.topicTagsZh}>
                <textarea value={xiaohongshuTopicTagsZh} onChange={(e) => setXiaohongshuTopicTagsZh(e.target.value)} style={fieldStyle} rows={2} />
              </FormField>
            </div>
          </div>

          {/* Image Picker */}
          {sourceImages.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: NAVY, marginBottom: '0.5rem' }}>
                {t.socialPosts.images}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {sourceImages.map((url) => {
                  const selected = selectedImageUrls.includes(url);
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => toggleImage(url)}
                      aria-label={selected ? t.socialPosts.deselectImage : t.socialPosts.selectImage}
                      aria-pressed={selected}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: selected ? `3px solid ${GOLD}` : '3px solid transparent',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'none',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAssetUrl(url)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {selected && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: GOLD,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status & Scheduling */}
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.socialPosts.status} htmlFor="status">
              <select id="status" name="status" defaultValue={initialData?.status ?? 'draft'} style={fieldStyle}>
                <option value="draft">{t.socialPosts.statusDraft}</option>
                <option value="ready">{t.socialPosts.statusReady}</option>
                <option value="published">{t.socialPosts.statusPublished}</option>
              </select>
            </FormField>
            <FormField label={t.socialPosts.scheduledAt} htmlFor="scheduledAt">
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : ''}
                style={fieldStyle}
              />
            </FormField>
          </div>

          {/* Notes */}
          <FormField label={t.socialPosts.notes} htmlFor="notes">
            <textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes ?? ''}
              placeholder={t.socialPosts.notesPlaceholder}
              rows={3}
              style={fieldStyle}
            />
          </FormField>

          {editing && (
            <SubmitButton isPending={isPending} label={submitLabelKey ? t.socialPosts[submitLabelKey] : undefined} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
