'use client';

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { ChevronDown, ChevronUp, X, Upload } from 'lucide-react';
import Tooltip from './Tooltip';
import { inputStyle, readOnlyStyle } from './shared-styles';
import { uploadImageDirect } from '@/lib/admin/upload-client';
import { getAssetUrl } from '@/lib/storage';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, ERROR, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

export interface ImagePairEntry {
  id: string;
  beforeUrl: string;
  beforeAltEn: string;
  beforeAltZh: string;
  afterUrl: string;
  afterAltEn: string;
  afterAltZh: string;
  titleEn: string;
  titleZh: string;
  captionEn: string;
  captionZh: string;
  photographerCredit: string;
  keywords: string;
}

/** Convert a slug like "richmond-full-house-renovation" to "Richmond Full House Renovation" */
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface ImagePairEditorProps {
  /** Field name prefix for form data (e.g., "imagePairs" or "siteImagePairs") */
  namePrefix: string;
  /** Current image pairs */
  pairs: ImagePairEntry[];
  /** Callback when pairs change */
  onChange: (pairs: ImagePairEntry[]) => void;
  /** Whether editing is enabled */
  editing: boolean;
  /** Optional label for the section */
  label?: string;
  /** Optional tooltip content */
  tooltip?: string;
  /** Optional slug for SEO-friendly upload filenames and auto-fill alt text */
  slug?: string;
}

