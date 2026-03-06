import { describe, it, expect } from 'vitest';
import { parseProductsFile, isValidProductUrl } from '@/lib/batch/batch-processor';

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
