import { describe, it, expect } from 'vitest';
import { isValidUrl, isValidSlug, validateTextLengths, getString, parseImagePairs, mapDbImagePairToForm, validatePairUrls, validateExternalProductUrls } from '@/lib/admin/form-utils';
import type { DbImagePairRow, ParsedImagePair } from '@/lib/admin/form-utils';

describe('form-utils', () => {
  describe('isValidUrl', () => {
    it('returns true for empty string (optional fields)', () => {
      expect(isValidUrl('')).toBe(true);
    });

    it('returns true for valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path/to/image.jpg')).toBe(true);
    });

    it('returns true for valid https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path/to/image.jpg')).toBe(true);
      expect(isValidUrl('https://pub-c1ab6c279d0b4d818f91cee00ab3defe.r2.dev/uploads/admin/123.jpg')).toBe(true);
    });

    it('returns true for relative paths starting with /', () => {
      expect(isValidUrl('/uploads/image.jpg')).toBe(true);
      expect(isValidUrl('/uploads/admin/123-abc.webp')).toBe(true);
      expect(isValidUrl('/')).toBe(true);
      expect(isValidUrl('/a/b/c/d.png')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///local/path')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('returns false for relative paths not starting with /', () => {
      expect(isValidUrl('uploads/image.jpg')).toBe(false);
      expect(isValidUrl('./image.jpg')).toBe(false);
      expect(isValidUrl('../image.jpg')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('returns true for valid slugs', () => {
      expect(isValidSlug('my-project')).toBe(true);
      expect(isValidSlug('kitchen-renovation-2024')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
      expect(isValidSlug('test123')).toBe(true);
    });

    it('returns false for invalid slugs', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('My-Project')).toBe(false); // uppercase
      expect(isValidSlug('my_project')).toBe(false); // underscore
      expect(isValidSlug('my project')).toBe(false); // space
      expect(isValidSlug('-start-with-hyphen')).toBe(false);
      expect(isValidSlug('end-with-hyphen-')).toBe(false);
      expect(isValidSlug('a--b')).toBe(false); // consecutive hyphens
      expect(isValidSlug('test---slug')).toBe(false); // multiple consecutive hyphens
    });

    it('returns false for slugs exceeding max length', () => {
      const longSlug = 'a'.repeat(101);
      expect(isValidSlug(longSlug)).toBe(false);
    });
  });

  describe('validateTextLengths', () => {
    it('returns null when all fields are within limits', () => {
      expect(validateTextLengths({ name: 'Test', desc: 'Description' }, 100)).toBeNull();
    });

    it('returns null for null/undefined values', () => {
      expect(validateTextLengths({ name: null, desc: undefined }, 100)).toBeNull();
    });

    it('returns error message when field exceeds limit', () => {
      const result = validateTextLengths({ name: 'a'.repeat(101) }, 100);
      expect(result).toContain('name');
      expect(result).toContain('100');
    });
  });

  describe('getString', () => {
    it('returns string value from FormData', () => {
      const formData = new FormData();
      formData.set('name', 'Test Value');
      expect(getString(formData, 'name')).toBe('Test Value');
    });

    it('returns empty string for missing field', () => {
      const formData = new FormData();
      expect(getString(formData, 'missing')).toBe('');
    });

    it('returns empty string for non-string values', () => {
      const formData = new FormData();
      formData.set('file', new Blob(['test']));
      expect(getString(formData, 'file')).toBe('');
    });
  });

  describe('validatePairUrls', () => {
    const validPair: ParsedImagePair = {
      beforeImageUrl: 'https://example.com/before.jpg',
      beforeAltTextEn: null,
      beforeAltTextZh: null,
      beforeVideoUrl: null,
      afterImageUrl: 'https://example.com/after.jpg',
      afterAltTextEn: null,
      afterAltTextZh: null,
      afterVideoUrl: null,
      titleEn: null,
      titleZh: null,
      captionEn: null,
      captionZh: null,
      photographerCredit: null,
      keywords: null,
      displayOrder: 0,
    };

    it('returns null when all URLs are valid', () => {
      expect(validatePairUrls([validPair])).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(validatePairUrls([])).toBeNull();
    });

    it('returns null when URL fields are null', () => {
      expect(validatePairUrls([{
        ...validPair,
        beforeImageUrl: null,
        afterImageUrl: null,
        beforeVideoUrl: null,
        afterVideoUrl: null,
      }])).toBeNull();
    });

    it('returns error for invalid before image URL', () => {
      const result = validatePairUrls([{ ...validPair, beforeImageUrl: 'not-a-url' }]);
      expect(result).toContain('Before image');
      expect(result).toContain('not-a-url');
    });

    it('returns error for invalid after image URL', () => {
      const result = validatePairUrls([{ ...validPair, afterImageUrl: 'bad-url' }]);
      expect(result).toContain('After image');
    });

    it('returns error for invalid before video URL', () => {
      const result = validatePairUrls([{ ...validPair, beforeVideoUrl: 'bad-url' }]);
      expect(result).toContain('Before video');
    });

    it('returns error for invalid after video URL', () => {
      const result = validatePairUrls([{ ...validPair, afterVideoUrl: 'bad-url' }]);
      expect(result).toContain('After video');
    });

    it('truncates long URLs in error message', () => {
      const longUrl = 'not-valid-' + 'a'.repeat(100);
      const result = validatePairUrls([{ ...validPair, beforeImageUrl: longUrl }]);
      expect(result).toBeTruthy();
      // URL in error message should be truncated to 60 chars
      expect(result!.length).toBeLessThan(longUrl.length + 50);
    });

    it('returns first error when multiple URLs are invalid', () => {
      const result = validatePairUrls([{
        ...validPair,
        beforeImageUrl: 'bad1',
        afterVideoUrl: 'bad2',
      }]);
      // Should report before image first (checked first in loop)
      expect(result).toContain('Before image');
    });
  });

  describe('validateExternalProductUrls', () => {
    it('returns null when all URLs are valid', () => {
      expect(validateExternalProductUrls([
        { url: 'https://example.com/product', imageUrl: 'https://example.com/img.jpg' },
      ])).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(validateExternalProductUrls([])).toBeNull();
    });

    it('returns null when imageUrl is null', () => {
      expect(validateExternalProductUrls([
        { url: 'https://example.com/product', imageUrl: null },
      ])).toBeNull();
    });

    it('returns error for invalid product URL', () => {
      const result = validateExternalProductUrls([
        { url: 'not-a-url', imageUrl: null },
      ]);
      expect(result).toContain('External product URL');
    });

    it('returns error for invalid product image URL', () => {
      const result = validateExternalProductUrls([
        { url: 'https://example.com/product', imageUrl: 'bad-url' },
      ]);
      expect(result).toContain('External product image URL');
    });
  });

  describe('parseImagePairs', () => {
    function buildPairFormData(prefix: string, index: number, data: {
      id?: string;
      beforeUrl?: string;
      afterUrl?: string;
      beforeVideoUrl?: string;
      afterVideoUrl?: string;
      beforeAltEn?: string;
      beforeAltZh?: string;
      afterAltEn?: string;
      afterAltZh?: string;
      titleEn?: string;
      titleZh?: string;
      captionEn?: string;
      captionZh?: string;
      photographerCredit?: string;
      keywords?: string;
    }): FormData {
      const fd = new FormData();
      fd.set(`${prefix}[${index}].id`, data.id ?? 'test-id');
      fd.set(`${prefix}[${index}].beforeUrl`, data.beforeUrl ?? '');
      fd.set(`${prefix}[${index}].afterUrl`, data.afterUrl ?? '');
      fd.set(`${prefix}[${index}].beforeVideoUrl`, data.beforeVideoUrl ?? '');
      fd.set(`${prefix}[${index}].afterVideoUrl`, data.afterVideoUrl ?? '');
      fd.set(`${prefix}[${index}].beforeAltEn`, data.beforeAltEn ?? '');
      fd.set(`${prefix}[${index}].beforeAltZh`, data.beforeAltZh ?? '');
      fd.set(`${prefix}[${index}].afterAltEn`, data.afterAltEn ?? '');
      fd.set(`${prefix}[${index}].afterAltZh`, data.afterAltZh ?? '');
      fd.set(`${prefix}[${index}].titleEn`, data.titleEn ?? '');
      fd.set(`${prefix}[${index}].titleZh`, data.titleZh ?? '');
      fd.set(`${prefix}[${index}].captionEn`, data.captionEn ?? '');
      fd.set(`${prefix}[${index}].captionZh`, data.captionZh ?? '');
      fd.set(`${prefix}[${index}].photographerCredit`, data.photographerCredit ?? '');
      fd.set(`${prefix}[${index}].keywords`, data.keywords ?? '');
      return fd;
    }

    it('parses a single image pair with before and after', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: 'https://example.com/before.jpg',
        afterUrl: 'https://example.com/after.jpg',
        beforeAltEn: 'Before EN',
        titleEn: 'Kitchen',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].beforeImageUrl).toBe('https://example.com/before.jpg');
      expect(result[0].afterImageUrl).toBe('https://example.com/after.jpg');
      expect(result[0].beforeAltTextEn).toBe('Before EN');
      expect(result[0].titleEn).toBe('Kitchen');
      expect(result[0].displayOrder).toBe(0);
    });

    it('skips pairs with no images and no videos', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: '',
        afterUrl: '',
        beforeVideoUrl: '',
        afterVideoUrl: '',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(0);
    });

    it('accepts pairs with only before image', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: 'https://example.com/before.jpg',
        afterUrl: '',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].beforeImageUrl).toBe('https://example.com/before.jpg');
      expect(result[0].afterImageUrl).toBeNull();
    });

    it('accepts pairs with only after image', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: '',
        afterUrl: 'https://example.com/after.jpg',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].beforeImageUrl).toBeNull();
      expect(result[0].afterImageUrl).toBe('https://example.com/after.jpg');
    });

    it('accepts pairs with only before video (no images)', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: '',
        afterUrl: '',
        beforeVideoUrl: 'https://example.com/before.mp4',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].beforeVideoUrl).toBe('https://example.com/before.mp4');
      expect(result[0].beforeImageUrl).toBeNull();
      expect(result[0].afterImageUrl).toBeNull();
      expect(result[0].afterVideoUrl).toBeNull();
    });

    it('accepts pairs with only after video (no images)', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: '',
        afterUrl: '',
        afterVideoUrl: 'https://example.com/after.mp4',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].afterVideoUrl).toBe('https://example.com/after.mp4');
    });

    it('parses pairs with both images and videos', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: 'https://example.com/before.jpg',
        afterUrl: 'https://example.com/after.jpg',
        beforeVideoUrl: 'https://example.com/before.mp4',
        afterVideoUrl: 'https://example.com/after.mp4',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(1);
      expect(result[0].beforeImageUrl).toBe('https://example.com/before.jpg');
      expect(result[0].afterImageUrl).toBe('https://example.com/after.jpg');
      expect(result[0].beforeVideoUrl).toBe('https://example.com/before.mp4');
      expect(result[0].afterVideoUrl).toBe('https://example.com/after.mp4');
    });

    it('converts empty video URLs to null', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: 'https://example.com/before.jpg',
        beforeVideoUrl: '',
        afterVideoUrl: '',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result[0].beforeVideoUrl).toBeNull();
      expect(result[0].afterVideoUrl).toBeNull();
    });

    it('returns empty array when no pairs present', () => {
      const fd = new FormData();
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result).toHaveLength(0);
    });

    it('parses multiple pairs with correct display order', () => {
      const fd = new FormData();
      // Pair 0
      fd.set('ip[0].id', 'id-0');
      fd.set('ip[0].beforeUrl', 'https://example.com/b0.jpg');
      fd.set('ip[0].afterUrl', '');
      fd.set('ip[0].beforeVideoUrl', '');
      fd.set('ip[0].afterVideoUrl', '');
      fd.set('ip[0].beforeAltEn', '');
      fd.set('ip[0].beforeAltZh', '');
      fd.set('ip[0].afterAltEn', '');
      fd.set('ip[0].afterAltZh', '');
      fd.set('ip[0].titleEn', '');
      fd.set('ip[0].titleZh', '');
      fd.set('ip[0].captionEn', '');
      fd.set('ip[0].captionZh', '');
      fd.set('ip[0].photographerCredit', '');
      fd.set('ip[0].keywords', '');
      // Pair 1
      fd.set('ip[1].id', 'id-1');
      fd.set('ip[1].beforeUrl', '');
      fd.set('ip[1].afterUrl', 'https://example.com/a1.jpg');
      fd.set('ip[1].beforeVideoUrl', '');
      fd.set('ip[1].afterVideoUrl', '');
      fd.set('ip[1].beforeAltEn', '');
      fd.set('ip[1].beforeAltZh', '');
      fd.set('ip[1].afterAltEn', '');
      fd.set('ip[1].afterAltZh', '');
      fd.set('ip[1].titleEn', '');
      fd.set('ip[1].titleZh', '');
      fd.set('ip[1].captionEn', '');
      fd.set('ip[1].captionZh', '');
      fd.set('ip[1].photographerCredit', '');
      fd.set('ip[1].keywords', '');

      const result = parseImagePairs(fd, 'ip');
      expect(result).toHaveLength(2);
      expect(result[0].displayOrder).toBe(0);
      expect(result[1].displayOrder).toBe(1);
    });

    it('respects maxPairs limit', () => {
      const fd = new FormData();
      for (let i = 0; i < 5; i++) {
        fd.set(`p[${i}].id`, `id-${i}`);
        fd.set(`p[${i}].beforeUrl`, `https://example.com/${i}.jpg`);
        fd.set(`p[${i}].afterUrl`, '');
        fd.set(`p[${i}].beforeVideoUrl`, '');
        fd.set(`p[${i}].afterVideoUrl`, '');
        fd.set(`p[${i}].beforeAltEn`, '');
        fd.set(`p[${i}].beforeAltZh`, '');
        fd.set(`p[${i}].afterAltEn`, '');
        fd.set(`p[${i}].afterAltZh`, '');
        fd.set(`p[${i}].titleEn`, '');
        fd.set(`p[${i}].titleZh`, '');
        fd.set(`p[${i}].captionEn`, '');
        fd.set(`p[${i}].captionZh`, '');
        fd.set(`p[${i}].photographerCredit`, '');
        fd.set(`p[${i}].keywords`, '');
      }
      const result = parseImagePairs(fd, 'p', 3);
      expect(result).toHaveLength(3);
    });

    it('converts empty strings to null for optional fields', () => {
      const fd = buildPairFormData('imagePairs', 0, {
        beforeUrl: 'https://example.com/before.jpg',
        afterUrl: '',
        beforeAltEn: '',
        titleEn: '',
        photographerCredit: '',
        keywords: '',
      });
      const result = parseImagePairs(fd, 'imagePairs');
      expect(result[0].beforeAltTextEn).toBeNull();
      expect(result[0].afterImageUrl).toBeNull();
      expect(result[0].titleEn).toBeNull();
      expect(result[0].photographerCredit).toBeNull();
      expect(result[0].keywords).toBeNull();
    });
  });

  describe('mapDbImagePairToForm', () => {
    it('maps all fields from DB row to form shape', () => {
      const row: DbImagePairRow = {
        beforeImageUrl: 'https://example.com/before.jpg',
        beforeAltTextEn: 'Before EN',
        beforeAltTextZh: 'Before ZH',
        beforeVideoUrl: 'https://example.com/before.mp4',
        afterImageUrl: 'https://example.com/after.jpg',
        afterAltTextEn: 'After EN',
        afterAltTextZh: 'After ZH',
        afterVideoUrl: 'https://example.com/after.mp4',
        titleEn: 'Title EN',
        titleZh: 'Title ZH',
        captionEn: 'Caption EN',
        captionZh: 'Caption ZH',
        photographerCredit: 'John Doe',
        keywords: 'kitchen, renovation',
      };
      const result = mapDbImagePairToForm(row);
      expect(result).toEqual({
        beforeUrl: 'https://example.com/before.jpg',
        beforeAltEn: 'Before EN',
        beforeAltZh: 'Before ZH',
        beforeVideoUrl: 'https://example.com/before.mp4',
        afterUrl: 'https://example.com/after.jpg',
        afterAltEn: 'After EN',
        afterAltZh: 'After ZH',
        afterVideoUrl: 'https://example.com/after.mp4',
        titleEn: 'Title EN',
        titleZh: 'Title ZH',
        captionEn: 'Caption EN',
        captionZh: 'Caption ZH',
        photographerCredit: 'John Doe',
        keywords: 'kitchen, renovation',
      });
    });

    it('converts null values to empty strings', () => {
      const row: DbImagePairRow = {
        beforeImageUrl: null,
        beforeAltTextEn: null,
        beforeAltTextZh: null,
        beforeVideoUrl: null,
        afterImageUrl: null,
        afterAltTextEn: null,
        afterAltTextZh: null,
        afterVideoUrl: null,
        titleEn: null,
        titleZh: null,
        captionEn: null,
        captionZh: null,
        photographerCredit: null,
        keywords: null,
      };
      const result = mapDbImagePairToForm(row);
      expect(result.beforeUrl).toBe('');
      expect(result.beforeAltEn).toBe('');
      expect(result.beforeVideoUrl).toBe('');
      expect(result.afterUrl).toBe('');
      expect(result.afterVideoUrl).toBe('');
      expect(result.titleEn).toBe('');
      expect(result.photographerCredit).toBe('');
      expect(result.keywords).toBe('');
    });
  });

  describe('validatePairUrls', () => {
    const validPair: ParsedImagePair = {
      beforeImageUrl: 'https://example.com/before.jpg',
      beforeAltTextEn: null,
      beforeAltTextZh: null,
      beforeVideoUrl: null,
      afterImageUrl: 'https://example.com/after.jpg',
      afterAltTextEn: null,
      afterAltTextZh: null,
      afterVideoUrl: null,
      titleEn: null,
      titleZh: null,
      captionEn: null,
      captionZh: null,
      photographerCredit: null,
      keywords: null,
      displayOrder: 0,
    };

    it('returns null for empty array', () => {
      expect(validatePairUrls([])).toBeNull();
    });

    it('returns null for valid image URLs', () => {
      expect(validatePairUrls([validPair])).toBeNull();
    });

    it('returns null when URL fields are null (optional)', () => {
      const pair: ParsedImagePair = { ...validPair, beforeImageUrl: null, afterImageUrl: null };
      expect(validatePairUrls([pair])).toBeNull();
    });

    it('returns null for valid video URLs', () => {
      const pair: ParsedImagePair = {
        ...validPair,
        beforeVideoUrl: 'https://example.com/before.mp4',
        afterVideoUrl: '/uploads/after.mp4',
      };
      expect(validatePairUrls([pair])).toBeNull();
    });

    it('returns error for invalid beforeImageUrl', () => {
      const pair: ParsedImagePair = { ...validPair, beforeImageUrl: 'not-a-url' };
      const result = validatePairUrls([pair]);
      expect(result).toContain('Before image');
      expect(result).toContain('not-a-url');
    });

    it('returns error for invalid afterImageUrl', () => {
      const pair: ParsedImagePair = { ...validPair, afterImageUrl: 'bad-url' };
      const result = validatePairUrls([pair]);
      expect(result).toContain('After image');
    });

    it('returns error for invalid beforeVideoUrl', () => {
      const pair: ParsedImagePair = { ...validPair, beforeVideoUrl: 'ftp://bad.com/video.mp4' };
      const result = validatePairUrls([pair]);
      expect(result).toContain('Before video');
    });

    it('returns error for invalid afterVideoUrl', () => {
      const pair: ParsedImagePair = { ...validPair, afterVideoUrl: 'invalid' };
      const result = validatePairUrls([pair]);
      expect(result).toContain('After video');
    });

    it('validates multiple pairs and returns first error', () => {
      const pairs: ParsedImagePair[] = [
        validPair,
        { ...validPair, afterVideoUrl: 'bad', displayOrder: 1 },
      ];
      const result = validatePairUrls(pairs);
      expect(result).toContain('After video');
    });
  });

  describe('validateExternalProductUrls', () => {
    it('returns null for empty array', () => {
      expect(validateExternalProductUrls([])).toBeNull();
    });

    it('returns null for valid URLs', () => {
      const data = [
        { url: 'https://amazon.com/product/123', imageUrl: 'https://cdn.example.com/img.jpg' },
        { url: 'https://homedepot.com/p/456', imageUrl: null },
      ];
      expect(validateExternalProductUrls(data)).toBeNull();
    });

    it('returns error for invalid product URL', () => {
      const data = [{ url: 'not-valid', imageUrl: null }];
      const result = validateExternalProductUrls(data);
      expect(result).toContain('External product URL');
      expect(result).toContain('not-valid');
    });

    it('returns error for invalid product image URL', () => {
      const data = [{ url: 'https://amazon.com/product/123', imageUrl: 'bad-image-url' }];
      const result = validateExternalProductUrls(data);
      expect(result).toContain('External product image URL');
      expect(result).toContain('bad-image-url');
    });

    it('checks product URL before image URL', () => {
      const data = [{ url: 'bad-url', imageUrl: 'also-bad' }];
      const result = validateExternalProductUrls(data);
      expect(result).toContain('External product URL');
    });

    it('allows null imageUrl', () => {
      const data = [{ url: 'https://example.com/product', imageUrl: null }];
      expect(validateExternalProductUrls(data)).toBeNull();
    });

    it('allows empty string imageUrl (treated as empty by isValidUrl)', () => {
      const data = [{ url: 'https://example.com/product', imageUrl: '' }];
      expect(validateExternalProductUrls(data)).toBeNull();
    });
  });
});
