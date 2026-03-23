'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import {
  SURFACE,
  SURFACE_ALT,
  GOLD,
  GOLD_HOVER,
  GOLD_PALE,
  NAVY,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
  SUCCESS,
  ERROR,
  ERROR_BG,
  INFO,
  INFO_BG,
  neu,
} from '@/lib/theme';
import type { BatchJobStatus } from '@/lib/db/schema';
import { MAX_ZIP_SIZE, PRESIGN_BATCH_SIZE } from '@/lib/batch/types';
import type { BatchUploadMode, ClientManifest, ClientProject } from '@/lib/batch/types';
import { extractZipInBrowser, type ExtractResult } from '@/lib/batch/client-zip-extractor';
import type { SaveProjectInput } from '@/lib/batch/batch-processor';

interface JobData {
  id: string;
  status: BatchJobStatus;
  fileName: string;
  totalImages: number;
  processedImages: number;
  currentStepLabel: string | null;
  createdSiteIds: string[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
  errors: string[];
  startedAt: string | null;
  completedAt: string | null;
}

type Phase = 'upload' | 'processing' | 'results';

/** Entity metadata task for AI generation */
interface MetadataTask {
  entityType: 'site' | 'project';
  folderName: string;
  serviceType?: string | null;
  notes?: string | null;
  skipFolderName?: boolean;
  zipBaseName?: string;
}

/** MetadataTask with a unique key for result storage */
interface MetadataTaskKeyed extends MetadataTask {
  metadataKey: string;
}

/** Max retries per image upload */
const UPLOAD_MAX_RETRIES = 3;

/** Max standalone projects saved per request */
const SAVE_BATCH_SIZE = 5;

/** Type guard for structured errors returned by save endpoints */
function isSaveError(v: unknown): v is { message: string; severity: 'critical' | 'warning' } {
  return (
    typeof v === 'object' && v !== null &&
    typeof (v as Record<string, unknown>).message === 'string' &&
    ((v as Record<string, unknown>).severity === 'critical' || (v as Record<string, unknown>).severity === 'warning')
  );
}

// ============================================================================
// STEP PROGRESS
// ============================================================================

const STEPS: { key: BatchJobStatus; labelKey: string }[] = [
  { key: 'extracting', labelKey: 'stepExtracting' },
  { key: 'uploading', labelKey: 'stepUploading' },
  { key: 'generating', labelKey: 'stepGenerating' },
  { key: 'saving', labelKey: 'stepSaving' },
  { key: 'generating_blog', labelKey: 'stepBlog' },
];

function getStepIndex(status: BatchJobStatus): number {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ============================================================================
// SHARED STYLES
// ============================================================================

const actionLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  backgroundColor: NAVY,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontWeight: 600,
  textDecoration: 'none',
};

// ============================================================================
// HELPERS
// ============================================================================

/** Convert ClientProject to SaveProjectInput (resolve uploaded URLs) */
function toSaveProjectInput(cp: ClientProject): SaveProjectInput {
  const productImageUrls: Record<number, string> = {};
  for (const [idx, img] of cp.productImageEntries) {
    if (img.uploadedUrl) productImageUrls[idx] = img.uploadedUrl;
  }
  return {
    folderName: cp.folderName,
    serviceType: cp.serviceType,
    heroImageUrl: cp.heroImage?.uploadedUrl ?? null,
    imagePairs: cp.imagePairs.map((p) => ({
      index: p.index,
      beforeUrl: p.before?.uploadedUrl ?? null,
      afterUrl: p.after?.uploadedUrl ?? null,
    })),
    notes: cp.notes,
    productsText: cp.productsText,
    productImageUrls,
  };
}

/** Fire-and-forget job status update to server for polling compatibility */
async function patchJob(jobId: string, data: Record<string, unknown>) {
  try {
    await fetch(`/admin/batch-upload/api/${jobId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Non-critical — progress display is client-driven
  }
}

// ============================================================================
// PIPELINE PHASE FUNCTIONS
// ============================================================================

/** Shared context passed to each pipeline phase */
interface PipelineCtx {
  jobId: string;
  manifest: ClientManifest;
  mode: BatchUploadMode;
  abort: AbortController;
  addError: (msg: string, critical?: boolean) => void;
  createdSiteIds: string[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
  setProgressPercent: (pct: number) => void;
  setProgressLabel: (label: string) => void;
  bt: Record<string, string>;
}

/** Phase 2: Upload images to S3 via presigned URLs */
async function uploadImages(
  ctx: PipelineCtx,
  imageDataMap: Map<string, Uint8Array>,
) {
  const { jobId, manifest, abort, addError, setProgressPercent, setProgressLabel, bt } = ctx;
  const allImages = manifest.allImages;
  let uploadedCount = 0;

  for (let i = 0; i < allImages.length; i += PRESIGN_BATCH_SIZE) {
    if (abort.signal.aborted) throw new Error('Aborted');

    const batch = allImages.slice(i, i + PRESIGN_BATCH_SIZE);

    const presignRes = await fetch(`/admin/batch-upload/api/${jobId}/presign-batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: batch.map((img) => ({ s3Key: img.s3Key, contentType: img.mimeType })),
      }),
      signal: abort.signal,
    });

    if (!presignRes.ok) {
      throw new Error('Failed to get presigned URLs');
    }

    const { results: presignResults } = await presignRes.json() as {
      results: { s3Key: string; presignedUrl: string; publicUrl: string }[];
    };

    const uploadPromises = batch.map(async (img, batchIdx) => {
      const presign = presignResults[batchIdx];
      const data = imageDataMap.get(img.s3Key);
      if (!data) {
        addError(`Missing data for ${img.path}`);
        return false;
      }

      for (let attempt = 0; attempt < UPLOAD_MAX_RETRIES; attempt++) {
        try {
          const blob = new Blob([new Uint8Array(data)], { type: img.mimeType });
          const s3Res = await fetch(presign.presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': img.mimeType },
            signal: abort.signal,
          });
          if (!s3Res.ok) throw new Error(`Upload failed (${s3Res.status})`);
          img.uploadedUrl = presign.publicUrl;
          return true;
        } catch (err) {
          if (abort.signal.aborted) throw err;
          if (attempt === UPLOAD_MAX_RETRIES - 1) {
            addError(`Upload failed: ${img.path}`);
          } else {
            await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
          }
        }
      }
      return false;
    });

    const results = await Promise.allSettled(uploadPromises);
    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    uploadedCount += successCount;

    setProgressPercent(Math.round((uploadedCount / allImages.length) * 100));
    setProgressLabel(
      bt.progressLabel
        .replace('{processed}', String(uploadedCount))
        .replace('{total}', String(allImages.length)),
    );
    await patchJob(jobId, { processedImages: uploadedCount });
  }

  imageDataMap.clear();
}

