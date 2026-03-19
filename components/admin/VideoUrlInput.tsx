'use client';

import { useState, useEffect, useCallback } from 'react';
import { uploadVideoDirect } from '@/lib/admin/upload-client';
import { getAssetUrl } from '@/lib/storage';
import { CARD, NAVY, GOLD, TEXT_MID, ERROR, neuIn, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface VideoUrlInputProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  tooltip?: string;
  slug?: string;
  imageRole?: string;
  disabled?: boolean;
}

export default function VideoUrlInput({
  name,
  label,
  defaultValue = '',
  required = false,
  tooltip,
  slug,
  imageRole = 'hero-video',
  disabled = false,
}: VideoUrlInputProps) {
  const t = useAdminTranslations();
  const [url, setUrl] = useState(defaultValue);
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setVideoError(false);
  }, [url]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError('');

    try {
      const customKey = slug
        ? `${slug}-${imageRole}-${Date.now().toString(36)}`
        : undefined;

      const result = await uploadVideoDirect({ file, customKey });

      if (result.error) {
        setUploadError(result.error);
      } else if (result.url) {
        setUrl(result.url);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Video upload error:', err);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [slug, imageRole]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/quicktime';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleUpload(file);
    };
    input.click();
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div style={{ marginBottom: '1rem' }}>
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

      {/* URL input */}
      <input
        id={name}
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={t.upload.placeholder}
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

      {/* Upload area */}
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
        aria-label={`${t.upload.uploadVideoFor} ${label}`}
        aria-disabled={uploading}
      >
        <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
          {uploading ? t.upload.uploading : t.upload.clickOrDragVideo}
        </div>
        <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
          {t.upload.videoFormatHint}
        </div>
      </div>
      }

      {uploadError && (
        <div role="alert" style={{ color: ERROR, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {uploadError}
        </div>
      )}

      {/* Video preview */}
      {url && !videoError && (
        <div
          style={{
            marginTop: '0.5rem',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: neu(3),
            maxWidth: '300px',
          }}
        >
          <video
            src={getAssetUrl(url)}
            controls
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={() => setVideoError(true)}
          />
        </div>
      )}
    </div>
  );
}
