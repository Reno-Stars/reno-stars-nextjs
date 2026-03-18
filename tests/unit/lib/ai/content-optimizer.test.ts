import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateProjectDescription } from '@/lib/ai/content-optimizer';
import type { ProjectDescription } from '@/lib/ai/content-optimizer';

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

// ============================================================================
// validateProjectDescription tests
// ============================================================================

describe('validateProjectDescription', () => {
  const makeResult = (overrides: Partial<ProjectDescription> = {}): ProjectDescription => ({
    serviceType: 'kitchen',
    slug: 'modern-kitchen-renovation-vancouver',
    titleEn: 'Modern Kitchen Renovation in Vancouver',
    titleZh: '温哥华现代厨房翻新',
    locationCity: 'Vancouver',
    poNumber: '',
    budgetRange: '$25,000',
    durationEn: '4 weeks',
    durationZh: '4周',
    spaceTypeEn: 'House',
    descriptionEn: 'A modern kitchen renovation.',
    descriptionZh: '现代厨房翻新。',
    challengeEn: 'Limited space.',
    challengeZh: '空间有限。',
    solutionEn: 'Open concept.',
    solutionZh: '开放式设计。',
    badgeEn: 'Featured',
    badgeZh: '精选',
    excerptEn: 'Modern kitchen renovation.',
    excerptZh: '现代厨房翻新。',
    metaTitleEn: 'Modern Kitchen Renovation | Reno Stars',
    metaTitleZh: '现代厨房翻新 | Reno Stars',
    metaDescriptionEn: 'Complete kitchen transformation.',
    metaDescriptionZh: '完整厨房改造。',
    focusKeywordEn: 'kitchen renovation',
    focusKeywordZh: '厨房翻新',
    seoKeywordsEn: 'kitchen, renovation',
    seoKeywordsZh: '厨房, 翻新',
    selectedScopes: ['Prefab Cabinet', 'Flooring'],
    detectedLanguage: 'en',
    ...overrides,
  });

  const bathroomScopes = [
    { en: 'Prefab Vanity', zh: '成品洗手柜' },
    { en: 'All Wall Tile', zh: '全墙砖' },
    { en: 'Plumbing Work', zh: '水管工程' },
  ];

  const kitchenScopes = [
    { en: 'Prefab Cabinet', zh: '成品柜' },
    { en: 'Flooring', zh: '地面工程' },
    { en: 'Painting', zh: '油漆' },
  ];

  const serviceTypes = ['kitchen', 'bathroom', 'basement', 'cabinet', 'commercial'];

  describe('serviceType enforcement', () => {
    it('passes through valid serviceType', () => {
      const result = makeResult({ serviceType: 'kitchen' });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.serviceType).toBe('kitchen');
      expect(corrections).toHaveLength(0);
    });

    it('sets invalid serviceType to null', () => {
      const result = makeResult({ serviceType: 'plumbing' });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.serviceType).toBeNull();
      expect(corrections).toHaveLength(1);
      expect(corrections[0]).toContain('plumbing');
    });

    it('keeps null serviceType as null', () => {
      const result = makeResult({ serviceType: null });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.serviceType).toBeNull();
      expect(corrections).toHaveLength(0);
    });

    it('skips check when no availableServiceTypes provided', () => {
      const result = makeResult({ serviceType: 'plumbing' });
      const { corrected, corrections } = validateProjectDescription(result);
      expect(corrected.serviceType).toBe('plumbing');
      expect(corrections).toHaveLength(0);
    });
  });

  describe('scope enforcement', () => {
    it('keeps valid scopes', () => {
      const result = makeResult({ selectedScopes: ['Prefab Cabinet', 'Flooring'] });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.selectedScopes).toEqual(['Prefab Cabinet', 'Flooring']);
      expect(corrections).toHaveLength(0);
    });

    it('filters out invalid scopes', () => {
      const result = makeResult({ selectedScopes: ['Prefab Cabinet', 'Backsplash Tile', 'Flooring'] });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.selectedScopes).toEqual(['Prefab Cabinet', 'Flooring']);
      expect(corrections).toHaveLength(1);
      expect(corrections[0]).toContain('Backsplash Tile');
    });

    it('falls back to all scopes when all AI scopes are invalid', () => {
      const result = makeResult({ selectedScopes: ['Backsplash Tile', 'Crown Molding'] });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.selectedScopes).toEqual(['Prefab Cabinet', 'Flooring', 'Painting']);
      expect(corrections).toHaveLength(2); // removed + fallback
      expect(corrections[0]).toContain('Backsplash Tile');
      expect(corrections[1]).toContain('falling back');
    });

    it('skips check when no availableScopes provided', () => {
      const result = makeResult({ selectedScopes: ['Anything'] });
      const { corrected, corrections } = validateProjectDescription(result);
      expect(corrected.selectedScopes).toEqual(['Anything']);
      expect(corrections).toHaveLength(0);
    });

    it('skips check when selectedScopes is empty', () => {
      const result = makeResult({ selectedScopes: [] });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.selectedScopes).toEqual([]);
      expect(corrections).toHaveLength(0);
    });
  });

  describe('slug-title consistency', () => {
    it('keeps slug when it matches title', () => {
      const result = makeResult({
        titleEn: 'Modern Kitchen Renovation in Vancouver',
        slug: 'modern-kitchen-renovation-vancouver',
      });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.slug).toBe('modern-kitchen-renovation-vancouver');
      expect(corrections.filter((c) => c.includes('Slug'))).toHaveLength(0);
    });

    it('regenerates slug when it diverges from title', () => {
      const result = makeResult({
        titleEn: 'Luxury Bathroom Spa Retreat',
        slug: 'compact-kitchen-makeover-2024',
      });
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.slug).toBe('luxury-bathroom-spa-retreat');
      expect(corrections.some((c) => c.includes('Slug'))).toBe(true);
    });

    it('keeps slug when title has few significant words but they match', () => {
      const result = makeResult({
        titleEn: 'Basement Suite',
        slug: 'basement-suite-conversion',
      });
      // "basement" and "suite" are shared — 2 words match
      const { corrected, corrections } = validateProjectDescription(result, kitchenScopes, serviceTypes);
      expect(corrected.slug).toBe('basement-suite-conversion');
      expect(corrections.filter((c) => c.includes('Slug'))).toHaveLength(0);
    });
  });

  describe('does not mutate input', () => {
    it('returns a new object without modifying the original', () => {
      const original = makeResult({ selectedScopes: ['Backsplash Tile', 'Flooring'] });
      const originalScopes = [...original.selectedScopes];
      validateProjectDescription(original, kitchenScopes, serviceTypes);
      expect(original.selectedScopes).toEqual(originalScopes);
    });
  });

  describe('multiple corrections combined', () => {
    it('fixes serviceType, scopes, and slug all at once', () => {
      const result = makeResult({
        serviceType: 'plumbing',
        selectedScopes: ['Backsplash Tile'],
        titleEn: 'Full Bathroom Renovation with Heated Floors',
        slug: 'random-unrelated-slug-here',
      });
      const { corrected, corrections } = validateProjectDescription(result, bathroomScopes, serviceTypes);
      expect(corrected.serviceType).toBeNull();
      expect(corrected.selectedScopes).toEqual(['Prefab Vanity', 'All Wall Tile', 'Plumbing Work']);
      expect(corrected.slug).toBe('full-bathroom-renovation-with-heated-floors');
      expect(corrections.length).toBeGreaterThanOrEqual(3);
    });
  });
});