/** Phase 3: Generate AI metadata for all entities */
async function generateMetadata(
  ctx: PipelineCtx,
  zipBaseName: string,
): Promise<Map<string, Record<string, unknown>>> {
  const { jobId, manifest, mode, abort, addError, setProgressPercent } = ctx;
  const metadataResults = new Map<string, Record<string, unknown>>();
  const tasks: MetadataTaskKeyed[] = [];

  if (mode === 'sites') {
    for (const site of manifest.sites) {
      tasks.push({ entityType: 'site', folderName: site.folderName, notes: site.notes, metadataKey: `site:${site.folderName}` });
      for (const proj of site.projects) {
        tasks.push({
          entityType: 'project', folderName: proj.folderName, serviceType: proj.serviceType,
          notes: proj.notes, metadataKey: `project:${site.folderName}/${proj.folderName}`,
        });
      }
    }
  } else {
    const singleProject = manifest.projects.length === 1;
    for (const proj of manifest.projects) {
      tasks.push({
        entityType: 'project', folderName: proj.folderName, serviceType: proj.serviceType,
        notes: proj.notes, skipFolderName: true,
        zipBaseName: singleProject ? zipBaseName : undefined,
        metadataKey: `project:${proj.folderName}`,
      });
    }
  }

  for (let i = 0; i < tasks.length; i++) {
    if (abort.signal.aborted) throw new Error('Aborted');
    const task = tasks[i];

    try {
      const res = await fetch(`/admin/batch-upload/api/${jobId}/generate-metadata/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: task.entityType, folderName: task.folderName,
          serviceType: task.serviceType, notes: task.notes,
          skipFolderName: task.skipFolderName, zipBaseName: task.zipBaseName,
        }),
        signal: abort.signal,
      });

      if (res.ok) {
        const { metadata } = await res.json();
        metadataResults.set(task.metadataKey, metadata);
      } else {
        addError(`AI metadata failed for ${task.folderName} (using fallback)`);
      }
    } catch (err) {
      if (abort.signal.aborted) throw err;
      addError(`AI metadata error for ${task.folderName} (using fallback)`);
    }

    setProgressPercent(Math.round(((i + 1) / tasks.length) * 100));
  }

  return metadataResults;
}

/** Consume save endpoint errors with runtime validation */
function consumeSaveErrors(result: Record<string, unknown>, addError: (msg: string, critical?: boolean) => void) {
  if (Array.isArray(result.errors)) {
    for (const e of result.errors) {
      if (isSaveError(e)) {
        addError(e.message, e.severity === 'critical');
      } else if (typeof e === 'string') {
        addError(e);
      }
    }
  }
}

/** Phase 4: Save entities to DB */
async function saveEntities(
  ctx: PipelineCtx,
  metadataResults: Map<string, Record<string, unknown>>,
  zipBaseName: string,
) {
  const { jobId, manifest, mode, abort, addError, createdSiteIds, createdProjectIds, setProgressPercent } = ctx;

  if (mode === 'sites') {
    for (let sIdx = 0; sIdx < manifest.sites.length; sIdx++) {
      if (abort.signal.aborted) throw new Error('Aborted');
      const site = manifest.sites[sIdx];

      const siteProductImageUrls: Record<number, string> = {};
      for (const [idx, img] of site.productImageEntries) {
        if (img.uploadedUrl) siteProductImageUrls[idx] = img.uploadedUrl;
      }

      const saveBody = {
        site: {
          folderName: site.folderName,
          heroImageUrl: site.heroImage?.uploadedUrl ?? null,
          imagePairs: site.imagePairs.map((p) => ({
            index: p.index,
            beforeUrl: p.before?.uploadedUrl ?? null,
            afterUrl: p.after?.uploadedUrl ?? null,
          })),
          productsText: site.productsText,
          productImageUrls: siteProductImageUrls,
          aiMetadata: metadataResults.get(`site:${site.folderName}`) ?? null,
        },
        projects: site.projects.map((proj) => ({
          project: toSaveProjectInput(proj),
          aiMetadata: metadataResults.get(`project:${site.folderName}/${proj.folderName}`) ?? null,
        })),
        zipBaseName,
      };

      try {
        const res = await fetch(`/admin/batch-upload/api/${jobId}/save-site/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveBody),
          signal: abort.signal,
        });
        const result = await res.json();
        if (result.siteId) createdSiteIds.push(result.siteId);
        if (result.projectIds) createdProjectIds.push(...result.projectIds);
        consumeSaveErrors(result, addError);
      } catch (err) {
        if (abort.signal.aborted) throw err;
        addError(`Failed to save site "${site.folderName}"`, true);
      }

      setProgressPercent(Math.round(((sIdx + 1) / manifest.sites.length) * 100));
    }
  } else {
    for (let i = 0; i < manifest.projects.length; i += SAVE_BATCH_SIZE) {
      if (abort.signal.aborted) throw new Error('Aborted');
      const batch = manifest.projects.slice(i, i + SAVE_BATCH_SIZE);
      const singleProject = manifest.projects.length === 1;

      try {
        const res = await fetch(`/admin/batch-upload/api/${jobId}/save-standalone-projects/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: batch.map((proj) => ({
              project: toSaveProjectInput(proj),
              aiMetadata: metadataResults.get(`project:${proj.folderName}`) ?? null,
            })),
            zipBaseName: singleProject ? zipBaseName : undefined,
          }),
          signal: abort.signal,
        });
        const result = await res.json();
        if (result.projectIds) createdProjectIds.push(...result.projectIds);
        consumeSaveErrors(result, addError);
      } catch (err) {
        if (abort.signal.aborted) throw err;
        addError(`Failed to save projects batch starting at ${batch[0].folderName}`, true);
      }

      setProgressPercent(Math.round(Math.min(i + SAVE_BATCH_SIZE, manifest.projects.length) / manifest.projects.length * 100));
    }
  }
}

/** Phase 5: Generate blog posts (optional) */
async function generateBlogs(ctx: PipelineCtx) {
  const { jobId, mode, abort, addError, createdSiteIds, createdProjectIds, createdBlogPostIds, setProgressPercent } = ctx;

  const blogEntities = mode === 'sites'
    ? createdSiteIds.map((id) => ({ entityType: 'site' as const, entityId: id }))
    : createdProjectIds.map((id) => ({ entityType: 'project' as const, entityId: id }));

  for (let i = 0; i < blogEntities.length; i++) {
    if (abort.signal.aborted) throw new Error('Aborted');
    const entity = blogEntities[i];

    try {
      const res = await fetch(`/admin/batch-upload/api/${jobId}/generate-blog/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
        signal: abort.signal,
      });

      if (res.ok) {
        const { blogPostId } = await res.json();
        if (blogPostId) createdBlogPostIds.push(blogPostId);
      } else {
        addError(`Blog generation failed for ${entity.entityType} ${entity.entityId}`);
      }
    } catch (err) {
      if (abort.signal.aborted) throw err;
      addError(`Blog generation error for ${entity.entityType} ${entity.entityId}`);
    }

    setProgressPercent(Math.round(((i + 1) / blogEntities.length) * 100));
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BatchUploadClient() {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const bt = t.batchUpload;

  const [mode, setMode] = useState<BatchUploadMode>('sites');
  const [phase, setPhase] = useState<Phase>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [generateBlog, setGenerateBlog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Client-orchestrated progress
  const [currentStep, setCurrentStep] = useState<BatchJobStatus>('pending');
  const [progressLabel, setProgressLabel] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ---- File handling ----
  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.zip')) {
      setError(bt.errorZipOnly);
      return;
    }
    if (f.size > MAX_ZIP_SIZE) {
      setError(bt.errorTooLarge);
      return;
    }
    setFile(f);
    setError(null);
  }, [bt]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  // ---- Client-orchestrated pipeline ----
  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setCurrentStep('extracting');
    setProgressLabel('');
    setProgressPercent(0);

    const abort = new AbortController();
    abortRef.current = abort;

    const collectedErrors: string[] = [];
    let criticalErrorCount = 0;
    const createdSiteIds: string[] = [];
    const createdProjectIds: string[] = [];
    const createdBlogPostIds: string[] = [];
    let jobId = '';

    function addError(msg: string, critical = false) {
      collectedErrors.push(msg);
      if (critical) criticalErrorCount++;
    }

    // Guarded setters — only update React state if component is still mounted
    const guardedSetPercent = (pct: number) => { if (mountedRef.current) setProgressPercent(pct); };
    const guardedSetLabel = (label: string) => { if (mountedRef.current) setProgressLabel(label); };

    try {
      // ---- Phase 1: Extract ZIP in browser ----
      if (!mountedRef.current) return;
      setPhase('processing');
      setCurrentStep('extracting');

      let extractResult: ExtractResult;
      try {
        extractResult = await extractZipInBrowser(file, mode);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'ZIP extraction failed');
      }

      const { manifest, imageDataMap } = extractResult;

      if (manifest.totalImages === 0) {
        throw new Error(bt.noImages);
      }

      if (manifest.skippedFiles.length > 0) {
        const MAX_LISTED = 10;
        const listed = manifest.skippedFiles.slice(0, MAX_LISTED).map((entry) => entry.split('/').pop()).join(', ');
        const suffix = manifest.skippedFiles.length > MAX_LISTED ? ` and ${manifest.skippedFiles.length - MAX_LISTED} more` : '';
        addError(`${manifest.skippedFiles.length} unsupported image(s) skipped: ${listed}${suffix}`);
      }

      // ---- Create job on server ----
      const initRes = await fetch('/admin/batch-upload/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name, fileSize: file.size,
          generateBlog, mode, totalImages: manifest.totalImages,
        }),
        signal: abort.signal,
      });
      if (!initRes.ok) {
        const data = await initRes.json();
        throw new Error(data.error || bt.errorUploadFailed);
      }
      jobId = (await initRes.json()).jobId;

      if (!mountedRef.current) return;
      setJob({
        id: jobId, status: 'extracting', fileName: file.name,
        totalImages: manifest.totalImages, processedImages: 0,
        currentStepLabel: null, createdSiteIds: [], createdProjectIds: [],
        createdBlogPostIds: [], errors: [],
        startedAt: new Date().toISOString(), completedAt: null,
      });

      const ctx: PipelineCtx = {
        jobId, manifest, mode, abort, addError,
        createdSiteIds, createdProjectIds, createdBlogPostIds,
        setProgressPercent: guardedSetPercent, setProgressLabel: guardedSetLabel, bt,
      };

      const zipBaseName = file.name.replace(/\.zip$/i, '');

      // ---- Phase 2: Upload images ----
      if (!mountedRef.current) return;
      setCurrentStep('uploading');
      await patchJob(jobId, { status: 'uploading' });
      await uploadImages(ctx, imageDataMap);

      // ---- Phase 3: Generate AI metadata ----
      if (!mountedRef.current) return;
      setCurrentStep('generating');
      setProgressPercent(0);
      setProgressLabel('');
      await patchJob(jobId, { status: 'generating' });
      const metadataResults = await generateMetadata(ctx, zipBaseName);

      // ---- Phase 4: Save to DB ----
      if (!mountedRef.current) return;
      setCurrentStep('saving');
      setProgressPercent(0);
      setProgressLabel('');
      await patchJob(jobId, { status: 'saving' });
      await saveEntities(ctx, metadataResults, zipBaseName);
      await patchJob(jobId, { createdSiteIds, createdProjectIds });

      // ---- Phase 5: Generate blog posts (optional) ----
      if (generateBlog) {
        if (!mountedRef.current) return;
        setCurrentStep('generating_blog');
        setProgressPercent(0);
        await patchJob(jobId, { status: 'generating_blog' });
        await generateBlogs(ctx);
      }

      // ---- Done ----
      const hasCreations = createdSiteIds.length > 0 || createdProjectIds.length > 0;
      const finalStatus: BatchJobStatus = criticalErrorCount > 0 && hasCreations
        ? 'partial'
        : criticalErrorCount > 0 && !hasCreations
        ? 'failed'
        : 'completed';

      await patchJob(jobId, {
        status: finalStatus, completedAt: new Date().toISOString(),
        createdSiteIds, createdProjectIds, createdBlogPostIds, errors: collectedErrors,
      });

      if (mountedRef.current) {
        setJob({
          id: jobId, status: finalStatus, fileName: file.name,
          totalImages: manifest.totalImages, processedImages: manifest.totalImages,
          currentStepLabel: null, createdSiteIds, createdProjectIds,
          createdBlogPostIds, errors: collectedErrors,
          startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        });
        setPhase('results');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : bt.errorUploadFailed;

      if (jobId) {
        const hasCreations = createdSiteIds.length > 0 || createdProjectIds.length > 0;
        addError(msg, true);
        await patchJob(jobId, {
          status: hasCreations ? 'partial' : 'failed',
          completedAt: new Date().toISOString(),
          createdSiteIds, createdProjectIds, createdBlogPostIds, errors: collectedErrors,
        });
        setJob((prev) => prev ? {
          ...prev, status: hasCreations ? 'partial' : 'failed',
          createdSiteIds, createdProjectIds, createdBlogPostIds,
          errors: collectedErrors, completedAt: new Date().toISOString(),
        } : null);
        setPhase('results');
      } else {
        setPhase('upload');
        setError(msg);
      }
    } finally {
      if (mountedRef.current) setUploading(false);
      abortRef.current = null;
    }
  }, [file, generateBlog, mode, bt]);

  // ---- Reset ----
  const handleReset = useCallback(() => {
    setPhase('upload');
    setFile(null);
    setJob(null);
    setError(null);
    setShowErrors(false);
    setGenerateBlog(false);
    setShowHelp(false);
    setCurrentStep('pending');
    setProgressLabel('');
    setProgressPercent(0);
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  // ---- Render ----
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* MODE TABS */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '1.5rem',
          borderBottom: `2px solid ${SURFACE_ALT}`,
        }}
      >
        {(['sites', 'standalone'] as const).map((tab) => {
          const isActive = mode === tab;
          const label = tab === 'sites' ? bt.tabSites : bt.tabStandalone;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="batch-upload-panel"
              onClick={() => {
                if (mode !== tab) {
                  setMode(tab);
                  setFile(null);
                  setError(null);
                  setShowHelp(false);
                }
              }}
              disabled={phase !== 'upload'}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? GOLD : 'transparent'}`,
                marginBottom: -2,
                color: isActive ? GOLD : TEXT_MID,
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9375rem',
                cursor: phase !== 'upload' ? 'default' : 'pointer',
                opacity: phase !== 'upload' ? 0.5 : 1,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div id="batch-upload-panel" role="tabpanel">
      <p style={{ color: TEXT_MID, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
        {mode === 'standalone' ? bt.descriptionStandalone : bt.description}
      </p>

      {/* PHASE: UPLOAD */}
      {phase === 'upload' && (
        <div
          style={{
            background: SURFACE,
            borderRadius: 12,
            padding: '2rem',
            boxShadow: neu(4),
          }}
        >
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            style={{
              border: `2px dashed ${dragActive ? GOLD : TEXT_MUTED}`,
              borderRadius: 8,
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragActive ? GOLD_PALE : 'transparent',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={dragActive ? GOLD : TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={{ color: dragActive ? GOLD : TEXT_MID, fontWeight: 500 }}>
              {dragActive ? bt.uploadZoneActive : bt.uploadZone}
            </p>
            <p style={{ color: TEXT_MUTED, fontSize: '0.8125rem', marginTop: '0.5rem' }}>
              {bt.maxSize}
            </p>
          </div>

          {/* Selected file */}
          {file && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: SURFACE_ALT,
                borderRadius: 8,
                marginBottom: '1rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 500, fontSize: '0.875rem' }}>
                  {file.name}
                </div>
                <div style={{ color: TEXT_MUTED, fontSize: '0.75rem' }}>
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: TEXT_MUTED,
                  padding: '0.25rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Options */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: TEXT,
            }}
          >
            <input
              type="checkbox"
              checked={generateBlog}
              onChange={(e) => setGenerateBlog(e.target.checked)}
              style={{ accentColor: GOLD }}
            />
            <span>{bt.generateBlog}</span>
            <span style={{ color: TEXT_MUTED, fontSize: '0.75rem' }}>
              ({mode === 'standalone' ? bt.generateBlogHelpStandalone : bt.generateBlogHelp})
            </span>
          </label>

          {/* Help section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: showHelp ? '0.75rem' : '1.5rem',
            }}
          >
            <button
              type="button"
              aria-expanded={showHelp}
              aria-controls="batch-help-section"
              onClick={() => setShowHelp((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: INFO,
                fontSize: '0.8125rem',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {bt.folderStructureTitle}
            </button>
            <a
              href={mode === 'standalone'
                ? `/example-batch-upload-standalone-${locale}.zip`
                : `/example-batch-upload-${locale}.zip`
              }
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: GOLD,
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.textDecoration = 'none'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {bt.downloadExample}
            </a>
          </div>

          {showHelp && (
            <div
              id="batch-help-section"
              style={{
                backgroundColor: INFO_BG,
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.8125rem',
                color: TEXT,
                lineHeight: 1.6,
              }}
            >
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
{mode === 'standalone'
? `Kitchen Renovation/              <- Project (auto-detected)
  hero.jpg                       <- Hero image
  notes.txt                      <- AI context (see template)
  products.txt                   <- External product links
  product-1.jpg                  <- Image for 1st product
  before-1.jpg / after-1.jpg     <- Image pairs
  before-2.jpg / after-2.jpg
Bathroom Remodel/
  hero.jpg
  notes.txt
  before-1.jpg / after-1.jpg
Basement/
  before-1.jpg / after-1.jpg`
: `Richmond Whole House/            <- Site name
  hero.jpg                       <- Site hero image
  notes.txt                      <- AI context (see template)
  products.txt                   <- External product links
  product-1.jpg                  <- Image for 1st product
  product-3.jpg                  <- Image for 3rd (skip 2nd)
  before-1.jpg / after-1.jpg     <- Site-level pairs
  before-2.jpg / after-2.jpg
  exterior.jpg                   <- Standalone site image
  Kitchen/                       <- Project (auto-detected)
    notes.txt                    <- AI context (see template)
    products.txt                 <- External product links
    product-1.jpg                <- Image for 1st product
    before-1.jpg / after-1.jpg   <- Project pairs
    before-2.jpg / after-2.jpg
  Bathroom/
    before-1.jpg / after-1.jpg
  Basement/
    hero.jpg                     <- Project hero image
    notes.txt
    before-1.jpg / after-1.jpg`}
              </pre>
              <p style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                {mode === 'standalone' ? bt.folderStructureHelpStandalone : bt.folderStructureHelp}
              </p>
              <div
                style={{
                  borderTop: `1px solid rgba(27,54,93,0.1)`,
                  paddingTop: '0.75rem',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                  {bt.notesHelpTitle}
                </strong>
                <p style={{ margin: '0 0 0.5rem' }}>
                  {bt.notesHelpBody}
                </p>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', backgroundColor: 'rgba(27,54,93,0.05)', borderRadius: 6, padding: '0.625rem' }}>
{bt.notesExample}
                </pre>
                <strong style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                  {bt.productsHelpTitle}
                </strong>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', backgroundColor: 'rgba(27,54,93,0.05)', borderRadius: 6, padding: '0.625rem' }}>
{bt.productsHelpBody}
                </pre>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: ERROR_BG,
                color: ERROR,
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || uploading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: !file || uploading ? TEXT_MUTED : GOLD,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: !file || uploading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (file && !uploading) e.currentTarget.style.backgroundColor = GOLD_HOVER;
            }}
            onMouseLeave={(e) => {
              if (file && !uploading) e.currentTarget.style.backgroundColor = GOLD;
            }}
          >
            {uploading ? bt.uploading : bt.uploadButton}
          </button>
        </div>
      )}

      {/* PHASE: PROCESSING */}
      {phase === 'processing' && (
        <div
          style={{
            background: SURFACE,
            borderRadius: 12,
            padding: '2rem',
            boxShadow: neu(4),
          }}
        >
          <h3 style={{ color: TEXT, marginTop: 0, marginBottom: '1.5rem' }}>
            {bt.processing}
          </h3>

          {/* Step indicators */}
          <div style={{ marginBottom: '1.5rem' }}>
            {STEPS.map((step, idx) => {
              const currentIdx = getStepIndex(currentStep);
              const isActive = idx === currentIdx;
              const isDone = idx < currentIdx;
              // Skip blog step indicator if not generating blog
              if (step.key === 'generating_blog' && !generateBlog) return null;
              const stepLabel = (bt as Record<string, string>)[step.labelKey] ?? step.key;

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    opacity: isDone || isActive ? 1 : 0.4,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDone ? SUCCESS : isActive ? GOLD : SURFACE_ALT,
                      flexShrink: 0,
                    }}
                  >
                    {isDone && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isActive && (
                      <div
                        className="admin-spin"
                        style={{
                          width: 14,
                          height: 14,
                          border: '2px solid #fff',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'admin-spin 0.8s linear infinite',
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: isActive ? TEXT : TEXT_MID, fontWeight: isActive ? 600 : 400, fontSize: '0.875rem' }}>
                    {stepLabel}
                  </span>
                  {isActive && progressPercent > 0 && (
                    <span style={{ color: TEXT_MUTED, fontSize: '0.8125rem', marginLeft: 'auto' }}>
                      {progressPercent}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar (shown for active step with progress) */}
          {progressPercent > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  height: 8,
                  backgroundColor: SURFACE_ALT,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: GOLD,
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              {progressLabel && (
                <p style={{ color: TEXT_MUTED, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {progressLabel}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE: RESULTS */}
      {phase === 'results' && job && (
        <div
          style={{
            background: SURFACE,
            borderRadius: 12,
            padding: '2rem',
            boxShadow: neu(4),
          }}
        >
          {/* Status header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  job.status === 'completed' ? SUCCESS
                  : job.status === 'partial' ? GOLD
                  : ERROR,
              }}
            >
              {job.status === 'completed' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : job.status === 'partial' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>
            <h3 style={{ margin: 0, color: TEXT }}>
              {job.status === 'completed'
                ? bt.jobCompleted
                : job.status === 'partial'
                ? bt.jobPartial
                : bt.jobFailed}
            </h3>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {mode === 'sites' && (
              <SummaryCard
                label={bt.sitesCreated.replace('{count}', String(job.createdSiteIds.length))}
                count={job.createdSiteIds.length}
                color={NAVY}
                bgColor={SURFACE_ALT}
              />
            )}
            <SummaryCard
              label={bt.projectsCreated.replace('{count}', String(job.createdProjectIds.length))}
              count={job.createdProjectIds.length}
              color={GOLD}
              bgColor={GOLD_PALE}
            />
            {job.createdBlogPostIds.length > 0 && (
              <SummaryCard
                label={bt.blogsCreated.replace('{count}', String(job.createdBlogPostIds.length))}
                count={job.createdBlogPostIds.length}
                color={INFO}
                bgColor={INFO_BG}
              />
            )}
          </div>

          {/* Errors / Warnings */}
          {job.errors.length > 0 && (
            <ErrorWarningSection
              job={job}
              bt={bt}
              showErrors={showErrors}
              onToggleErrors={() => setShowErrors((prev) => !prev)}
            />
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {mode === 'standalone' && job.createdProjectIds.length > 0 && (
              <Link href="/admin/sites" style={actionLinkStyle}>
                {bt.reviewProjects}
              </Link>
            )}
            {mode === 'sites' && job.createdSiteIds.length > 0 && (
              <Link
                href={job.createdSiteIds.length === 1
                  ? `/admin/sites/${job.createdSiteIds[0]}`
                  : '/admin/sites'}
                style={actionLinkStyle}
              >
                {bt.reviewSites}
              </Link>
            )}
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: SURFACE_ALT,
                color: TEXT,
                border: 'none',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {bt.uploadAnother}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ErrorWarningSection({
  job,
  bt,
  showErrors,
  onToggleErrors,
}: {
  job: JobData;
  bt: Record<string, string>;
  showErrors: boolean;
  onToggleErrors: () => void;
}) {
  const isWarning = job.status === 'completed';
  const toggleColor = isWarning ? GOLD : ERROR;
  const listBg = isWarning ? GOLD_PALE : ERROR_BG;
  const label = isWarning
    ? bt.warningsCount.replace('{count}', String(job.errors.length))
    : bt.errorsCount.replace('{count}', String(job.errors.length));

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        type="button"
        onClick={onToggleErrors}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: toggleColor,
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {label}
        {' '}
        ({showErrors ? bt.hideErrors : bt.showErrors})
      </button>
      {showErrors && (
        <ul
          style={{
            backgroundColor: listBg,
            borderRadius: 8,
            padding: '1rem 1rem 1rem 2rem',
            marginTop: '0.5rem',
            fontSize: '0.8125rem',
            color: TEXT,
            listStyle: 'disc',
          }}
        >
          {job.errors.map((err, idx) => (
            <li key={`${idx}-${err}`} style={{ marginBottom: '0.25rem' }}>
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: 8,
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: '0.75rem', color: TEXT_MID, marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  );
}
