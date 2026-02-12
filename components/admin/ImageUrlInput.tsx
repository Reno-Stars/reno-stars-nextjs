'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { uploadImage } from '@/app/actions/admin/upload';
import { getAssetUrl } from '@/lib/storage';
import { CARD, NAVY, GOLD, TEXT_MID, ERROR, neuIn, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ImageUrlInputProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  tooltip?: string;
  /** Optional slug for SEO-friendly upload filenames */
  slug?: string;
  /** Image role used in the S3 key (default: 'hero') */
  imageRole?: string;
}

export default function ImageUrlInput({
  name,
  label,
  defaultValue = '',
  required = false,
  tooltip,
  slug,
  imageRole = 'hero',
}: ImageUrlInputProps) {
  const t = useAdminTranslations();
  const [url, setUrl] = useState(defaultValue);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  // Resolve production URLs to configured storage origin for preview
  const previewSrc = useMemo(() => (url ? getAssetUrl(url) : ''), [url]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.set('file', file);
    if (slug) {
      formData.set('customKey', `${slug}-${imageRole}`);
    }

    const result = await uploadImage({}, formData);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setUrl(result.url);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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
              aria-label="Help"
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
        placeholder={t.upload.placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: 'none',
          boxShadow: neuIn(3),
          backgroundColor: CARD,
          color: NAVY,
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Upload area */}
      <button
        type="button"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
        onClick={() => !uploading && fileInputRef.current?.click()}
        aria-label={`${t.upload.uploadImageFor} ${label}`}
        disabled={uploading}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <div style={{ color: TEXT_MID, fontSize: '0.8125rem' }}>
          {uploading ? t.upload.uploading : t.upload.clickOrDrag}
        </div>
        <div style={{ color: TEXT_MID, fontSize: '0.6875rem', marginTop: '0.25rem' }}>
          {t.upload.formatHint}
        </div>
      </button>

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
            src={previewSrc}
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
