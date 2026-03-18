'use server';

import { requireAuth } from '@/lib/admin/auth';
import { fetchWithTimeout } from '@/lib/ai/openai';
import {
  optimizeContent,
  optimizeShortText,
  optimizeProjectDescription,
  optimizeSiteDescription,
  generateAltText,
  type OptimizedContent,
  type BilingualText,
  type ProjectDescription,
  type SiteDescription,
} from '@/lib/ai/content-optimizer';
import { SERVICE_SCOPES } from '@/lib/admin/constants';
import { getServiceTypeMap } from '@/lib/db/queries';

const MAX_CONTENT_LENGTH = 100_000;
const MAX_SHORT_TEXT_LENGTH = 5_000;

/** All unique scopes across all service types (deduplicated by EN name, computed once). */
const ALL_SCOPES: { en: string; zh: string }[] = (() => {
  const seen = new Set<string>();
  return Object.values(SERVICE_SCOPES).flat().filter((s) => {
    if (seen.has(s.en)) return false;
    seen.add(s.en);
    return true;
  });
})();

export interface OptimizeResult {
  success: true;
  data: OptimizedContent;
}

export interface OptimizeShortTextResult {
  success: true;
  data: BilingualText;
}

export interface OptimizeProjectDescriptionResult {
  success: true;
  data: ProjectDescription;
}

export interface OptimizeSiteDescriptionResult {
  success: true;
  data: SiteDescription;
}

export interface OptimizeError {
  success: false;
  error: string;
}

/**
 * Server action to optimize blog content using AI
 * - Requires admin authentication
 * - Detects source language
 * - Cleans up to semantic HTML
 * - Translates to the other language
 * - Generates excerpts for both languages
 */
export async function optimizeBlogContent(
  rawContent: string
): Promise<OptimizeResult | OptimizeError> {
  await requireAuth();

  if (!rawContent || rawContent.trim().length === 0) {
    return { success: false, error: 'Content is required' };
  }

  if (rawContent.length > MAX_CONTENT_LENGTH) {
    return { success: false, error: `Content is too long (max ${MAX_CONTENT_LENGTH.toLocaleString()} characters)` };
  }

  try {
    const result = await optimizeContent(rawContent);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to optimize content:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to optimize content: ${message}` };
  }
}

/**
 * Server action to optimize short text (descriptions, challenges, solutions)
 * - Requires admin authentication
 * - Detects source language
 * - Improves grammar and clarity
 * - Translates to the other language
 */
export async function optimizeShortTextAction(
  rawText: string
): Promise<OptimizeShortTextResult | OptimizeError> {
  await requireAuth();

  if (!rawText || rawText.trim().length === 0) {
    return { success: false, error: 'Text is required' };
  }

  if (rawText.length > MAX_SHORT_TEXT_LENGTH) {
    return { success: false, error: `Text is too long (max ${MAX_SHORT_TEXT_LENGTH.toLocaleString()} characters)` };
  }

  try {
    const result = await optimizeShortText(rawText);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to optimize text:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to optimize text: ${message}` };
  }
}

/**
 * Server action to optimize project description fields using AI
 * - Requires admin authentication
 * - Generates description, challenge, solution, and badge in both languages
 */
export async function optimizeProjectDescriptionAction(
  rawNotes: string
): Promise<OptimizeProjectDescriptionResult | OptimizeError> {
  await requireAuth();

  if (!rawNotes || rawNotes.trim().length === 0) {
    return { success: false, error: 'Project notes are required' };
  }

  if (rawNotes.length > MAX_SHORT_TEXT_LENGTH) {
    return { success: false, error: `Notes are too long (max ${MAX_SHORT_TEXT_LENGTH.toLocaleString()} characters)` };
  }

  try {
    // Load available service types from DB (cached per request)
    const serviceTypeMap = await getServiceTypeMap();
    const availableServiceTypes = Object.keys(serviceTypeMap);

    const result = await optimizeProjectDescription(rawNotes, ALL_SCOPES, availableServiceTypes);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to optimize project description:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to optimize project description: ${message}` };
  }
}

/**
 * Server action to optimize site description fields using AI
 * - Requires admin authentication
 * - Generates description, badge, excerpt, and SEO metadata in both languages
 */
export async function optimizeSiteDescriptionAction(
  rawNotes: string
): Promise<OptimizeSiteDescriptionResult | OptimizeError> {
  await requireAuth();

  if (!rawNotes || rawNotes.trim().length === 0) {
    return { success: false, error: 'Site notes are required' };
  }

  if (rawNotes.length > MAX_SHORT_TEXT_LENGTH) {
    return { success: false, error: `Notes are too long (max ${MAX_SHORT_TEXT_LENGTH.toLocaleString()} characters)` };
  }

  try {
    const result = await optimizeSiteDescription(rawNotes);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to optimize site description:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to optimize site description: ${message}` };
  }
}

/**
 * Server action to generate alt text for images using AI vision
 * - Requires admin authentication
 * - Fetches images and converts to base64 for vision API
 * - Returns bilingual alt text with optional isFallback flag
 */
export async function generateImageAltText(
  imageUrl: string
): Promise<{ success: true; altEn: string; altZh: string; isFallback?: boolean } | OptimizeError> {
  await requireAuth();

  // Validate URL with proper protocol check
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { success: false, error: 'Image URL must use HTTP or HTTPS protocol' };
    }
  } catch {
    return { success: false, error: 'Valid image URL is required' };
  }

  try {
    // Fetch image with timeout and convert to base64
    const response = await fetchWithTimeout(imageUrl);
    if (!response.ok) {
      return { success: false, error: 'Failed to fetch image' };
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const result = await generateAltText({
      url: imageUrl,
      base64,
      mimeType: contentType,
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('Failed to generate alt text:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Image fetch timed out' };
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to generate alt text: ${message}` };
  }
}
