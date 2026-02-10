'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { NAVY, GOLD, CARD, neu, SURFACE, ERROR } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { optimizeBlogContent } from '@/app/actions/admin/optimize-content';
import Tooltip from './Tooltip';
import { SEOFieldsSection, ExcerptSection } from './ai-editor';

interface AIContentEditorProps {
  /** Hidden input name for English content */
  nameContentEn: string;
  /** Hidden input name for Chinese content */
  nameContentZh: string;
  /** Hidden input name for English excerpt */
  nameExcerptEn: string;
  /** Hidden input name for Chinese excerpt */
  nameExcerptZh: string;
  /** Initial English content */
  defaultContentEn?: string;
  /** Initial Chinese content */
  defaultContentZh?: string;
  /** Initial English excerpt */
  defaultExcerptEn?: string;
  /** Initial Chinese excerpt */
  defaultExcerptZh?: string;
  /** Field label */
  label: string;
  /** Excerpt field label */
  excerptLabel: string;
  /** Whether the content fields are required */
  required?: boolean;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** SEO fields - initial values */
  defaultSeo?: {
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
}

type TabType = 'paste' | 'en' | 'zh';
type ViewMode = 'edit' | 'preview';

// Debounce delay for AI optimization (prevents rapid repeated calls)
const DEBOUNCE_DELAY_MS = 1000;

const tabStyle = (active: boolean, disabled: boolean) => ({
  padding: '0.5rem 1rem',
  border: 'none',
  background: active ? CARD : 'transparent',
  color: active ? NAVY : 'rgba(27,54,93,0.6)',
  fontWeight: active ? 600 : 400,
  fontSize: '0.875rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  borderRadius: '6px 6px 0 0',
  transition: 'all 0.15s ease',
  opacity: disabled ? 0.6 : 1,
});

const viewToggleStyle = (active: boolean) => ({
  padding: '0.25rem 0.625rem',
  border: 'none',
  background: active ? NAVY : 'transparent',
  color: active ? '#fff' : NAVY,
  fontSize: '0.75rem',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'all 0.15s ease',
});

const textareaStyle = {
  width: '100%',
  padding: '0.75rem',
  border: `1px solid rgba(27,54,93,0.15)`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  minHeight: '200px',
  background: SURFACE,
};

const optimizeButtonStyle = {
  padding: '0.5rem 1rem',
  background: `linear-gradient(135deg, ${GOLD} 0%, #d4a030 100%)`,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  transition: 'all 0.15s ease',
  boxShadow: neu(2),
};

const optimizeButtonDisabledStyle = {
  ...optimizeButtonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

export default function AIContentEditor({
  nameContentEn,
  nameContentZh,
  nameExcerptEn,
  nameExcerptZh,
  defaultContentEn = '',
  defaultContentZh = '',
  defaultExcerptEn = '',
  defaultExcerptZh = '',
  label,
  excerptLabel,
  required = false,
  disabled = false,
  defaultSeo = {},
}: AIContentEditorProps) {
  const t = useAdminTranslations();
  const [activeTab, setActiveTab] = useState<TabType>(defaultContentEn || defaultContentZh ? 'en' : 'paste');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [pasteContent, setPasteContent] = useState('');
  const [contentEn, setContentEn] = useState(defaultContentEn);
  const [contentZh, setContentZh] = useState(defaultContentZh);
  const [excerptEn, setExcerptEn] = useState(defaultExcerptEn);
  const [excerptZh, setExcerptZh] = useState(defaultExcerptZh);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'zh' | null>(null);

  // Debounce ref for rate limiting
  const lastOptimizeRef = useRef<number>(0);

  // Extract individual SEO props to avoid object dependency in useEffect
  const {
    metaTitleEn: defaultMetaTitleEn = '',
    metaTitleZh: defaultMetaTitleZh = '',
    metaDescriptionEn: defaultMetaDescriptionEn = '',
    metaDescriptionZh: defaultMetaDescriptionZh = '',
    focusKeywordEn: defaultFocusKeywordEn = '',
    focusKeywordZh: defaultFocusKeywordZh = '',
    seoKeywordsEn: defaultSeoKeywordsEn = '',
    seoKeywordsZh: defaultSeoKeywordsZh = '',
    readingTimeMinutes: defaultReadingTimeMinutes = 0,
  } = defaultSeo;

  // SEO fields state
  const [metaTitleEn, setMetaTitleEn] = useState(defaultMetaTitleEn);
  const [metaTitleZh, setMetaTitleZh] = useState(defaultMetaTitleZh);
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(defaultMetaDescriptionEn);
  const [metaDescriptionZh, setMetaDescriptionZh] = useState(defaultMetaDescriptionZh);
  const [focusKeywordEn, setFocusKeywordEn] = useState(defaultFocusKeywordEn);
  const [focusKeywordZh, setFocusKeywordZh] = useState(defaultFocusKeywordZh);
  const [seoKeywordsEn, setSeoKeywordsEn] = useState(defaultSeoKeywordsEn);
  const [seoKeywordsZh, setSeoKeywordsZh] = useState(defaultSeoKeywordsZh);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(defaultReadingTimeMinutes);

  // Sync state with props when they change (after save + revalidation)
  // Using individual props instead of object to avoid unnecessary re-syncs
  useEffect(() => {
    setContentEn(defaultContentEn);
    setContentZh(defaultContentZh);
    setExcerptEn(defaultExcerptEn);
    setExcerptZh(defaultExcerptZh);
    setMetaTitleEn(defaultMetaTitleEn);
    setMetaTitleZh(defaultMetaTitleZh);
    setMetaDescriptionEn(defaultMetaDescriptionEn);
    setMetaDescriptionZh(defaultMetaDescriptionZh);
    setFocusKeywordEn(defaultFocusKeywordEn);
    setFocusKeywordZh(defaultFocusKeywordZh);
    setSeoKeywordsEn(defaultSeoKeywordsEn);
    setSeoKeywordsZh(defaultSeoKeywordsZh);
    setReadingTimeMinutes(defaultReadingTimeMinutes);
    // Switch to EN tab if content exists
    if (defaultContentEn || defaultContentZh) {
      setActiveTab('en');
    }
  }, [
    defaultContentEn,
    defaultContentZh,
    defaultExcerptEn,
    defaultExcerptZh,
    defaultMetaTitleEn,
    defaultMetaTitleZh,
    defaultMetaDescriptionEn,
    defaultMetaDescriptionZh,
    defaultFocusKeywordEn,
    defaultFocusKeywordZh,
    defaultSeoKeywordsEn,
    defaultSeoKeywordsZh,
    defaultReadingTimeMinutes,
  ]);

  const handleOptimize = useCallback(async () => {
    if (!pasteContent.trim()) {
      setError(t.ai.emptyContent);
      return;
    }

    // Rate limiting: prevent rapid repeated calls
    const now = Date.now();
    if (now - lastOptimizeRef.current < DEBOUNCE_DELAY_MS) {
      return;
    }
    lastOptimizeRef.current = now;

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await optimizeBlogContent(pasteContent);
      if (result.success) {
        // Content and excerpts
        setContentEn(result.data.contentEn);
        setContentZh(result.data.contentZh);
        setExcerptEn(result.data.excerptEn);
        setExcerptZh(result.data.excerptZh);
        // SEO fields
        setMetaTitleEn(result.data.metaTitleEn);
        setMetaTitleZh(result.data.metaTitleZh);
        setMetaDescriptionEn(result.data.metaDescriptionEn);
        setMetaDescriptionZh(result.data.metaDescriptionZh);
        setFocusKeywordEn(result.data.focusKeywordEn);
        setFocusKeywordZh(result.data.focusKeywordZh);
        setSeoKeywordsEn(result.data.seoKeywordsEn);
        setSeoKeywordsZh(result.data.seoKeywordsZh);
        setReadingTimeMinutes(result.data.readingTimeMinutes);
        setDetectedLanguage(result.data.detectedLanguage);
        setActiveTab('en');
        setViewMode('preview');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsOptimizing(false);
    }
  }, [pasteContent, t.ai.emptyContent]);

  const currentContent = useMemo(() => {
    if (activeTab === 'en') return contentEn;
    if (activeTab === 'zh') return contentZh;
    return '';
  }, [activeTab, contentEn, contentZh]);

  // Sanitize HTML for preview to prevent XSS
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(currentContent, {
      ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'br'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
    });
  }, [currentContent]);

