/**
 * Client-side video compression using ffmpeg.wasm (single-threaded).
 *
 * Loads @ffmpeg/core from jsdelivr CDN (UMD build) to avoid COOP/COEP
 * header requirements that would break GA, Google Ads, and external fonts.
 *
 * The CORE_VERSION must stay compatible with the installed @ffmpeg/ffmpeg
 * wrapper (currently 0.12.x). Bump both together when upgrading.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { MAX_COMPRESSIBLE_VIDEO_SIZE } from './upload-constants';

const CORE_VERSION = '0.12.10';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const ff = new FFmpeg();

      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CDN_BASE}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${CDN_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      ]);

      await ff.load({ coreURL, wasmURL });
      ffmpeg = ff;
      return ff;
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
  const ff = await getFFmpeg();

  // Parse total duration from log output
  let totalDuration = 0;
  let lastProgress = 0;

  const logHandler = ({ message }: { message: string }) => {
    // Capture total duration: "Duration: 00:01:23.45,"
    const durMatch = message.match(/Duration:\s*(\d{2}:\d{2}:\d{2}\.\d+)/);
    if (durMatch) {
      totalDuration = parseTimeToSeconds(durMatch[1]);
    }

    // Capture current encoding time: "time=00:00:45.12"
    const timeMatch = message.match(/time=\s*(\d{2}:\d{2}:\d{2}\.\d+)/);
    if (timeMatch && totalDuration > 0) {
      const currentTime = parseTimeToSeconds(timeMatch[1]);
      const pct = Math.min(99, Math.round((currentTime / totalDuration) * 100));
      if (pct > lastProgress) {
        lastProgress = pct;
        onProgress?.(pct);
      }
    }
  };

  ff.on('log', logHandler);

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
    ff.off('log', logHandler);
    // Always clean up WASM filesystem — even if exec() threw
    await ff.deleteFile(inputName).catch((e) => {
      if (process.env.NODE_ENV === 'development') console.warn('ffmpeg cleanup (input):', e);
    });
    await ff.deleteFile(outputName).catch((e) => {
      if (process.env.NODE_ENV === 'development') console.warn('ffmpeg cleanup (output):', e);
    });
  }
}
