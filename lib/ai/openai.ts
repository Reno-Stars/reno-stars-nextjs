import OpenAI from 'openai';

// Configuration constants
export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  // Use gpt-4o for content translation (better quality)
  modelContent: 'gpt-4o',
  temperature: 0.3,
  maxTokensContent: 8192,
  // Blog generation: bilingual content (800-1200 words x2) + SEO fields in JSON
  maxTokensBlogGeneration: 16384,
  maxTokensShort: 1024,
  // Project descriptions need more tokens for 16 fields (content + SEO)
  maxTokensProjectDescription: 2048,
  maxTokensAltText: 256,
  fetchTimeoutMs: 60000,
} as const;

/**
 * Get and validate the OpenAI API key from environment variables.
 * @throws Error if OPENAI_API_KEY is not set
 */
function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for AI content optimization. ' +
        'Please set it in your .env file or environment.'
    );
  }
  return key;
}

// Lazy-initialized OpenAI client (singleton pattern).
// This is intentional for serverless environments - the client is stateless
// and reusing it across requests is safe and recommended by OpenAI.
// Only creates client when first used, not at module import time.
let _client: OpenAI | null = null;

/**
 * Gets the OpenAI client instance, initializing it lazily on first access.
 * This prevents crashes when importing this module in contexts
 * where OPENAI_API_KEY is not needed (e.g., build-time imports).
 */
export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: getApiKey() });
  }
  return _client;
}

/**
 * Parse JSON from OpenAI response, handling markdown code blocks
 * @throws Error with descriptive message if JSON is malformed or truncated
 */
export function parseJsonResponse<T>(content: string): T {
  let jsonStr = content.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  jsonStr = jsonStr.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    // Heuristic: Check if response appears truncated
    // Valid JSON objects end with } or ], truncated responses often end mid-string
    const lastChar = jsonStr.charAt(jsonStr.length - 1);
    const looksLikeTruncated = lastChar !== '}' && lastChar !== ']';

    if (looksLikeTruncated) {
      // Log for monitoring truncation issues in production
      console.warn('[AI] Response appears truncated, last 50 chars:', jsonStr.slice(-50));
      throw new Error(
        'AI response was truncated. The content may be too long. Try with shorter content or split into multiple sections.'
      );
    }

    // Log parsing errors for debugging
    console.error('[AI] JSON parse error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Fetch with timeout using AbortController
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs: number = AI_CONFIG.fetchTimeoutMs
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