  const handleContentChange = useCallback(
    (value: string) => {
      if (activeTab === 'en') setContentEn(value);
      else if (activeTab === 'zh') setContentZh(value);
    },
    [activeTab]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    if (!disabled) {
      setActiveTab(tab);
    }
  }, [disabled]);

  // Tab IDs for accessibility
  const tabIds = {
    paste: 'ai-tab-paste',
    en: 'ai-tab-en',
    zh: 'ai-tab-zh',
  };
  const panelId = 'ai-tabpanel';

  return (
    <div style={{ marginBottom: '1.5rem' }} aria-busy={isOptimizing}>
      {/* Label with tooltip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
        <label style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
          {label}
        </label>
        <Tooltip content={t.ai.tooltip} />
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: SURFACE,
          borderRadius: '8px 8px 0 0',
          padding: '0.25rem 0.5rem 0',
        }}
      >
        <div style={{ display: 'flex', gap: '0.25rem' }} role="tablist">
          <button
            type="button"
            id={tabIds.paste}
            role="tab"
            aria-selected={activeTab === 'paste'}
            aria-controls={panelId}
            onClick={() => handleTabChange('paste')}
            style={tabStyle(activeTab === 'paste', disabled)}
            disabled={disabled}
          >
            {t.ai.pasteContent}
          </button>
          <button
            type="button"
            id={tabIds.en}
            role="tab"
            aria-selected={activeTab === 'en'}
            aria-controls={panelId}
            onClick={() => handleTabChange('en')}
            style={tabStyle(activeTab === 'en', disabled)}
            disabled={disabled}
          >
            <span role="img" aria-label="English">🇺🇸</span> English
          </button>
          <button
            type="button"
            id={tabIds.zh}
            role="tab"
            aria-selected={activeTab === 'zh'}
            aria-controls={panelId}
            onClick={() => handleTabChange('zh')}
            style={tabStyle(activeTab === 'zh', disabled)}
            disabled={disabled}
          >
            <span role="img" aria-label="Chinese">🇨🇳</span> Chinese
          </button>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Detected language badge */}
          {detectedLanguage && activeTab === 'paste' && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'rgba(27,54,93,0.6)',
                background: 'rgba(27,54,93,0.08)',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              {t.ai.detected}: {detectedLanguage.toUpperCase()}
            </span>
          )}

          {/* Reading time badge */}
          {readingTimeMinutes > 0 && activeTab !== 'paste' && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'rgba(27,54,93,0.6)',
                background: 'rgba(27,54,93,0.08)',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              {t.ai.readingTime.replace('{minutes}', String(readingTimeMinutes))}
            </span>
          )}

          {/* View mode toggle - only show for EN/ZH tabs */}
          {activeTab !== 'paste' && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button type="button" onClick={() => setViewMode('edit')} style={viewToggleStyle(viewMode === 'edit')}>
                {t.ai.edit}
              </button>
              <button type="button" onClick={() => setViewMode('preview')} style={viewToggleStyle(viewMode === 'preview')}>
                {t.ai.preview}
              </button>
            </div>
          )}

          {/* AI Optimize button - only show on paste tab */}
          {activeTab === 'paste' && !disabled && (
            <button
              type="button"
              onClick={handleOptimize}
              disabled={isOptimizing || !pasteContent.trim()}
              style={isOptimizing || !pasteContent.trim() ? optimizeButtonDisabledStyle : optimizeButtonStyle}
              aria-describedby={isOptimizing ? 'ai-loading-status' : undefined}
            >
              {isOptimizing ? t.ai.optimizing : t.ai.optimize}
            </button>
          )}
        </div>
      </div>

      {/* Screen reader loading announcement */}
      {isOptimizing && (
        <div id="ai-loading-status" role="status" aria-live="polite" className="sr-only">
          {t.ai.optimizing}
        </div>
      )}

      {/* Content area */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabIds[activeTab]}
        style={{
          background: CARD,
          border: `1px solid rgba(27,54,93,0.1)`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '1rem',
          boxShadow: neu(4),
        }}
      >
        {/* Error message */}
        {error && (
          <div
            role="alert"
            style={{
              background: `${ERROR}15`,
              color: ERROR,
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              marginBottom: '0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Paste tab */}
        {activeTab === 'paste' && (
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder={t.ai.placeholder}
            aria-label={t.ai.pasteContent}
            style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
          />
        )}

        {/* EN/ZH tabs */}
        {activeTab !== 'paste' && (
          <>
            {viewMode === 'edit' ? (
              <textarea
                value={currentContent}
                onChange={(e) => handleContentChange(e.target.value)}
                aria-label={activeTab === 'en' ? 'English content' : 'Chinese content'}
                style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
                required={required}
                disabled={disabled}
              />
            ) : (
              <div
                style={{
                  ...textareaStyle,
                  overflow: 'auto',
                  background: '#fff',
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}
          </>
        )}
      </div>

      {/* Excerpts Section */}
      <ExcerptSection
        label={excerptLabel}
        autoGeneratedLabel={t.ai.autoGenerated}
        excerptEn={excerptEn}
        excerptZh={excerptZh}
        onExcerptEnChange={setExcerptEn}
        onExcerptZhChange={setExcerptZh}
        disabled={disabled}
      />

      {/* SEO Section */}
      <SEOFieldsSection
        seoSettingsLabel={t.ai.seoSettings}
        seoTooltip={t.ai.seoTooltip}
        autoGeneratedLabel={t.ai.autoGenerated}
        metaTitleLabel={t.ai.metaTitle}
        metaDescriptionLabel={t.ai.metaDescription}
        focusKeywordLabel={t.ai.focusKeyword}
        seoKeywordsLabel={t.ai.seoKeywords}
        metaTitleEn={metaTitleEn}
        metaTitleZh={metaTitleZh}
        metaDescriptionEn={metaDescriptionEn}
        metaDescriptionZh={metaDescriptionZh}
        focusKeywordEn={focusKeywordEn}
        focusKeywordZh={focusKeywordZh}
        seoKeywordsEn={seoKeywordsEn}
        seoKeywordsZh={seoKeywordsZh}
        onMetaTitleEnChange={setMetaTitleEn}
        onMetaTitleZhChange={setMetaTitleZh}
        onMetaDescriptionEnChange={setMetaDescriptionEn}
        onMetaDescriptionZhChange={setMetaDescriptionZh}
        onFocusKeywordEnChange={setFocusKeywordEn}
        onFocusKeywordZhChange={setFocusKeywordZh}
        onSeoKeywordsEnChange={setSeoKeywordsEn}
        onSeoKeywordsZhChange={setSeoKeywordsZh}
        disabled={disabled}
      />

      {/* Hidden inputs for form submission */}
      <input type="hidden" name={nameContentEn} value={contentEn} />
      <input type="hidden" name={nameContentZh} value={contentZh} />
      <input type="hidden" name={nameExcerptEn} value={excerptEn} />
      <input type="hidden" name={nameExcerptZh} value={excerptZh} />
      <input type="hidden" name="metaTitleEn" value={metaTitleEn} />
      <input type="hidden" name="metaTitleZh" value={metaTitleZh} />
      <input type="hidden" name="metaDescriptionEn" value={metaDescriptionEn} />
      <input type="hidden" name="metaDescriptionZh" value={metaDescriptionZh} />
      <input type="hidden" name="focusKeywordEn" value={focusKeywordEn} />
      <input type="hidden" name="focusKeywordZh" value={focusKeywordZh} />
      <input type="hidden" name="seoKeywordsEn" value={seoKeywordsEn} />
      <input type="hidden" name="seoKeywordsZh" value={seoKeywordsZh} />
      <input type="hidden" name="readingTimeMinutes" value={readingTimeMinutes} />
    </div>
  );
}
