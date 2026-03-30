'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { uploadVideoDirect } from '@/lib/admin/upload-client';
import { VIDEO_ACCEPT } from '@/lib/admin/upload-constants';
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
  /** Controlled mode: called when URL changes (upload or manual edit) */
  onChange?: (url: string) => void;
  /** Compact mode: smaller UI for embedding inside other editors */
  compact?: boolean;
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
  onChange: onChangeProp,
  compact = false,
}: VideoUrlInputProps) {
  const t = useAdminTranslations();
  const [url, setUrl] = useState(defaultValue);
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Must set `true` inside the effect body so React Strict Mode's
  // simulate-unmount/remount cycle re-enables it after cleanup.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Skip the first onChangeProp call so mounting N pairs doesn't fire 2N
  // redundant updatePair calls.
  const isInitialRender = useRef(true);

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setVideoError(false);
    if (isInitialRender.current) { isInitialRender.current = false; return; }
    onChangeProp?.(url);
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps -- only fire on url change

  const handleUpload = useCallback(async (file: File) => {
    setUploadError('');
    setUploading(true);
    try {
      const customKey = slug
        ? `${slug}-${imageRole}-${Date.now().toString(36)}`
        : undefined;

      const result = await uploadVideoDirect({ file, customKey });

      if (!mountedRef.current) return;

      if (result.error) {
        setUploadError(result.error);
      } else if (result.url) {
        setUrl(result.url);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Video upload error:', err);
      if (!mountedRef.current) return;
      setUploadError(t.upload.failed);
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  }, [slug, imageRole, t.upload.failed]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = VIDEO_ACCEPT;
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

  const statusText = uploading ? t.upload.uploading : null;

  return (
    <div style={{ marginBottom: compact ? '0.25rem' : '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: compact ? '0.25rem' : '0.375rem' }}>
        <label
          htmlFor={name}
          style={{
            color: compact ? 'rgba(27,54,93,0.5)' : NAVY,
            fontWeight: 600,
            fontSize: compact ? '0.6875rem' : '0.8125rem',
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
        {statusText ? (
          <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
            {statusText}
          </div>
        ) : (
          <>
            <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
              {t.upload.clickOrDragVideo}
            </div>
            <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
              {t.upload.videoFormatHint}
            </div>
          </>
        )}
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
            marginTop: compact ? '0.25rem' : '0.5rem',
            borderRadius: compact ? '4px' : '8px',
            overflow: 'hidden',
            boxShadow: neu(3),
            maxWidth: compact ? '200px' : '300px',
          }}
        >
          <video
            src={getAssetUrl(url)}
            controls
            preload="metadata"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={() => setVideoError(true)}
          />
        </div>
      )}
    </div>
  );
}
