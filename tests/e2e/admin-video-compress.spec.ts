import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test-admin-password';

// ffmpeg.wasm CDN load + encoding can take a while
const FFMPEG_TIMEOUT = 180_000; // 3 minutes

test.describe.configure({ mode: 'serial' });

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/', { timeout: 15_000 });
}

/**
 * Generate a minimal valid MP4 file (~1 KB).
 * This is a hand-crafted ftyp+moov+mdat that most decoders accept.
 */
function createMinimalMp4(): Buffer {
  // Minimal MP4 with ftyp box + moov box + mdat box
  // This is a valid but essentially empty MP4 container
  const hex = [
    // ftyp box (file type)
    '00000018',       // size = 24
    '66747970',       // 'ftyp'
    '69736F6D',       // major_brand = 'isom'
    '00000200',       // minor_version = 512
    '69736F6D',       // compatible_brand = 'isom'
    '61766331',       // compatible_brand = 'avc1'
    // moov box (movie header — minimal)
    '00000068',       // size = 104
    '6D6F6F76',       // 'moov'
    // mvhd box
    '0000006C',       // size (inner) — we'll use a simplified mvhd
    '6D766864',       // 'mvhd'
    '00000000',       // version + flags
    '00000000',       // creation_time
    '00000000',       // modification_time
    '000003E8',       // timescale = 1000
    '00000000',       // duration = 0
    '00010000',       // rate = 1.0
    '0100',           // volume = 1.0
    '0000',           // reserved
    '00000000',       // reserved
    '00000000',       // reserved
    // matrix (36 bytes = 9 x 4)
    '00010000', '00000000', '00000000',
    '00000000', '00010000', '00000000',
    '00000000', '00000000', '40000000',
    // pre_defined (24 bytes = 6 x 4)
    '00000000', '00000000', '00000000',
    '00000000', '00000000', '00000000',
    '00000002',       // next_track_ID
    // mdat box (empty media data)
    '00000008',       // size = 8
    '6D646174',       // 'mdat'
  ].join('');
  return Buffer.from(hex, 'hex');
}

test.describe('Admin Video Compression', () => {
  let page: Page;
  let testVideoPath: string;

  test.beforeAll(async ({ browser }) => {
    // Create a minimal test MP4 file
    testVideoPath = path.join(__dirname, 'test-video.mp4');
    fs.writeFileSync(testVideoPath, createMinimalMp4());

    page = await browser.newPage();
    await adminLogin(page);
  });

  test.afterAll(async () => {
    await page.close();
    // Clean up test file
    if (fs.existsSync(testVideoPath)) fs.unlinkSync(testVideoPath);
  });

  test('company page shows video upload area when editing', async () => {
    await page.goto('/admin/company');
    await page.waitForLoadState('networkidle');

    // Upload area should be hidden when not editing
    const uploadButton = page.getByRole('button', { name: /upload video/i });
    await expect(uploadButton).not.toBeVisible();

    // Enable editing
    await page.locator('button', { hasText: /^Edit$/ }).click();

    // Now upload area should appear
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toContainText(/click or drag/i);
  });

  test('video upload triggers compression flow', async () => {
    test.setTimeout(FFMPEG_TIMEOUT);

    await page.goto('/admin/company');
    await page.waitForLoadState('networkidle');

    // Enable editing
    await page.locator('button', { hasText: /^Edit$/ }).click();

    const uploadArea = page.getByRole('button', { name: /upload video/i });
    await expect(uploadArea).toBeVisible();

    // Set up file chooser and trigger it
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadArea.click(),
    ]);

    await fileChooser.setFiles(testVideoPath);

    // Should see compression status — either "Loading video optimizer..." or "Optimizing video..."
    // The ffmpeg WASM binary is ~31 MB so loading takes time
    const compressionText = uploadArea.locator('div').first();

    // Wait for either loading or compressing text to appear
    await expect(async () => {
      const text = await uploadArea.textContent();
      const hasStatus =
        text?.includes('Loading video optimizer') ||
        text?.includes('Optimizing video') ||
        text?.includes('正在加载视频优化器') ||
        text?.includes('正在优化视频') ||
        text?.includes('Uploading') ||
        text?.includes('上传中') ||
        // Compression may have already finished for this tiny file
        text?.includes('Already optimized') ||
        text?.includes('已是最优') ||
        text?.includes('smaller') ||
        text?.includes('缩小');
      expect(hasStatus).toBe(true);
    }).toPass({ timeout: 30_000 });

    // Wait for the full flow to complete (compression + upload attempt)
    // The upload will likely fail in test (no real S3), but we should see the compression phase complete
    await expect(async () => {
      const text = await uploadArea.textContent();
      const isIdle =
        text?.includes('Click or drag') ||
        text?.includes('点击或拖拽') ||
        text?.includes('Already optimized') ||
        text?.includes('已是最优') ||
        text?.includes('smaller') ||
        text?.includes('缩小');
      expect(isIdle).toBe(true);
    }).toPass({ timeout: FFMPEG_TIMEOUT });
  });

  test('video URL input accepts manual URL entry', async () => {
    await page.goto('/admin/company');
    await page.waitForLoadState('networkidle');

    // Enable editing
    await page.locator('button', { hasText: /^Edit$/ }).click();

    const videoInput = page.locator('input[name="heroVideoUrl"]');
    await expect(videoInput).toBeEnabled();

    // Type a URL manually
    await videoInput.fill('https://example.com/test-video.mp4');
    expect(await videoInput.inputValue()).toBe('https://example.com/test-video.mp4');
  });

  test('video upload area is hidden when not in edit mode', async () => {
    await page.goto('/admin/company');
    await page.waitForLoadState('networkidle');

    // In read-only mode (default), the upload area should not be visible
    const uploadButton = page.getByRole('button', { name: /upload video/i });
    await expect(uploadButton).not.toBeVisible();

    // The URL input should still be visible but disabled
    const videoInput = page.locator('input[name="heroVideoUrl"]');
    await expect(videoInput).toBeVisible();
    await expect(videoInput).toBeDisabled();
  });
});
