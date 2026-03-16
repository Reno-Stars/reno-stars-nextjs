import { z } from 'zod';
import { getOpenAIClient, parseJsonResponse, AI_CONFIG } from './openai';
import { formatGlossaryForPrompt } from './glossary';
import { SPACE_TYPES } from '@/lib/admin/constants';

// Zod schemas for response validation
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

const ProjectDescriptionSchema = z.object({
  serviceType: z.enum(['kitchen', 'bathroom', 'basement', 'cabinet', 'commercial']).default('kitchen'),
  slug: z.string(),
  titleEn: z.string(),
  titleZh: z.string(),
  locationCity: z.string(),
  poNumber: z.string(),
  budgetRange: z.string(),
  durationEn: z.string(),
  durationZh: z.string(),
  descriptionEn: z.string(),
  descriptionZh: z.string(),
  challengeEn: z.string(),
  challengeZh: z.string(),
  solutionEn: z.string(),
  solutionZh: z.string(),
  badgeEn: z.string(),
  badgeZh: z.string(),
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
  selectedScopes: z.array(z.string()).default([]),
  detectedLanguage: z.enum(['en', 'zh']),
});

const SiteDescriptionSchema = z.object({
  slug: z.string(),
  titleEn: z.string(),
  titleZh: z.string(),
  locationCity: z.string(),
  poNumber: z.string(),
  budgetRange: z.string(),
  durationEn: z.string(),
  durationZh: z.string(),
  spaceTypeEn: z.enum(SPACE_TYPES.map((st) => st.en) as [string, ...string[]]).default('House'),
  descriptionEn: z.string(),
  descriptionZh: z.string(),
  badgeEn: z.string(),
  badgeZh: z.string(),
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
  detectedLanguage: z.enum(['en', 'zh']),
});

const AltTextSchema = z.object({
  altEn: z.string(),
  altZh: z.string(),
});

/** Extended alt text result with fallback indicator */
export interface AltTextResult extends AltText {
  /** True if this is a fallback value due to AI parsing failure */
  isFallback?: boolean;
}

export type OptimizedContent = z.infer<typeof OptimizedContentSchema>;
export type BilingualText = z.infer<typeof BilingualTextSchema>;
export type ProjectDescription = z.infer<typeof ProjectDescriptionSchema>;
export type SiteDescription = z.infer<typeof SiteDescriptionSchema>;
export type AltText = z.infer<typeof AltTextSchema>;

export interface ImageForAltText {
  url: string;
  base64?: string;
  mimeType?: string;
}

const BLOG_CONTENT_PROMPT = `You are a professional bilingual translator and content editor for a renovation company website.

CRITICAL REQUIREMENTS:
1. You MUST provide content in BOTH English AND Chinese
2. You MUST PRESERVE ALL <img> tags exactly as they appear (with src, alt attributes)
3. contentEn must be in English, contentZh must be in Chinese (中文)

Your tasks:
1. DETECT the source language (English or Chinese)
2. CLEAN UP into semantic HTML:
   - Use h2, h3, h4 headings (never h1)
   - Convert lists to <ul>/<ol> with <li>
   - Wrap paragraphs in <p> tags
   - Keep <strong>, <em> formatting
   - PRESERVE ALL <img> tags exactly as they appear
3. TRANSLATE the content:
   - If source is English: contentEn = cleaned English, contentZh = FULL CHINESE TRANSLATION
   - If source is Chinese: contentZh = cleaned Chinese, contentEn = FULL ENGLISH TRANSLATION
4. GENERATE bilingual SEO metadata

IMPORTANT RULES:
- contentZh MUST be written entirely in Chinese characters (中文), not English
- All <img> tags from the original MUST appear in both contentEn and contentZh
- Return ONLY valid JSON, no markdown

Response format:
{
  "detectedLanguage": "en" or "zh",
  "contentEn": "HTML content in English with all images preserved",
  "contentZh": "HTML内容必须是中文，保留所有图片",
  "excerptEn": "English summary 150-200 chars",
  "excerptZh": "中文摘要150-200字符",
  "metaTitleEn": "SEO title under 60 chars",
  "metaTitleZh": "SEO标题少于60字符",
  "metaDescriptionEn": "Compelling SEO description under 155 chars",
  "metaDescriptionZh": "SEO描述少于155字符",
  "focusKeywordEn": "primary keyword",
  "focusKeywordZh": "主要关键词",
  "seoKeywordsEn": "keyword1, keyword2, keyword3",
  "seoKeywordsZh": "关键词1, 关键词2, 关键词3",
  "readingTimeMinutes": 5
}
${formatGlossaryForPrompt()}`;

