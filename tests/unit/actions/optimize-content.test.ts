import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth
vi.mock('@/lib/admin/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock AI functions
vi.mock('@/lib/ai/openai', () => ({
  fetchWithTimeout: vi.fn(),
}));

vi.mock('@/lib/ai/content-optimizer', () => ({
  optimizeContent: vi.fn(),
  optimizeShortText: vi.fn(),
  optimizeProjectDescription: vi.fn(),
  generateAltText: vi.fn(),
}));

import { optimizeBlogContent, optimizeShortTextAction, optimizeProjectDescriptionAction, generateImageAltText } from '@/app/actions/admin/optimize-content';
import { optimizeContent, optimizeShortText, optimizeProjectDescription, generateAltText } from '@/lib/ai/content-optimizer';
import { fetchWithTimeout } from '@/lib/ai/openai';

describe('optimizeBlogContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error for empty content', async () => {
    const result = await optimizeBlogContent('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Content is required');
    }
  });

  it('returns error for whitespace-only content', async () => {
    const result = await optimizeBlogContent('   \n\t  ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Content is required');
    }
  });

  it('returns error for content exceeding max length', async () => {
    const longContent = 'a'.repeat(100001);
    const result = await optimizeBlogContent(longContent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('too long');
    }
  });

  it('returns success with optimized content', async () => {
    const mockData = {
      contentEn: '<p>Test</p>',
      contentZh: '<p>测试</p>',
      excerptEn: 'Excerpt',
      excerptZh: '摘要',
      detectedLanguage: 'en' as const,
    };
    (optimizeContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const result = await optimizeBlogContent('Test content');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockData);
    }
  });

  it('returns error on AI failure', async () => {
    (optimizeContent as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    const result = await optimizeBlogContent('Test content');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('API error');
    }
  });
});

describe('optimizeShortTextAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error for empty text', async () => {
    const result = await optimizeShortTextAction('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Text is required');
    }
  });

  it('returns error for text exceeding max length', async () => {
    const longText = 'a'.repeat(5001);
    const result = await optimizeShortTextAction(longText);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('too long');
    }
  });

  it('returns success with optimized text', async () => {
    const mockData = {
      textEn: 'Improved',
      textZh: '改进',
      detectedLanguage: 'en' as const,
    };
    (optimizeShortText as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const result = await optimizeShortTextAction('Some text');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockData);
    }
  });
});

describe('optimizeProjectDescriptionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error for empty notes', async () => {
    const result = await optimizeProjectDescriptionAction('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Project notes are required');
    }
  });

  it('returns error for whitespace-only notes', async () => {
    const result = await optimizeProjectDescriptionAction('   \n\t  ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Project notes are required');
    }
  });

  it('returns error for notes exceeding max length', async () => {
    const longNotes = 'a'.repeat(5001);
    const result = await optimizeProjectDescriptionAction(longNotes);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('too long');
    }
  });

  it('returns success with all project fields', async () => {
    const mockData = {
      descriptionEn: 'A complete kitchen renovation.',
      descriptionZh: '完整的厨房翻新。',
      challengeEn: 'Limited space.',
      challengeZh: '空间有限。',
      solutionEn: 'Open concept design.',
      solutionZh: '开放式设计。',
      badgeEn: 'Featured',
      badgeZh: '精选',
      metaTitleEn: 'Modern Kitchen | Reno Stars',
      metaTitleZh: '现代厨房 | Reno Stars',
      metaDescriptionEn: 'Complete kitchen transformation.',
      metaDescriptionZh: '完整厨房改造。',
      focusKeywordEn: 'kitchen renovation',
      focusKeywordZh: '厨房翻新',
      seoKeywordsEn: 'kitchen, renovation',
      seoKeywordsZh: '厨房, 翻新',
      detectedLanguage: 'en' as const,
    };
    (optimizeProjectDescription as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const result = await optimizeProjectDescriptionAction('Kitchen renovation with limited space');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockData);
    }
  });

  it('returns error on AI failure', async () => {
    (optimizeProjectDescription as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    const result = await optimizeProjectDescriptionAction('Some project notes');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('API error');
    }
  });
});

describe('generateImageAltText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error for empty URL', async () => {
    const result = await generateImageAltText('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Valid image URL is required');
    }
  });

  it('returns error for non-HTTP URL', async () => {
    const result = await generateImageAltText('file:///path/to/image.jpg');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Image URL must use HTTP or HTTPS protocol');
    }
  });

  it('returns error on fetch failure', async () => {
    (fetchWithTimeout as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await generateImageAltText('https://example.com/image.jpg');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to fetch image');
    }
  });

  it('returns error on fetch timeout', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    (fetchWithTimeout as ReturnType<typeof vi.fn>).mockRejectedValue(abortError);

    const result = await generateImageAltText('https://example.com/image.jpg');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Image fetch timed out');
    }
  });

  it('returns success with alt text', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);
    (fetchWithTimeout as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'image/jpeg',
      },
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    });
    (generateAltText as ReturnType<typeof vi.fn>).mockResolvedValue({
      altEn: 'Kitchen renovation',
      altZh: '厨房翻新',
    });

    const result = await generateImageAltText('https://example.com/image.jpg');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.altEn).toBe('Kitchen renovation');
      expect(result.altZh).toBe('厨房翻新');
    }
  });
});
