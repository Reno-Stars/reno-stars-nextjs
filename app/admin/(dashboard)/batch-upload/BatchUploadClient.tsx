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
import { MAX_ZIP_SIZE } from '@/lib/batch/types';
import type { BatchUploadMode } from '@/lib/batch/types';

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

/** Multipart upload chunk size. S3/R2 minimum is 5 MB for non-final parts. */
const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
const CHUNK_MAX_RETRIES = 3;

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

/** Resolve `__TIMEOUT_*__` markers from the server into bilingual display text. */
function resolveErrorLabel(
  err: string,
  bt: Record<string, string>
): string {
  if (err === '__TIMEOUT_PARTIAL__') return bt.timeoutPartial;
  if (err === '__TIMEOUT_FAILED__') return bt.timeoutFailed;
  if (err.startsWith('__TIMEOUT_STEP__:')) {
    const step = err.split(':')[1];
    const stepMap: Record<string, string | undefined> = {
      uploading: bt.timeoutStepUploading,
      generating: bt.timeoutStepGenerating,
      saving: bt.timeoutStepSaving,
      generating_blog: bt.timeoutStepBlogging,
    };
    return stepMap[step] ?? '';
  }
  return err;
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
  const [s3Progress, setS3Progress] = useState(0); // 0–100
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const pollFailCountRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ---- Polling ----
  const MAX_POLL_FAILURES = 10;

  const startPolling = useCallback((jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollFailCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/admin/batch-upload/api/${jobId}/`);
        if (!res.ok) return;
        const data: JobData = await res.json();
        if (!mountedRef.current) return;

        pollFailCountRef.current = 0;
        setJob(data);

        // Stop polling on terminal states
        if (['completed', 'failed', 'partial'].includes(data.status)) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setPhase('results');
        }
      } catch {
        pollFailCountRef.current++;
        if (pollFailCountRef.current >= MAX_POLL_FAILURES) {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          if (mountedRef.current) setError(bt.errorUploadFailed);
        }
      }
    }, 2000);
  }, [bt]);

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

  // ---- Upload & Process ----
  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    let s3UploadOk = false;

    try {
      // Step 1: Create job on server
      const initController = new AbortController();
      const initTimeout = setTimeout(() => initController.abort(), 30_000);
      const initRes = await fetch('/admin/batch-upload/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          generateBlog,
          mode,
        }),
        signal: initController.signal,
      });
      clearTimeout(initTimeout);

      if (!initRes.ok) {
        const data = await initRes.json();
        throw new Error(data.error || bt.errorUploadFailed);
      }

      const initData: Record<string, unknown> = await initRes.json();
      if (typeof initData.jobId !== 'string') {
        throw new Error(bt.errorUploadFailed);
      }
      const validJobId = initData.jobId;

      // Step 2: Switch to processing phase and start polling early.
      // Polling picks up server-side status even if subsequent client steps fail.
      if (!mountedRef.current) return;
      setPhase('processing');
      setJob({
        id: validJobId,
        status: 'pending',
        fileName: file.name,
        totalImages: 0,
        processedImages: 0,
        currentStepLabel: null,
        createdSiteIds: [],
        createdProjectIds: [],
        createdBlogPostIds: [],
        errors: [],
        startedAt: null,
        completedAt: null,
      });
      startPolling(validJobId);

      // Step 3: Chunked upload directly to S3 via presigned URLs.
      // The server generates presigned URLs (tiny requests within Vercel limits),
      // and the client PUTs chunk data directly to S3, bypassing the 4.5 MB limit.
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      setS3Progress(0);

      const abort = new AbortController();
      abortRef.current = abort;

      // 3a: Init multipart upload
      const initUploadRes = await fetch(
        `/admin/batch-upload/api/${validJobId}/upload/`,
        { method: 'POST', signal: abort.signal }
      );
      if (!initUploadRes.ok) {
        const data = await initUploadRes.json();
        throw new Error(data.error || bt.errorUploadFailed);
      }
      const { uploadId } = (await initUploadRes.json()) as { uploadId: string };

      // 3b: Upload each chunk via presigned URL (direct to S3, bypasses Vercel body limit)
      const parts: { partNumber: number; etag: string }[] = [];
      for (let i = 0; i < totalChunks; i++) {
        if (abort.signal.aborted) throw new Error(bt.errorUploadFailed);

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkSize = end - start;
        const partNumber = i + 1;

        let etag: string | undefined;
        for (let attempt = 0; attempt < CHUNK_MAX_RETRIES; attempt++) {
          try {
            // Step A: Get presigned URL from our API (tiny request, no file data)
            const presignRes = await fetch(
              `/admin/batch-upload/api/${validJobId}/upload/?uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}&contentLength=${chunkSize}`,
              { method: 'PUT', signal: abort.signal }
            );
            if (!presignRes.ok) {
              const data = await presignRes.json();
              throw new Error(data.error || `Part ${partNumber} presign failed`);
            }
            const { presignedUrl } = (await presignRes.json()) as { presignedUrl: string };

            // Step B: PUT chunk directly to S3 via presigned URL
            const s3Res = await fetch(presignedUrl, {
              method: 'PUT',
              body: chunk,
              signal: abort.signal,
            });
            if (!s3Res.ok) {
              throw new Error(`Part ${partNumber} upload failed (${s3Res.status})`);
            }

            // S3 returns ETag in response header
            etag = s3Res.headers.get('etag') ?? undefined;
            if (!etag) throw new Error(`No ETag returned for part ${partNumber}`);
            break;
          } catch (err) {
            if (abort.signal.aborted) throw err;
            if (attempt === CHUNK_MAX_RETRIES - 1) throw err;
            // Wait before retry: 1s, 2s
            await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
          }
        }
        parts.push({ partNumber, etag: etag! });

        if (mountedRef.current) {
          setS3Progress(Math.round((partNumber / totalChunks) * 100));
        }
      }

      // 3c: Complete multipart upload
      const completeRes = await fetch(
        `/admin/batch-upload/api/${validJobId}/upload/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId, parts }),
          signal: abort.signal,
        }
      );
      if (!completeRes.ok) {
        const data = await completeRes.json();
        throw new Error(data.error || bt.errorUploadFailed);
      }

      abortRef.current = null;
      s3UploadOk = true;

      // Step 4: Trigger processing
      const processRes = await fetch(`/admin/batch-upload/api/${validJobId}/process/`, {
        method: 'POST',
      });

      if (!processRes.ok) {
        const data = await processRes.json();
        throw new Error(data.error || bt.errorUploadFailed);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : bt.errorUploadFailed;

      if (!s3UploadOk) {
        // S3 upload failed — file is not on the server, processing can't work.
        // Stop polling and return to upload phase so user can retry.
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setPhase('upload');
        setJob(null);
      }
      // If s3UploadOk but process trigger failed, keep polling —
      // the file is on S3 and stale detection will handle it.
      setError(msg);
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  }, [file, generateBlog, mode, startPolling, bt]);

  // ---- Reset ----
  const handleReset = useCallback(() => {
    setPhase('upload');
    setFile(null);
    setJob(null);
    setError(null);
    setS3Progress(0);
    setShowErrors(false);
    setGenerateBlog(false);
    setShowHelp(false);
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
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
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
            {uploading
              ? (s3Progress > 0 ? `${bt.uploading} ${s3Progress}%` : bt.uploading)
              : bt.uploadButton}
          </button>
        </div>
      )}

      {/* PHASE: PROCESSING */}
      {phase === 'processing' && job && (
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

          {/* S3 upload indicator with progress (shown while job is still pending) */}
          {uploading && job.status === 'pending' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  className="admin-spin"
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${GOLD}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'admin-spin 0.8s linear infinite',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem' }}>
                  {bt.uploading}
                </span>
                <span style={{ color: TEXT_MUTED, fontSize: '0.8125rem', marginLeft: 'auto' }}>
                  {s3Progress}%
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: SURFACE_ALT, borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${s3Progress}%`,
                    backgroundColor: GOLD,
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error during upload (non-fatal — polling continues) */}
          {error && (
            <div
              style={{
                backgroundColor: ERROR_BG,
                color: ERROR,
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Step indicators */}
          <div style={{ marginBottom: '1.5rem' }}>
            {STEPS.map((step, idx) => {
              const currentIdx = getStepIndex(job.status);
              const isActive = idx === currentIdx && !uploading;
              const isDone = idx < currentIdx;
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
                  {/* Status icon */}
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
                </div>
              );
            })}
          </div>

          {/* Progress bar (for uploading step) */}
          {job.status === 'uploading' && job.totalImages > 0 && (
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
                    width: `${Math.round((job.processedImages / job.totalImages) * 100)}%`,
                    backgroundColor: GOLD,
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p style={{ color: TEXT_MUTED, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {bt.progressLabel
                  .replace('{processed}', String(job.processedImages))
                  .replace('{total}', String(job.totalImages))}
              </p>
            </div>
          )}

          {/* Current step label */}
          {job.currentStepLabel && (
            <p style={{ color: TEXT_MID, fontSize: '0.8125rem', fontStyle: 'italic' }}>
              {job.currentStepLabel}
            </p>
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
    ? bt.warningsCount?.replace('{count}', String(job.errors.length))
      ?? `${job.errors.length} warning(s)`
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
          {job.errors.map((err, idx) => {
            const resolved = resolveErrorLabel(err, bt);
            if (!resolved) return null;
            return (
              <li key={`${idx}-${err}`} style={{ marginBottom: '0.25rem' }}>
                {resolved}
              </li>
            );
          })}
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
