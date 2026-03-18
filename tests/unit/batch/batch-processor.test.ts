import { describe, it, expect } from 'vitest';
import { parseProductsFile, isValidProductUrl, ensureActionSuffix, pushSkippedFilesWarning } from '@/lib/batch/batch-processor';
import type { BatchError } from '@/lib/batch/types';

describe('isValidProductUrl', () => {
  it('should accept valid http URLs', () => {
    expect(isValidProductUrl('http://example.com')).toBe(true);
    expect(isValidProductUrl('https://example.com/product')).toBe(true);
    expect(isValidProductUrl('https://homedepot.com/tile?color=white&size=12')).toBe(true);
  });

  it('should reject malformed URLs', () => {
    expect(isValidProductUrl('http://')).toBe(false);
    expect(isValidProductUrl('httpfoo')).toBe(false);
    expect(isValidProductUrl('not-a-url')).toBe(false);
    expect(isValidProductUrl('')).toBe(false);
    expect(isValidProductUrl('ftp://example.com')).toBe(false);
  });
});

describe('parseProductsFile', () => {
  it('should parse basic pipe-separated format', () => {
    const text = 'https://example.com/tile | Porcelain Tile | 瓷砖';
    const result = parseProductsFile(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      url: 'https://example.com/tile',
      imageUrl: null,
      labelEn: 'Porcelain Tile',
      labelZh: '瓷砖',
    });
  });

  it('should handle multiple lines', () => {
    const text = `https://example.com/a | Product A | 产品A
https://example.com/b | Product B | 产品B`;
    const result = parseProductsFile(text);
    expect(result).toHaveLength(2);
    expect(result[0].labelEn).toBe('Product A');
    expect(result[1].labelEn).toBe('Product B');
  });

  it('should skip comment lines', () => {
    const text = `# This is a comment
https://example.com/a | Product A | 产品A
# Another comment
https://example.com/b | Product B | 产品B`;
    const result = parseProductsFile(text);
    expect(result).toHaveLength(2);
  });

  it('should skip blank lines', () => {
    const text = `
https://example.com/a | Product A | 产品A

https://example.com/b | Product B | 产品B
    `;
    const result = parseProductsFile(text);
    expect(result).toHaveLength(2);
  });

  it('should skip invalid URLs', () => {
    const text = `not-a-url | Bad Product
http:// | Also Bad
https://example.com/good | Good Product | 好产品`;
    const result = parseProductsFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com/good');
  });

  it('should default ZH label to EN label when missing', () => {
    const text = 'https://example.com/tile | Porcelain Tile';
    const result = parseProductsFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].labelEn).toBe('Porcelain Tile');
    expect(result[0].labelZh).toBe('Porcelain Tile');
  });

  it('should derive label from URL when no labels provided', () => {
    const text = 'https://example.com/porcelain-tile';
    const result = parseProductsFile(text);
    expect(result).toHaveLength(1);
    expect(result[0].labelEn).toBe('porcelain tile');
    expect(result[0].labelZh).toBe('porcelain tile');
  });

  it('should handle URLs with pipes in query strings', () => {
    const text = 'https://example.com/search?q=tile|stone | Tile or Stone | 瓷砖或石材';
    const result = parseProductsFile(text);
    expect(result).toHaveLength(1);
    // URL includes everything up to the first pipe
    expect(result[0].url).toBe('https://example.com/search?q=tile');
    expect(result[0].labelEn).toBe('stone');
  });

  it('should return empty array for empty input', () => {
    expect(parseProductsFile('')).toHaveLength(0);
  });

  it('should return empty array for comment-only input', () => {
    expect(parseProductsFile('# Just comments\n# Nothing else')).toHaveLength(0);
  });

  it('should handle Windows line endings', () => {
    const text = 'https://example.com/a | A | 甲\r\nhttps://example.com/b | B | 乙';
    const result = parseProductsFile(text);
    expect(result).toHaveLength(2);
  });
});

describe('ensureActionSuffix', () => {
  it('should append "Renovation" when no action word present (EN)', () => {
    expect(ensureActionSuffix('Kitchen')).toBe('Kitchen Renovation');
    expect(ensureActionSuffix('Whole House')).toBe('Whole House Renovation');
  });

  it('should not append when action word already present (EN)', () => {
    expect(ensureActionSuffix('Kitchen Renovation')).toBe('Kitchen Renovation');
    expect(ensureActionSuffix('Cabinet Refacing')).toBe('Cabinet Refacing');
    expect(ensureActionSuffix('Bathroom Remodel')).toBe('Bathroom Remodel');
  });

  it('should be case-insensitive for EN', () => {
    expect(ensureActionSuffix('kitchen renovation')).toBe('kitchen renovation');
    expect(ensureActionSuffix('KITCHEN RENOVATION')).toBe('KITCHEN RENOVATION');
  });

  it('should use word boundaries for EN', () => {
    // A hypothetical label containing action word as substring should still get suffix
    // In practice this is unlikely with DB labels, but the regex should be precise
    expect(ensureActionSuffix('Renovation')).toBe('Renovation');
    expect(ensureActionSuffix('Remodel')).toBe('Remodel');
  });

  it('should append 装修 when no action word present (ZH)', () => {
    expect(ensureActionSuffix('厨房', true)).toBe('厨房装修');
    expect(ensureActionSuffix('全屋', true)).toBe('全屋装修');
  });

  it('should not append when action word already present (ZH)', () => {
    expect(ensureActionSuffix('厨房装修', true)).toBe('厨房装修');
    expect(ensureActionSuffix('厨房翻新', true)).toBe('厨房翻新');
    expect(ensureActionSuffix('厨房改造', true)).toBe('厨房改造');
  });
});

describe('pushSkippedFilesWarning', () => {
  it('should do nothing for empty array', () => {
    const errors: BatchError[] = [];
    pushSkippedFilesWarning([], errors);
    expect(errors).toHaveLength(0);
  });

  it('should push a warning with file names', () => {
    const errors: BatchError[] = [];
    pushSkippedFilesWarning(['folder/photo.heic', 'folder/scan.tiff'], errors);
    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe('warning');
    expect(errors[0].message).toContain('2 unsupported image(s) skipped');
    expect(errors[0].message).toContain('photo.heic');
    expect(errors[0].message).toContain('scan.tiff');
  });

  it('should strip directory paths from file names', () => {
    const errors: BatchError[] = [];
    pushSkippedFilesWarning(['a/b/c/photo.heic'], errors);
    expect(errors[0].message).toContain('photo.heic');
    expect(errors[0].message).not.toContain('a/b/c');
  });

  it('should truncate to 10 files and show remainder count', () => {
    const errors: BatchError[] = [];
    const files = Array.from({ length: 15 }, (_, i) => `folder/img${i}.heic`);
    pushSkippedFilesWarning(files, errors);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('15 unsupported image(s) skipped');
    expect(errors[0].message).toContain('and 5 more');
    // Should list first 10 but not the 11th
    expect(errors[0].message).toContain('img9.heic');
    expect(errors[0].message).not.toContain('img10.heic');
  });

  it('should not show "and X more" when exactly 10 files', () => {
    const errors: BatchError[] = [];
    const files = Array.from({ length: 10 }, (_, i) => `folder/img${i}.heic`);
    pushSkippedFilesWarning(files, errors);
    expect(errors[0].message).not.toContain('more');
  });
});
