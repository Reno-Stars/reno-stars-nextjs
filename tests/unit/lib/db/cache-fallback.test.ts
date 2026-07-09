import { describe, it, expect, vi } from 'vitest';
import { DbQueryError, safeQuery, uncachedQuery, withFallback } from '@/lib/db/cache-fallback';

describe('poison-fallback-safe query primitives', () => {
  describe('safeQuery', () => {
    it('returns the value on success', async () => {
      await expect(safeQuery('ok', async () => [1, 2, 3], [])).resolves.toEqual([1, 2, 3]);
    });

    it('THROWS DbQueryError (carrying the fallback) on failure — so unstable_cache never persists it', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = await safeQuery('boom', async () => { throw new Error('db down'); }, ['fallback'])
        .then(() => null, (e) => e);
      expect(err).toBeInstanceOf(DbQueryError);
      expect((err as DbQueryError<string[]>).fallback).toEqual(['fallback']);
      vi.restoreAllMocks();
    });
  });

  describe('withFallback', () => {
    it('passes success through unchanged', async () => {
      const wrapped = withFallback(async (n: number) => n * 2);
      await expect(wrapped(21)).resolves.toBe(42);
    });

    it('converts a thrown DbQueryError back into its fallback (this render only)', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapped = withFallback(() => safeQuery('boom', async () => { throw new Error('x'); }, [] as string[]));
      await expect(wrapped()).resolves.toEqual([]);
      vi.restoreAllMocks();
    });

    it('re-throws non-DbQueryError (real bugs must not be swallowed)', async () => {
      const wrapped = withFallback(async () => { throw new TypeError('programmer error'); });
      await expect(wrapped()).rejects.toThrow(TypeError);
    });

    it('preserves argument passing (per-slug wrappers)', async () => {
      const wrapped = withFallback(async (slug: string, locale: string) => `${slug}:${locale}`);
      await expect(wrapped('burnaby', 'zh')).resolves.toBe('burnaby:zh');
    });
  });

  describe('uncachedQuery', () => {
    it('returns the fallback directly on error (no cache to poison)', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(uncachedQuery('sitemap', async () => { throw new Error('x'); }, [])).resolves.toEqual([]);
      vi.restoreAllMocks();
    });
  });

  it('end-to-end: cached wrapper (withFallback ∘ fn) serves fallback but a fixed fn recovers next call', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let healthy = false;
    const raw = () => safeQuery('areas', async () => {
      if (!healthy) throw new Error('transient');
      return ['richmond', 'burnaby'];
    }, [] as string[]);
    const wrapped = withFallback(raw); // stands in for cache(unstable_cache(raw))
    expect(await wrapped()).toEqual([]);       // blip → fallback, nothing cached
    healthy = true;
    expect(await wrapped()).toEqual(['richmond', 'burnaby']); // next render recovers
    vi.restoreAllMocks();
  });
});