const SHORT_TEXT_PROMPT = `You are a professional bilingual (English/Chinese) content editor for a renovation company website.

Your task:
1. DETECT the source language of the input text (English or Chinese)
2. IMPROVE the text: fix grammar, improve clarity, use professional renovation terminology
3. TRANSLATE to the other language

Keep the text concise and professional. Do not add HTML tags unless they were in the original.

IMPORTANT: Return ONLY a valid JSON object with no additional text.

Response format:
{
  "detectedLanguage": "en" or "zh",
  "textEn": "improved English text",
  "textZh": "improved Chinese text"
}
${formatGlossaryForPrompt()}`;

const PROJECT_DESCRIPTION_PROMPT = `You are a professional bilingual content editor and SEO specialist for a renovation company website.

Given raw project notes or a brief description, generate a URL slug, bilingual titles, comprehensive project content, and SEO metadata in both English and Chinese.

CRITICAL REQUIREMENTS:
1. All English fields MUST be in English
2. All Chinese fields MUST be in Chinese characters (中文)
3. Content should be professional, engaging, and highlight the renovation work
4. SEO fields should be optimized for search engines

Field guidelines:
- serviceType: Detect the renovation type from the notes. Must be one of: "kitchen", "bathroom", "basement", "cabinet", "commercial". Infer from the scope of work described (e.g., 卫生间/浴室/shower/bath → "bathroom", 厨房/kitchen → "kitchen", 地下室/basement → "basement", 橱柜/cabinet → "cabinet", 办公室/商业/office/store → "commercial"). Default to "kitchen" only if truly unclear.
- slug: URL-friendly slug using only lowercase letters, numbers, and hyphens. No consecutive hyphens. Make it descriptive and specific — include key details like scope, style, or distinguishing features from the notes (e.g., "dual-bathroom-brushed-gold-renovation-burnaby", "open-concept-kitchen-quartz-countertop-surrey", "luxury-basement-suite-conversion-vancouver"). Avoid generic slugs like "kitchen-renovation" or "bathroom-renovation".
- titleEn/titleZh: Descriptive title that reflects the specific scope from the notes (e.g., "Dual Bathroom Renovation with Brushed Gold Fixtures" / "双卫生间翻新 — 拉丝金水件"). Must match the detected serviceType. Avoid generic titles like "Kitchen Renovation".
- locationCity: The city/area name if mentioned in the notes (e.g., "Vancouver", "West Vancouver", "North Vancouver"). Use English name. Leave empty string if no location is mentioned.
- poNumber: PO number / purchase order / reference number if mentioned in the notes (e.g., "PO-2024-9203", "PO 12345"). Extract the value as-is (max 50 characters). Leave empty string if not mentioned.
- budgetRange: Exact budget or range if mentioned in the notes (e.g., "$22,000" or "$15,000 - $25,000"). Use the value from the notes as-is. Leave empty string if no budget is mentioned.
- durationEn/durationZh: Project timeline if mentioned in the notes (e.g., "3 weeks" / "3周"). Use the value from the notes. Leave empty string if no duration is mentioned.
- description: 2-3 sentences about the project scope and transformation (50-150 words)
- challenge: 1-2 sentences about the main challenges faced (30-80 words)
- solution: 1-2 sentences about how challenges were addressed (30-80 words)
- badge: Short highlight text for a badge/tag (2-5 words, e.g., "Award Winner" / "获奖作品")
- excerpt: 1-2 sentences summarizing the project for listings (100-200 characters)
- metaTitle: SEO title under 60 characters, include primary keyword
- metaDescription: SEO description under 155 characters, compelling and keyword-rich
- focusKeyword: Primary keyword/phrase for this project (e.g., "modern kitchen renovation")
- seoKeywords: 3-5 comma-separated keywords related to the project
- selectedScopes: Select ALL service scopes that apply to this project from the AVAILABLE_SCOPES list provided in the user message. Return the English name of each selected scope. Only select scopes from the provided list — do NOT invent new ones. Select generously — include every scope that is relevant based on the notes.

Return ONLY valid JSON, no markdown.

Response format:
{
  "detectedLanguage": "en" or "zh",
  "serviceType": "kitchen" or "bathroom" or "basement" or "cabinet" or "commercial",
  "slug": "url-friendly-slug",
  "titleEn": "English Project Title",
  "titleZh": "中文项目标题",
  "locationCity": "Vancouver",
  "poNumber": "PO-2024-9203",
  "budgetRange": "$22,000",
  "durationEn": "3 weeks",
  "durationZh": "3周",
  "descriptionEn": "English project description",
  "descriptionZh": "中文项目描述",
  "challengeEn": "English challenge description",
  "challengeZh": "中文挑战描述",
  "solutionEn": "English solution description",
  "solutionZh": "中文解决方案",
  "badgeEn": "Badge text",
  "badgeZh": "标签文字",
  "excerptEn": "English excerpt 100-200 chars",
  "excerptZh": "中文摘要100-200字符",
  "metaTitleEn": "SEO Title | Reno Stars",
  "metaTitleZh": "SEO标题 | Reno Stars",
  "metaDescriptionEn": "Compelling SEO description under 155 chars",
  "metaDescriptionZh": "引人注目的SEO描述，少于155字符",
  "focusKeywordEn": "primary keyword",
  "focusKeywordZh": "主要关键词",
  "seoKeywordsEn": "keyword1, keyword2, keyword3",
  "seoKeywordsZh": "关键词1, 关键词2, 关键词3",
  "selectedScopes": ["Scope Name 1", "Scope Name 2"]
}
${formatGlossaryForPrompt()}`;

