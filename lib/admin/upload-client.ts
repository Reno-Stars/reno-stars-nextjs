/**
 * Client-side upload via presigned S3 URL.
 * Bypasses Vercel body size limits by uploading directly from the browser to S3.
 */

import { MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_LABEL, ALLOWED_IMAGE_TYPES } from './upload-constants';

interface UploadOptions {
  file: File;
  /** Optional custom S3 key (sanitized server-side) */
  customKey?: string;
}

interface UploadResult {
  url?: string;
  error?: string;
}

export async function uploadImageDirect({
  file,
  customKey,
}: UploadOptions): Promise<UploadResult> {
  // Client-side validation to avoid unnecessary round-trips
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: `File too large. Maximum size is ${MAX_IMAGE_SIZE_LABEL}.` };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF.' };
  }

  try {
    // Step 1: Get presigned URL from our API
    const presignRes = await fetch('/api/admin/upload', {
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
    // Content-Length header must match the fileSize declared to the presign API,
    // which is enforced by the presigned URL's ContentLength condition.
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      return { error: `Upload failed (${uploadRes.status}).` };
    }

    return { url: publicUrl };
  } catch {
    return { error: 'Upload failed. Please try again.' };
  }
}
