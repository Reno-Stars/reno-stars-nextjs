/**
 * Client-side upload via presigned S3 URL.
 * Bypasses Vercel body size limits by uploading directly from the browser to S3.
 */

import { MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_LABEL, ALLOWED_IMAGE_TYPES, MAX_VIDEO_SIZE, MAX_VIDEO_SIZE_LABEL, ALLOWED_VIDEO_TYPES } from './upload-constants';

interface UploadOptions {
  file: File;
  /** Optional custom S3 key (sanitized server-side) */
  customKey?: string;
}

interface UploadResult {
  url?: string;
  error?: string;
}

/** Upload timeout: 30 minutes (generous for large video files over slow connections). */
const UPLOAD_TIMEOUT_MS = 30 * 60 * 1000;

async function uploadDirect(
  file: File,
  maxSize: number,
  sizeLabel: string,
  allowedTypes: Set<string>,
  typeError: string,
  customKey?: string,
): Promise<UploadResult> {
  if (file.size > maxSize) {
    return { error: `File too large. Maximum size is ${sizeLabel}.` };
  }
  if (!allowedTypes.has(file.type)) {
    return { error: typeError };
  }

  try {
    // Step 1: Get presigned URL from our API
    const presignRes = await fetch('/admin/api/upload/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        customKey,
      }),
    });

    const presignData = await presignRes.json();
    if (!presignRes.ok || presignData.error) {
      return { error: presignData.error || 'Failed to get upload URL.' };
    }

    const { presignedUrl, publicUrl } = presignData as {
      presignedUrl: string;
      publicUrl: string;
    };

    // Step 2: Upload directly to S3
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!uploadRes.ok) {
      if (process.env.NODE_ENV === 'development') {
        const body = await uploadRes.text().catch(() => '');
        console.error('S3 upload error:', uploadRes.status, body);
      }
      return { error: `Upload failed (${uploadRes.status}).` };
    }

    // Step 3: Trigger server-side WebP processing (fire-and-forget, non-blocking)
    // This generates optimized variants in R2 so /api/image is never needed at runtime.
    // Fire-and-forget: don't await, don't block the UI
    fetch('/admin/api/process-image/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: publicUrl }),
    }).catch(() => {
      // Processing failure is non-fatal — /api/image fallback still works
    });

    return { url: publicUrl };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('Upload error:', err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { error: 'Upload timed out. Please try a smaller file or check your connection.' };
    }
    return { error: 'Upload failed. Please try again.' };
  }
}

export function uploadImageDirect({ file, customKey }: UploadOptions): Promise<UploadResult> {
  return uploadDirect(file, MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_LABEL, ALLOWED_IMAGE_TYPES, 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF.', customKey);
}

export function uploadVideoDirect({ file, customKey }: UploadOptions): Promise<UploadResult> {
  return uploadDirect(file, MAX_VIDEO_SIZE, MAX_VIDEO_SIZE_LABEL, ALLOWED_VIDEO_TYPES, 'Invalid file type. Allowed: MP4, WebM, MOV.', customKey);
}
