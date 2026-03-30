/**
 * Client-side video compression using ffmpeg.wasm (single-threaded).
 *
 * Loads @ffmpeg/core from jsdelivr CDN (UMD build) to avoid COOP/COEP
 * header requirements that would break GA, Google Ads, and external fonts.
 *
 * The CORE_VERSION must stay compatible with the installed @ffmpeg/ffmpeg
 * wrapper (currently 0.12.x). Bump both together when upgrading.
 *
 * All @ffmpeg/* imports are dynamic to avoid breaking server-side builds
 * (the package uses `new Worker(...)` which is unavailable in Node.js).
 */

import { MAX_COMPRESSIBLE_VIDEO_SIZE } from './upload-constants';

type FFmpegType = import('@ffmpeg/ffmpeg').FFmpeg;

const CORE_VERSION = '0.12.10';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpeg: FFmpegType | null = null;
let loadingPromise: Promise<FFmpegType> | null = null;
/** Once CDN fetch fails, skip future attempts for the rest of the session. */
let loadFailed = false;

async function getFFmpeg(): Promise<FFmpegType> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (loadFailed) throw new Error('FFmpeg load previously failed — skipping compression');
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ]);
      const ff = new FFmpeg();

      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CDN_BASE}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${CDN_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      ]);

      await ff.load({ coreURL, wasmURL });
      ffmpeg = ff;
      return ff;
    } catch (err) {
      loadFailed = true;
      throw err;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export function parseTimeToSeconds(time: string): number {
  // time format: HH:MM:SS.xx
  const parts = time.split(':');
  if (parts.length !== 3) return 0;
  return (
    parseFloat(parts[0]) * 3600 +
    parseFloat(parts[1]) * 60 +
    parseFloat(parts[2])
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot) : '';
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  skipped: boolean;
}

export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void,
  onLoadingFfmpeg?: () => void,
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Skip compression for very large files to prevent browser OOM
  if (originalSize > MAX_COMPRESSIBLE_VIDEO_SIZE) {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }

  onLoadingFfmpeg?.();

  // Dynamic import fetchFile at call time
  const { fetchFile } = await import('@ffmpeg/util');
  const ff = await getFFmpeg();

  // Use the dedicated progress event (0.12.x) — more reliable than parsing logs
  const progressHandler = ({ progress }: { progress: number }) => {
    // progress is 0..1 float
    const pct = Math.min(99, Math.round(progress * 100));
    onProgress?.(pct);
  };

  ff.on('progress', progressHandler);

  // Use unique filenames to be defensive against future concurrency
  const uid = Date.now().toString(36);
  const inputName = `input_${uid}${getExtension(file.name)}`;
  const outputName = `output_${uid}.mp4`;

  try {
    await ff.writeFile(inputName, await fetchFile(file));

    await ff.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      outputName,
    ]);

    onProgress?.(100);

    const data = await ff.readFile(outputName) as Uint8Array;
    // ArrayBuffer.prototype.slice returns ArrayBuffer (not SharedArrayBuffer),
    // satisfying the BlobPart constraint without copying via new Uint8Array(data).
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    const compressedBlob = new Blob([ab], { type: 'video/mp4' });
    const compressedSize = compressedBlob.size;

    // If output is larger or equal, return original
    if (compressedSize >= originalSize) {
      return { file, originalSize, compressedSize: originalSize, skipped: true };
    }

    const compressedFile = new File(
      [compressedBlob],
      file.name.replace(/\.[^.]+$/, '.mp4'),
      { type: 'video/mp4' },
    );

    return { file: compressedFile, originalSize, compressedSize, skipped: false };
  } finally {
    ff.off('progress', progressHandler);
    // Always clean up WASM filesystem — even if exec() threw
    await ff.deleteFile(inputName).catch((e) => {
      if (process.env.NODE_ENV === 'development') console.warn('ffmpeg cleanup (input):', e);
    });
    await ff.deleteFile(outputName).catch((e) => {
      if (process.env.NODE_ENV === 'development') console.warn('ffmpeg cleanup (output):', e);
    });
  }
}
