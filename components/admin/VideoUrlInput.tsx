'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { uploadVideoDirect } from '@/lib/admin/upload-client';
import { compressVideo, formatBytes } from '@/lib/admin/video-compress';
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
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionInfo, setCompressionInfo] = useState('');

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const busy = compressing || uploading;

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setVideoError(false);
  }, [url]);

  const handleUpload = useCallback(async (file: File) => {
    setUploadError('');
    setCompressionInfo('');
    setCompressionProgress(0);

    // --- Compression step ---
    setCompressing(true);
    let fileToUpload = file;
    try {
      const result = await compressVideo(
        file,
        (pct) => { if (mountedRef.current) setCompressionProgress(pct); },
        () => { if (mountedRef.current) setCompressionProgress(-1); },
      );

      if (!mountedRef.current) return;

      if (result.skipped) {
        setCompressionInfo(t.upload.compressionSkipped);
      } else {
        const percent = Math.round(
          ((result.originalSize - result.compressedSize) / result.originalSize) * 100,
        );
        setCompressionInfo(
          t.upload.compressionDone
            .replace('{original}', formatBytes(result.originalSize))
            .replace('{compressed}', formatBytes(result.compressedSize))
            .replace('{percent}', String(percent)),
        );
        fileToUpload = result.file;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Video compression error:', err);
      if (!mountedRef.current) return;
      // Compression failed — upload original
      setCompressionInfo(t.upload.compressionSkipped);
    } finally {
      if (mountedRef.current) setCompressing(false);
    }

    if (!mountedRef.current) return;

    // --- Upload step ---
    setUploading(true);
    try {
      const customKey = slug
        ? `${slug}-${imageRole}-${Date.now().toString(36)}`
        : undefined;

      const result = await uploadVideoDirect({ file: fileToUpload, customKey });

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
  }, [slug, imageRole, t.upload.compressionSkipped, t.upload.compressionDone, t.upload.failed]);

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

  // Status text shown in the upload area
  const statusText = compressing
    ? compressionProgress < 0
      ? t.upload.loadingFfmpeg
      : t.upload.compressing.replace('{percent}', String(compressionProgress))
    : uploading
      ? t.upload.uploading
      : null;

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
        onKeyDown={(e) => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFilePicker(); } }}
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.75rem',
          borderRadius: '8px',
          border: `2px dashed ${busy ? GOLD : '#ccc'}`,
          backgroundColor: CARD,
          textAlign: 'center',
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
        onClick={() => !busy && openFilePicker()}
        aria-label={`${t.upload.uploadVideoFor} ${label}`}
        aria-disabled={busy}
      >
        {statusText ? (
          <>
            <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
              {statusText}
            </div>
            {/* Progress bar during compression */}
            {compressing && compressionProgress >= 0 && (
              <div
                style={{
                  marginTop: '0.5rem',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: '#e0e0e0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${compressionProgress}%`,
                    backgroundColor: GOLD,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
            {/* Show compression result once done, while uploading */}
            {!compressing && compressionInfo && (
              <div style={{ color: GOLD, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                {compressionInfo}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
              {t.upload.clickOrDragVideo}
            </div>
            <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
              {compressionInfo || t.upload.videoFormatHint}
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
