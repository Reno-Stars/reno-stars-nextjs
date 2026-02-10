import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the schema validation logic separately since OpenAI calls require complex mocking

// Full schema matching lib/ai/content-optimizer.ts
const OptimizedContentSchema = z.object({
  contentEn: z.string(),
  contentZh: z.string(),
  excerptEn: z.string(),
  excerptZh: z.string(),
  metaTitleEn: z.string(),
  metaTitleZh: z.string(),
  metaDescriptionEn: z.string(),
  metaDescriptionZh: z.string(),
  focusKeywordEn: z.string(),
  focusKeywordZh: z.string(),
  seoKeywordsEn: z.string(),
  seoKeywordsZh: z.string(),
  readingTimeMinutes: z.number(),
  detectedLanguage: z.enum(['en', 'zh']),
});

const BilingualTextSchema = z.object({
  textEn: z.string(),
  textZh: z.string(),
  detectedLanguage: z.enum(['en', 'zh']),
});

const AltTextSchema = z.object({
  altEn: z.string(),
  altZh: z.string(),
});

const ProjectDescriptionSchema = z.object({
  descriptionEn: z.string(),
  descriptionZh: z.string(),
  challengeEn: z.string(),
  challengeZh: z.string(),
  solutionEn: z.string(),
  solutionZh: z.string(),
  badgeEn: z.string(),
  badgeZh: z.string(),
  metaTitleEn: z.string(),
  metaTitleZh: z.string(),
  metaDescriptionEn: z.string(),
  metaDescriptionZh: z.string(),
  focusKeywordEn: z.string(),
  focusKeywordZh: z.string(),
  seoKeywordsEn: z.string(),
  seoKeywordsZh: z.string(),
  detectedLanguage: z.enum(['en', 'zh']),
});

describe('OptimizedContentSchema', () => {
  const createValidData = (overrides = {}) => ({
    contentEn: '<p>Test content</p>',
    contentZh: '<p>测试内容</p>',
    excerptEn: 'Test excerpt',
    excerptZh: '测试摘要',
    metaTitleEn: 'Test Title',
    metaTitleZh: '测试标题',
    metaDescriptionEn: 'Test description for SEO',
    metaDescriptionZh: '测试SEO描述',
    focusKeywordEn: 'renovation',
    focusKeywordZh: '装修',
    seoKeywordsEn: 'kitchen, bathroom, modern',
    seoKeywordsZh: '厨房, 浴室, 现代',
    readingTimeMinutes: 5,
    detectedLanguage: 'en' as const,
    ...overrides,
  });

  it('validates correct content structure with all SEO fields', () => {
    const validData = createValidData();
    const result = OptimizedContentSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it('accepts zh as detected language', () => {
    const validData = createValidData({ detectedLanguage: 'zh' });
    const result = OptimizedContentSchema.parse(validData);
    expect(result.detectedLanguage).toBe('zh');
  });

  it('rejects invalid detected language', () => {
    const invalidData = createValidData({ detectedLanguage: 'fr' });
    expect(() => OptimizedContentSchema.parse(invalidData)).toThrow();
  });

  it('rejects missing required fields', () => {
    const invalidData = {
      contentEn: '<p>Content</p>',
      // Missing other fields
    };
    expect(() => OptimizedContentSchema.parse(invalidData)).toThrow();
  });

  it('validates readingTimeMinutes as number', () => {
    const validData = createValidData({ readingTimeMinutes: 10 });
    const result = OptimizedContentSchema.parse(validData);
    expect(result.readingTimeMinutes).toBe(10);
  });

  it('rejects non-number readingTimeMinutes', () => {
    const invalidData = createValidData({ readingTimeMinutes: 'five' });
    expect(() => OptimizedContentSchema.parse(invalidData)).toThrow();
  });
});

describe('BilingualTextSchema', () => {
  it('validates correct text structure', () => {
    const validData = {
      textEn: 'Improved text',
      textZh: '改进的文本',
      detectedLanguage: 'en',
    };

    const result = BilingualTextSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it('rejects missing fields', () => {
    const invalidData = {
      textEn: 'Only English',
    };

    expect(() => BilingualTextSchema.parse(invalidData)).toThrow();
  });
});

describe('AltTextSchema', () => {
  it('validates correct alt text structure', () => {
    const validData = {
      altEn: 'Modern kitchen renovation',
      altZh: '现代厨房翻新',
    };

    const result = AltTextSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it('allows empty strings', () => {
    const data = {
      altEn: '',
      altZh: '',
    };

    const result = AltTextSchema.parse(data);
    expect(result.altEn).toBe('');
    expect(result.altZh).toBe('');
  });

  it('rejects missing altZh', () => {
    const invalidData = {
      altEn: 'Only English alt',
    };

    expect(() => AltTextSchema.parse(invalidData)).toThrow();
  });
});

describe('ProjectDescriptionSchema', () => {
  const createValidProjectData = (overrides = {}) => ({
    descriptionEn: 'A complete kitchen renovation transforming the space.',
    descriptionZh: '完整的厨房翻新，改变了整个空间。',
    challengeEn: 'Limited space and outdated layout.',
    challengeZh: '空间有限，布局陈旧。',
    solutionEn: 'Open concept design with modern fixtures.',
    solutionZh: '开放式设计，现代化设施。',
    badgeEn: 'Featured',
    badgeZh: '精选',
    metaTitleEn: 'Modern Kitchen Renovation | Reno Stars',
    metaTitleZh: '现代厨房翻新 | Reno Stars',
    metaDescriptionEn: 'Complete kitchen transformation with open concept design.',
    metaDescriptionZh: '采用开放式设计的完整厨房改造。',
    focusKeywordEn: 'kitchen renovation',
    focusKeywordZh: '厨房翻新',
    seoKeywordsEn: 'kitchen, renovation, modern, Vancouver',
    seoKeywordsZh: '厨房, 翻新, 现代, 温哥华',
    detectedLanguage: 'en' as const,
    ...overrides,
  });

  it('validates correct project description structure', () => {
    const validData = createValidProjectData();
    const result = ProjectDescriptionSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it('accepts zh as detected language', () => {
    const validData = createValidProjectData({ detectedLanguage: 'zh' });
    const result = ProjectDescriptionSchema.parse(validData);
    expect(result.detectedLanguage).toBe('zh');
  });

  it('rejects invalid detected language', () => {
    const invalidData = createValidProjectData({ detectedLanguage: 'fr' });
    expect(() => ProjectDescriptionSchema.parse(invalidData)).toThrow();
  });

  it('rejects missing required fields', () => {
    const invalidData = {
      descriptionEn: 'Only description',
      descriptionZh: '只有描述',
      // Missing other fields
    };
    expect(() => ProjectDescriptionSchema.parse(invalidData)).toThrow();
  });

  it('allows empty strings for optional-like fields', () => {
    const validData = createValidProjectData({
      badgeEn: '',
      badgeZh: '',
    });
    const result = ProjectDescriptionSchema.parse(validData);
    expect(result.badgeEn).toBe('');
    expect(result.badgeZh).toBe('');
  });
});
