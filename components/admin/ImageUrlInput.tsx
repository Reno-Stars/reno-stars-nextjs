'use client';

import { useState, useEffect, useCallback } from 'react';
import { uploadImage } from '@/app/actions/admin/upload';
import { getAssetUrl } from '@/lib/storage';
import { CARD, NAVY, GOLD, TEXT_MID, ERROR, neuIn, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ImageUrlInputProps {
  name: string;
  label: string;
  defaultValue?: string;
  /** Controlled value — when provided, component is controlled (ignores defaultValue) */
  value?: string;
  /** Change handler for controlled mode */
  onChange?: (url: string) => void;
  required?: boolean;
  tooltip?: string;
  /** Optional slug for SEO-friendly upload filenames */
  slug?: string;
  /** Image role used in the S3 key (default: 'hero') */
  imageRole?: string;
  /** Whether the input is disabled (view mode) */
  disabled?: boolean;
  /** Hide the label row (when label is rendered externally) */
  hideLabel?: boolean;
  /** Placeholder override */
  placeholder?: string;
}

export default function ImageUrlInput({
  name,
  label,
  defaultValue = '',
  value: controlledValue,
  onChange: controlledOnChange,
  required = false,
  tooltip,
  slug,
  imageRole = 'hero',
  disabled = false,
  hideLabel = false,
  placeholder,
}: ImageUrlInputProps) {
  const t = useAdminTranslations();
  const isControlled = controlledValue !== undefined;
  const [internalUrl, setInternalUrl] = useState(defaultValue);
  const url = isControlled ? controlledValue : internalUrl;
  const setUrl = useCallback((newUrl: string) => {
    if (isControlled) {
      controlledOnChange?.(newUrl);
    } else {
      setInternalUrl(newUrl);
    }
  }, [isControlled, controlledOnChange]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!isControlled) setInternalUrl(defaultValue);
  }, [defaultValue, isControlled]);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.set('file', file);
    if (slug) {
      // Include a short timestamp suffix so each upload produces a unique S3 key/URL.
      // Without this, re-uploading the same file type overwrites the same key and
      // the browser serves the cached old image (identical URL).
      const ts = Date.now().toString(36);
      formData.set('customKey', `${slug}-${imageRole}-${ts}`);
    }

    const result = await uploadImage({}, formData);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setUrl(result.url);
    }

    setUploading(false);
  }, [slug, imageRole, setUrl]);

  // Open a detached file picker — immune to <fieldset disabled>
  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleUpload(file);
    };
    input.click();
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div style={{ marginBottom: hideLabel ? '0.375rem' : '1rem' }}>
      {!hideLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
          <label
            htmlFor={name}
            style={{
              color: NAVY,
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            {label}
          </label>
          {tooltip && (
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: `1px solid ${TEXT_MID}`,
                  backgroundColor: 'transparent',
                  color: TEXT_MID,
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'help',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                aria-label={t.common.help}
              >
                ?
              </button>
              {showTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '6px',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: NAVY,
                    color: CARD,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                    width: '220px',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* URL input */}
      <input
        id={name}
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder ?? t.upload.placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: 'none',
          boxShadow: disabled ? 'none' : neuIn(3),
          backgroundColor: CARD,
          color: NAVY,
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'default' : 'text',
        }}
      />

      {/* Upload area — only visible in edit mode; uses <div> so <fieldset disabled> won't block clicks */}
      {!disabled && <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={(e) => { if (!uploading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFilePicker(); } }}
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.75rem',
          borderRadius: '8px',
          border: `2px dashed ${uploading ? GOLD : '#ccc'}`,
          backgroundColor: CARD,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
        onClick={() => !uploading && openFilePicker()}
        aria-label={`${t.upload.uploadImageFor} ${label}`}
        aria-disabled={uploading}
      >
        <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
          {uploading ? t.upload.uploading : t.upload.clickOrDrag}
        </div>
        <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
          {t.upload.formatHint}
        </div>
      </div>
      }

      {uploadError && (
        <div role="alert" style={{ color: ERROR, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {uploadError}
        </div>
      )}

      {/* Preview */}
      {url && !imageError && (
        <div
          style={{
            marginTop: '0.5rem',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: neu(3),
            maxWidth: '200px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAssetUrl(url)}
            alt={t.common.preview}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={(e) => {
              // If rewritten URL fails (e.g. local MinIO doesn't have the file),
              // fall back to the original URL before giving up
              const img = e.currentTarget;
              if (img.src !== url && url.startsWith('http')) {
                img.src = url;
              } else {
                setImageError(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