const SITE_DESCRIPTION_PROMPT = `You are a professional bilingual content editor and SEO specialist for a renovation company website.

Given raw notes or a brief description about a whole-house renovation site (property), generate a URL slug, bilingual titles, comprehensive site content, and SEO metadata in both English and Chinese.

CRITICAL REQUIREMENTS:
1. All English fields MUST be in English
2. All Chinese fields MUST be in Chinese characters (中文)
3. Content should be professional, engaging, and highlight the overall renovation transformation
4. SEO fields should be optimized for search engines

Field guidelines:
- slug: URL-friendly slug using only lowercase letters, numbers, and hyphens (e.g., "west-vancouver-whole-house-renovation"). No consecutive hyphens.
- titleEn/titleZh: Short, descriptive title for the site (e.g., "West Vancouver Whole House Renovation" / "西温哥华全屋装修")
- locationCity: The city/area name if mentioned in the notes (e.g., "Vancouver", "West Vancouver", "North Vancouver"). Use English name. Leave empty string if no location is mentioned.
- poNumber: PO number / purchase order / reference number if mentioned in the notes (e.g., "PO-2024-9203", "PO 12345"). Extract the value as-is (max 50 characters). Leave empty string if not mentioned.
- budgetRange: Estimated budget range for the entire site (e.g., "$80,000 - $120,000"). Use USD format. Leave empty string if no budget is mentioned.
- durationEn/durationZh: Estimated timeline for the entire project (e.g., "12 weeks" / "12周", "3 months" / "3个月"). Leave empty string if no duration is mentioned.
- spaceTypeEn: Detect the type of space from the notes. Must be one of: "Condo", "House", "Townhouse", "Apartment", "Commercial". Infer from context (e.g., condo/公寓 → "Condo", house/独立屋/别墅 → "House", townhouse/联排 → "Townhouse", apartment/公寓楼 → "Apartment", office/store/商业 → "Commercial"). Default to "House" if truly unclear.
- description: 2-3 sentences about the overall renovation scope and transformation of the property (50-150 words)
- badge: Short highlight text for a badge/tag (2-5 words, e.g., "Whole House" / "全屋装修")
- excerpt: 1-2 sentences summarizing the site for listings (100-200 characters)
- metaTitle: SEO title under 60 characters, include primary keyword
- metaDescription: SEO description under 155 characters, compelling and keyword-rich
- focusKeyword: Primary keyword/phrase for this site (e.g., "whole house renovation Vancouver")
- seoKeywords: 3-5 comma-separated keywords related to the site

Return ONLY valid JSON, no markdown.

Response format:
{
  "detectedLanguage": "en" or "zh",
  "slug": "url-friendly-slug",
  "titleEn": "English Site Title",
  "titleZh": "中文工地标题",
  "locationCity": "West Vancouver",
  "poNumber": "PO-2024-9203",
  "budgetRange": "$80,000 - $120,000",
  "durationEn": "12 weeks",
  "durationZh": "12周",
  "spaceTypeEn": "House",
  "descriptionEn": "English site description",
  "descriptionZh": "中文工地描述",
  "badgeEn": "Badge text",
  "badgeZh": "标签文字",
  "excerptEn": "English excerpt 100-200 chars",
  "excerptZh": "中文摘要100-200字符",
  "metaTitleEn": "SEO Title | Reno Stars",
  "metaTitleZh": "SEO标题 | Reno Stars",
  "metaDescriptionEn": "Compelling SEO description under 155 chars",
  "metaDescriptionZh": "引人注目的SEO描述，少于155字符",
  "focusKeywordEn": "primary keyword",
  "focusKeywordZh": "主要关键词",
  "seoKeywordsEn": "keyword1, keyword2, keyword3",
  "seoKeywordsZh": "关键词1, 关键词2, 关键词3"
}
${formatGlossaryForPrompt()}`;

