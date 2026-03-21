import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for lib/storage.ts
 *
 * Because STORAGE_ORIGIN and isLocalStorage are evaluated at module load time
 * from process.env.NEXT_PUBLIC_STORAGE_PROVIDER, we must use dynamic imports
 * with vi.resetModules() to test different env configurations.
 */

async function loadStorageModule(storageProvider?: string) {
  vi.resetModules();
  if (storageProvider !== undefined) {
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER = storageProvider;
  } else {
    delete process.env.NEXT_PUBLIC_STORAGE_PROVIDER;
  }
  return import('@/lib/storage');
}

describe('lib/storage', () => {
  const originalEnv = process.env.NEXT_PUBLIC_STORAGE_PROVIDER;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_STORAGE_PROVIDER = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_STORAGE_PROVIDER;
    }
  });

  describe('PROD_ORIGIN', () => {
    it('should export the production origin', async () => {
      const { PROD_ORIGIN } = await loadStorageModule();
      expect(PROD_ORIGIN).toBe('https://reno-stars.com');
    });
  });

  describe('getAssetUrl', () => {
    describe('when NEXT_PUBLIC_STORAGE_PROVIDER is unset', () => {
      it('should return the URL unchanged', async () => {
        const { getAssetUrl } = await loadStorageModule();
        expect(getAssetUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      });

      it('should return relative paths unchanged', async () => {
        const { getAssetUrl } = await loadStorageModule();
        expect(getAssetUrl('/logo.jpg')).toBe('/logo.jpg');
      });

      it('should return WP URLs unchanged', async () => {
        const { getAssetUrl } = await loadStorageModule();
        const wpUrl = 'https://reno-stars.com/wp-content/uploads/2025/04/foo.jpg';
        expect(getAssetUrl(wpUrl)).toBe(wpUrl);
      });
    });

    describe('when NEXT_PUBLIC_STORAGE_PROVIDER is a production R2 URL', () => {
      const r2Url = 'https://pub-abc123.r2.dev';

      it('should rewrite WordPress upload URLs to storage origin', async () => {
        const { getAssetUrl } = await loadStorageModule(r2Url);
        const wpUrl = 'https://reno-stars.com/wp-content/uploads/2025/04/kitchen.jpg';
        expect(getAssetUrl(wpUrl)).toBe('https://pub-abc123.r2.dev/uploads/2025/04/kitchen.jpg');
      });

      it('should rewrite WP URLs with any domain prefix', async () => {
        const { getAssetUrl } = await loadStorageModule(r2Url);
        const wpUrl = 'https://other-domain.com/wp-content/uploads/img.png';
        expect(getAssetUrl(wpUrl)).toBe('https://pub-abc123.r2.dev/uploads/img.png');
      });

      it('should NOT prefix relative paths for non-local storage', async () => {
        const { getAssetUrl } = await loadStorageModule(r2Url);
        expect(getAssetUrl('/logo.jpg')).toBe('/logo.jpg');
      });

      it('should return non-WP absolute URLs unchanged', async () => {
        const { getAssetUrl } = await loadStorageModule(r2Url);
        expect(getAssetUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
      });
    });

    describe('when NEXT_PUBLIC_STORAGE_PROVIDER is a local MinIO URL', () => {
      const minioUrl = 'http://localhost:9000/reno-stars';

      it('should rewrite WordPress upload URLs to MinIO', async () => {
        const { getAssetUrl } = await loadStorageModule(minioUrl);
        const wpUrl = 'https://reno-stars.com/wp-content/uploads/2025/04/bath.jpg';
        expect(getAssetUrl(wpUrl)).toBe('http://localhost:9000/reno-stars/uploads/2025/04/bath.jpg');
      });

      it('should prefix relative paths for local storage', async () => {
        const { getAssetUrl } = await loadStorageModule(minioUrl);
        expect(getAssetUrl('/logo.jpg')).toBe('http://localhost:9000/reno-stars/logo.jpg');
      });

      it('should return non-WP absolute URLs unchanged', async () => {
        const { getAssetUrl } = await loadStorageModule(minioUrl);
        expect(getAssetUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
      });
    });

    describe('when NEXT_PUBLIC_STORAGE_PROVIDER uses 127.0.0.1', () => {
      it('should treat 127.0.0.1 as local storage', async () => {
        const { getAssetUrl } = await loadStorageModule('http://127.0.0.1:9000/bucket');
        expect(getAssetUrl('/logo.jpg')).toBe('http://127.0.0.1:9000/bucket/logo.jpg');
      });
    });

    describe('when NEXT_PUBLIC_STORAGE_PROVIDER contains "minio"', () => {
      it('should treat minio hostname as local storage', async () => {
        const { getAssetUrl } = await loadStorageModule('http://minio:9000/bucket');
        expect(getAssetUrl('/icon.svg')).toBe('http://minio:9000/bucket/icon.svg');
      });
    });
  });

  describe('ASSET_ORIGIN', () => {
    it('should return PROD_ORIGIN when storage provider is unset', async () => {
      const { ASSET_ORIGIN, PROD_ORIGIN } = await loadStorageModule();
      expect(ASSET_ORIGIN).toBe(PROD_ORIGIN);
    });

    it('should return parsed origin for valid storage URL', async () => {
      const { ASSET_ORIGIN } = await loadStorageModule('https://pub-abc123.r2.dev');
      expect(ASSET_ORIGIN).toBe('https://pub-abc123.r2.dev');
    });

    it('should return parsed origin for MinIO URL (includes port)', async () => {
      const { ASSET_ORIGIN } = await loadStorageModule('http://localhost:9000/reno-stars');
      expect(ASSET_ORIGIN).toBe('http://localhost:9000');
    });

    it('should fallback to PROD_ORIGIN for invalid URL', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { ASSET_ORIGIN, PROD_ORIGIN } = await loadStorageModule('not-a-url');
      expect(ASSET_ORIGIN).toBe(PROD_ORIGIN);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid NEXT_PUBLIC_STORAGE_PROVIDER')
      );
      consoleSpy.mockRestore();
    });
  });
});
