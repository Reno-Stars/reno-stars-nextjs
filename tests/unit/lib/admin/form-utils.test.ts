import { describe, it, expect } from 'vitest';
import { isValidUrl, isValidSlug, validateTextLengths, getString } from '@/lib/admin/form-utils';

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
});