const ALT_TEXT_PROMPT = `You are an image description specialist for a renovation company website.
Generate concise, descriptive alt text for the provided image.
The alt text should:
- Be 10-20 words
- Describe what's visible in the image
- Include relevant renovation/design context if applicable
- Be useful for accessibility

Return a JSON object with both English and Chinese alt text:
{
  "altEn": "English alt text",
  "altZh": "Chinese alt text"
}
${formatGlossaryForPrompt()}`;

/**
 * Optimize blog content using GPT-4
 * - Detects source language
 * - Cleans up to semantic HTML
 * - Translates to the other language
 * - Generates excerpts for both languages
 */
export async function optimizeContent(rawContent: string): Promise<OptimizedContent> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    // Use gpt-4o for better translation quality
    model: AI_CONFIG.modelContent,
    messages: [
      { role: 'system', content: BLOG_CONTENT_PROMPT },
      { role: 'user', content: rawContent },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensContent,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('No response from OpenAI');
  }

  // Check if response was truncated due to token limit
  if (choice.finish_reason === 'length') {
    throw new Error(
      'Content too long for AI processing. Please try with shorter content or split into multiple sections.'
    );
  }

  const parsed = parseJsonResponse<unknown>(choice.message.content);
  const result = OptimizedContentSchema.parse(parsed);
  return result;
}

/**
 * Optimize short text (descriptions, challenges, solutions)
 * - Detects source language
 * - Improves grammar and clarity
 * - Translates to the other language
 */
export async function optimizeShortText(rawText: string): Promise<BilingualText> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: SHORT_TEXT_PROMPT },
      { role: 'user', content: rawText },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensShort,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = parseJsonResponse<unknown>(content);
  const result = BilingualTextSchema.parse(parsed);
  return result;
}

/**
 * Optimize project description fields using GPT-4
 * - Detects source language
 * - Generates description, challenge, solution, and badge in both languages
 */
export async function optimizeProjectDescription(
  rawNotes: string,
  availableScopes?: { en: string; zh: string }[],
): Promise<ProjectDescription> {
  const client = getOpenAIClient();

  // Append available scopes to the user message so AI can select from them
  let userMessage = rawNotes;
  if (availableScopes && availableScopes.length > 0) {
    const scopeList = availableScopes.map((s) => s.en).join(', ');
    userMessage += `\n\nAVAILABLE_SCOPES: [${scopeList}]`;
  }

  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: PROJECT_DESCRIPTION_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensProjectDescription,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = parseJsonResponse<unknown>(content);
  const result = ProjectDescriptionSchema.parse(parsed);
  return result;
}

/**
 * Optimize site description fields using GPT-4
 * - Detects source language
 * - Generates description, badge, excerpt, and SEO metadata in both languages
 */
export async function optimizeSiteDescription(rawNotes: string): Promise<SiteDescription> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: SITE_DESCRIPTION_PROMPT },
      { role: 'user', content: rawNotes },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensProjectDescription,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = parseJsonResponse<unknown>(content);
  const result = SiteDescriptionSchema.parse(parsed);
  return result;
}

/**
 * Generate alt text for an image using GPT-4 Vision
 * Returns alt text with optional isFallback flag if AI parsing failed
 */
export async function generateAltText(image: ImageForAltText): Promise<AltTextResult> {
  const client = getOpenAIClient();

  // Build the image content - prefer base64 if available, otherwise use URL
  const imageContent = image.base64
    ? {
        type: 'image_url' as const,
        image_url: {
          url: `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}`,
        },
      }
    : {
        type: 'image_url' as const,
        image_url: { url: image.url },
      };

  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ALT_TEXT_PROMPT },
          imageContent,
        ],
      },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensAltText,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI for alt text');
  }

  try {
    const parsed = parseJsonResponse<unknown>(content);
    return AltTextSchema.parse(parsed);
  } catch (error) {
    // Log the error and return fallback with indicator
    console.error('Failed to parse alt text response:', error, 'Raw content:', content);
    return {
      altEn: 'Renovation project image',
      altZh: '装修项目图片',
      isFallback: true,
    };
  }
}