export default function ImagePairEditor({
  namePrefix,
  pairs,
  onChange,
  editing,
  label,
  tooltip,
  slug,
}: ImagePairEditorProps) {
  const t = useAdminTranslations();
  // Ref to access latest pairs after async gaps (avoids stale closure)
  const pairsRef = useRef(pairs);
  useEffect(() => { pairsRef.current = pairs; }, [pairs]);

  const COLLAPSE_THRESHOLD = 3;
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());
  const [uploadingPair, setUploadingPair] = useState<string | null>(null);
  const [uploadingSide, setUploadingSide] = useState<'before' | 'after' | null>(null);
  const [uploadError, setUploadError] = useState('');
  const beforeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const afterInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const toggleExpanded = useCallback((id: string) => {
    setExpandedPairs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const updatePair = useCallback(
    (id: string, field: keyof ImagePairEntry, value: string) => {
      onChange(
        pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    },
    [pairs, onChange]
  );

  const removePair = useCallback(
    (id: string) => {
      onChange(pairs.filter((p) => p.id !== id));
    },
    [pairs, onChange]
  );

  const addPair = useCallback(() => {
    const newPair: ImagePairEntry = {
      id: crypto.randomUUID(),
      beforeUrl: '',
      beforeAltEn: '',
      beforeAltZh: '',
      afterUrl: '',
      afterAltEn: '',
      afterAltZh: '',
      titleEn: '',
      titleZh: '',
      captionEn: '',
      captionZh: '',
      photographerCredit: '',
      keywords: '',
    };
    onChange([...pairs, newPair]);
  }, [pairs, onChange]);

  const handleUpload = useCallback(
    async (pairId: string, side: 'before' | 'after', file: File) => {
      setUploadingPair(pairId);
      setUploadingSide(side);
      setUploadError('');

      try {
        // Build custom S3 key based on slug.  Include a short timestamp so each
        // upload produces a unique URL (avoids browser-cache stale-image issues).
        const customKey = slug
          ? (() => {
              const idx = pairsRef.current.findIndex((p) => p.id === pairId);
              const sideLabel = side === 'before' ? 'before-renovation' : 'after-renovation';
              const ts = Date.now().toString(36);
              return `${slug}-${sideLabel}-${idx + 1}-${ts}`;
            })()
          : undefined;

        const result = await uploadImageDirect({ file, customKey });

        if (result.error || !result.url) {
          setUploadError(result.error ?? t.upload.failed);
          return;
        }

        // Read latest pairs via ref to avoid stale closure after async gap
        const latestPairs = pairsRef.current;
        const urlField = side === 'before' ? 'beforeUrl' : 'afterUrl';
        const altEnField = side === 'before' ? 'beforeAltEn' : 'afterAltEn';
        const altZhField = side === 'before' ? 'beforeAltZh' : 'afterAltZh';
        const sideEn = side === 'before' ? 'Before' : 'After';
        const sideZh = side === 'before' ? '装修前' : '装修后';

        onChange(
          latestPairs.map((p) => {
            if (p.id !== pairId) return p;
            const updates: Partial<ImagePairEntry> = { [urlField]: result.url };
            if (slug) {
              const humanized = humanizeSlug(slug);
              const num = latestPairs.findIndex((x) => x.id === pairId) + 1;
              if (!p[altEnField]) {
                updates[altEnField] = `${humanized} - ${sideEn} Renovation ${num}`;
              }
              if (!p[altZhField]) {
                updates[altZhField] = `${humanized} - ${sideZh} ${num}`;
              }
            }
            return { ...p, ...updates };
          })
        );
      } catch {
        setUploadError(t.upload.failed);
      } finally {
        setUploadingPair(null);
        setUploadingSide(null);
      }
    },
    [t, slug, onChange]
  );

  const handleFileSelect = useCallback(
    (pairId: string, side: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleUpload(pairId, side, file);
      }
      e.target.value = '';
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (pairId: string, side: 'before' | 'after') => (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleUpload(pairId, side, file);
      }
    },
    [handleUpload]
  );

  const clearImage = useCallback(
    (pairId: string, side: 'before' | 'after') => {
      const urlField = side === 'before' ? 'beforeUrl' : 'afterUrl';
      updatePair(pairId, urlField, '');
    },
    [updatePair]
  );

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
        <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
          {label ?? t.imagePairs.title}
        </span>
        {tooltip && <Tooltip content={tooltip} />}
      </div>

      {uploadingPair && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: GOLD, marginBottom: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: `2px solid ${GOLD}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'admin-spin 0.8s linear infinite',
          }} />
          {t.upload.uploading}
        </div>
      )}

      {uploadError && (
        <div role="alert" style={{ color: ERROR, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          {uploadError}
        </div>
      )}

      {/* Hidden form inputs for ALL pairs (always rendered for form submission) */}
      {pairs.map((pair, idx) => (
        <div key={`hidden-${pair.id}`}>
          <input type="hidden" name={`${namePrefix}[${idx}].id`} value={pair.id} />
          <input type="hidden" name={`${namePrefix}[${idx}].beforeUrl`} value={pair.beforeUrl} />
          <input type="hidden" name={`${namePrefix}[${idx}].beforeAltEn`} value={pair.beforeAltEn} />
          <input type="hidden" name={`${namePrefix}[${idx}].beforeAltZh`} value={pair.beforeAltZh} />
          <input type="hidden" name={`${namePrefix}[${idx}].afterUrl`} value={pair.afterUrl} />
          <input type="hidden" name={`${namePrefix}[${idx}].afterAltEn`} value={pair.afterAltEn} />
          <input type="hidden" name={`${namePrefix}[${idx}].afterAltZh`} value={pair.afterAltZh} />
          <input type="hidden" name={`${namePrefix}[${idx}].titleEn`} value={pair.titleEn} />
          <input type="hidden" name={`${namePrefix}[${idx}].titleZh`} value={pair.titleZh} />
          <input type="hidden" name={`${namePrefix}[${idx}].captionEn`} value={pair.captionEn} />
          <input type="hidden" name={`${namePrefix}[${idx}].captionZh`} value={pair.captionZh} />
          <input type="hidden" name={`${namePrefix}[${idx}].photographerCredit`} value={pair.photographerCredit} />
          <input type="hidden" name={`${namePrefix}[${idx}].keywords`} value={pair.keywords} />
        </div>
      ))}

      {/* Visible image pair cards (collapsed to first N) */}
      {(showAllPairs ? pairs : pairs.slice(0, COLLAPSE_THRESHOLD)).map((pair, idx) => {
        const isExpanded = expandedPairs.has(pair.id);
        const isUploading = uploadingPair === pair.id;

        return (
          <div
            key={pair.id}
            style={{
              backgroundColor: SURFACE,
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              boxShadow: neu(2),
            }}
          >
            {/* Pair header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.75rem' }}>
                {t.imagePairs.pairNumber.replace('{number}', String(idx + 1))}
              </span>
              {editing && pairs.length > 0 && (
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  aria-label={t.imagePairs.removePair}
                  style={{ color: ERROR, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {t.common.remove}
                </button>
              )}
            </div>

            {/* Before/After image zones side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {/* Before image zone */}
              <ImageZone
                label={t.imagePairs.beforeImage}
                imageUrl={pair.beforeUrl}
                altEn={pair.beforeAltEn}
                altZh={pair.beforeAltZh}
                onAltEnChange={(v) => updatePair(pair.id, 'beforeAltEn', v)}
                onAltZhChange={(v) => updatePair(pair.id, 'beforeAltZh', v)}
                onUrlChange={(v) => updatePair(pair.id, 'beforeUrl', v)}
                onClear={() => clearImage(pair.id, 'before')}
                onDrop={handleDrop(pair.id, 'before')}
                onFileSelect={handleFileSelect(pair.id, 'before')}
                inputRef={(el) => { beforeInputRefs.current[pair.id] = el; }}
                uploading={isUploading && uploadingSide === 'before'}
                editing={editing}
                dropLabel={t.imagePairs.dropBefore}
                clearLabel={t.imagePairs.clearBefore}
                fieldStyle={fieldStyle}
                t={t}
              />

              {/* After image zone */}
              <ImageZone
                label={t.imagePairs.afterImage}
                imageUrl={pair.afterUrl}
                altEn={pair.afterAltEn}
                altZh={pair.afterAltZh}
                onAltEnChange={(v) => updatePair(pair.id, 'afterAltEn', v)}
                onAltZhChange={(v) => updatePair(pair.id, 'afterAltZh', v)}
                onUrlChange={(v) => updatePair(pair.id, 'afterUrl', v)}
                onClear={() => clearImage(pair.id, 'after')}
                onDrop={handleDrop(pair.id, 'after')}
                onFileSelect={handleFileSelect(pair.id, 'after')}
                inputRef={(el) => { afterInputRefs.current[pair.id] = el; }}
                uploading={isUploading && uploadingSide === 'after'}
                editing={editing}
                dropLabel={t.imagePairs.dropAfter}
                clearLabel={t.imagePairs.clearAfter}
                fieldStyle={fieldStyle}
                t={t}
              />
            </div>

            {/* SEO metadata toggle — uses <div> to stay clickable inside <fieldset disabled> */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(pair.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(pair.id); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: TEXT_MID,
                fontSize: '0.6875rem',
                padding: '0.25rem 0',
              }}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isExpanded ? t.imagePairs.collapseMetadata : t.imagePairs.expandMetadata}
            </div>

            {/* SEO metadata fields (collapsible) */}
            {isExpanded && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: CARD, borderRadius: '6px' }}>
                {/* Title */}
                <div style={{ marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                    {t.imagePairs.pairTitle}
                  </label>
                  <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)' }}>
                        <span role="img" aria-label="English">🇺🇸</span>
                      </span>
                      <input
                        value={pair.titleEn}
                        onChange={(e) => updatePair(pair.id, 'titleEn', e.target.value)}
                        placeholder="Title (EN)"
                        style={fieldStyle}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)' }}>
                        <span role="img" aria-label="Chinese">🇨🇳</span>
                      </span>
                      <input
                        value={pair.titleZh}
                        onChange={(e) => updatePair(pair.id, 'titleZh', e.target.value)}
                        placeholder="标题 (ZH)"
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div style={{ marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                    {t.imagePairs.caption}
                  </label>
                  <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                    <textarea
                      value={pair.captionEn}
                      onChange={(e) => updatePair(pair.id, 'captionEn', e.target.value)}
                      placeholder="Caption (EN)"
                      rows={2}
                      style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                    <textarea
                      value={pair.captionZh}
                      onChange={(e) => updatePair(pair.id, 'captionZh', e.target.value)}
                      placeholder="说明 (ZH)"
                      rows={2}
                      style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Photographer credit and keywords */}
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      {t.imagePairs.photographerCredit}
                    </label>
                    <input
                      value={pair.photographerCredit}
                      onChange={(e) => updatePair(pair.id, 'photographerCredit', e.target.value)}
                      placeholder="Photographer"
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.125rem', display: 'block' }}>
                      {t.imagePairs.keywords}
                    </label>
                    <input
                      value={pair.keywords}
                      onChange={(e) => updatePair(pair.id, 'keywords', e.target.value)}
                      placeholder="keyword1, keyword2"
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Show All / Show Less toggle — uses <div> to stay clickable inside <fieldset disabled> */}
      {pairs.length > COLLAPSE_THRESHOLD && (
        <div
          role="button"
          tabIndex={0}
          aria-expanded={showAllPairs}
          aria-label={showAllPairs ? t.common.showLess : t.common.showAll.replace('{count}', String(pairs.length))}
          onClick={() => setShowAllPairs((prev) => !prev)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAllPairs((prev) => !prev); } }}
          style={{
            color: NAVY,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {showAllPairs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAllPairs
            ? t.common.showLess
            : t.common.showAll.replace('{count}', String(pairs.length))}
        </div>
      )}

      {/* Add pair button */}
      {editing && (
        <button
          type="button"
          onClick={addPair}
          style={{
            color: GOLD,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          {t.imagePairs.addPair}
        </button>
      )}
    </div>
  );
}

/** Individual image drop zone within a pair */
function ImageZone({
  label,
  imageUrl,
  altEn,
  altZh,
  onAltEnChange,
  onAltZhChange,
  onUrlChange,
  onClear,
  onDrop,
  onFileSelect,
  inputRef,
  uploading,
  editing,
  dropLabel,
  clearLabel,
  fieldStyle,
  t,
}: {
  label: string;
  imageUrl: string;
  altEn: string;
  altZh: string;
  onAltEnChange: (value: string) => void;
  onAltZhChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onClear: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  uploading: boolean;
  editing: boolean;
  dropLabel: string;
  clearLabel: string;
  fieldStyle: React.CSSProperties;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputId = useId();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (editing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (editing) onDrop(e);
  };

  return (
    <div>
      <label style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
        {label}
      </label>

      {imageUrl ? (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              boxShadow: neu(2),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetUrl(imageUrl)}
              alt={altEn || label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {editing && (
            <button
              type="button"
              onClick={onClear}
              aria-label={clearLabel}
              style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={fileInputId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropWrapper}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '4/3',
            borderRadius: '6px',
            border: `2px dashed ${isDragging ? GOLD : uploading ? GOLD : TEXT_MID}`,
            backgroundColor: isDragging ? 'rgba(200, 146, 42, 0.08)' : CARD,
            cursor: editing ? (uploading ? 'wait' : 'pointer') : 'default',
            opacity: uploading ? 0.6 : 1,
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
          }}
        >
          <input
            id={fileInputId}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            onChange={onFileSelect}
            disabled={!editing || uploading}
            style={{ display: 'none' }}
          />
          <Upload size={20} style={{ color: TEXT_MID, marginBottom: '0.25rem' }} />
          <span style={{ color: TEXT_MID, fontSize: '0.6875rem', textAlign: 'center', padding: '0 0.5rem' }}>
            {uploading ? t.upload.uploading : dropLabel}
          </span>
        </label>
      )}

      {/* URL input field */}
      <input
        value={imageUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={t.upload.placeholder}
        style={{ ...fieldStyle, marginTop: '0.25rem', fontSize: '0.6875rem' }}
      />

      {/* Alt text fields */}
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem' }}>
        <div>
          <label style={{ fontSize: '0.6rem', color: 'rgba(27,54,93,0.4)' }}>
            <span role="img" aria-label="English">🇺🇸</span> Alt
          </label>
          <input
            value={altEn}
            onChange={(e) => onAltEnChange(e.target.value)}
            placeholder="Alt EN"
            style={{ ...fieldStyle, fontSize: '0.6875rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.6rem', color: 'rgba(27,54,93,0.4)' }}>
            <span role="img" aria-label="Chinese">🇨🇳</span> Alt
          </label>
          <input
            value={altZh}
            onChange={(e) => onAltZhChange(e.target.value)}
            placeholder="Alt ZH"
            style={{ ...fieldStyle, fontSize: '0.6875rem' }}
          />
        </div>
      </div>
    </div>
  );
}
