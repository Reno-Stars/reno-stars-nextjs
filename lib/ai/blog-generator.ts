import { z } from 'zod';
import { getOpenAIClient, parseJsonResponse, AI_CONFIG } from './openai';
import { formatGlossaryForPrompt } from './glossary';

// ============================================================================
// Types for project/site data passed to the generator (#8: exported)
// ============================================================================

export interface ProjectDataForBlog {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  serviceType: string;
  locationCity: string | null;
  budgetRange: string | null;
  durationEn: string | null;
  durationZh: string | null;
  heroImageUrl: string | null;
  challengeEn: string | null;
  challengeZh: string | null;
  solutionEn: string | null;
  solutionZh: string | null;
  scopes: { scopeEn: string; scopeZh: string }[];
  externalProducts: { url: string; labelEn: string; labelZh: string }[];
  imagePairs: {
    beforeImageUrl: string | null;
    beforeAltTextEn: string | null;
    afterImageUrl: string | null;
    afterAltTextEn: string | null;
  }[];
}

export interface SiteDataForBlog {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  locationCity: string | null;
  heroImageUrl: string | null;
  budgetRange: string | null;
  durationEn: string | null;
  durationZh: string | null;
}

// ============================================================================
// Response schema
// ============================================================================

const BlogGenerationSchema = z.object({
  titleEn: z.string(),
  titleZh: z.string(),
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
  slug: z.string(),
});

export type BlogGeneration = z.infer<typeof BlogGenerationSchema>;

// ============================================================================
// Prompt
// ============================================================================

const BLOG_GENERATION_PROMPT = `You are a professional bilingual content writer for Reno Stars, a renovation company in Vancouver, BC.

Your task is to generate a COMPLETE bilingual blog post (case study) from renovation project data.

ARTICLE STRUCTURE:
1. Introduction — hook the reader, mention location for local SEO
2. Project Overview — scope of work, service type, budget/duration if available
3. Challenges — what made this project complex
4. Our Solution — how the team addressed each challenge
5. Before & After — embed provided images with descriptive text
6. Results & Key Takeaways — final outcome, client satisfaction

CRITICAL REQUIREMENTS:
1. contentEn MUST be in English, contentZh MUST be in Chinese (中文)
2. Use semantic HTML: h2, h3, p, ul, li, strong, em — NEVER h1
3. Embed <img> tags using the provided image URLs. Use descriptive alt text.
4. For before/after pairs, create a visual comparison section with both images
5. Keep a professional, warm tone that showcases the renovation work
6. Include location mentions naturally for local SEO (Vancouver, BC area)
7. Generate a URL-friendly slug based on the project

IMPORTANT RULES:
- All Chinese fields MUST be written entirely in Chinese characters
- Return ONLY valid JSON, no markdown code blocks
- Content should be 800-1200 words per language
- excerpts should be 150-200 characters
- metaTitle under 60 characters
- metaDescription under 155 characters
- focusKeyword under 50 characters
- slug should be lowercase with hyphens only (e.g., "oak-street-kitchen-renovation-case-study")

Response format:
{
  "titleEn": "Blog post title in English",
  "titleZh": "博客文章中文标题",
  "contentEn": "<h2>...</h2><p>...</p>...",
  "contentZh": "<h2>...</h2><p>...</p>...",
  "excerptEn": "English excerpt 150-200 chars",
  "excerptZh": "中文摘要150-200字符",
  "metaTitleEn": "SEO title under 60 chars",
  "metaTitleZh": "SEO标题少于60字符",
  "metaDescriptionEn": "SEO description under 155 chars",
  "metaDescriptionZh": "SEO描述少于155字符",
  "focusKeywordEn": "primary keyword",
  "focusKeywordZh": "主要关键词",
  "seoKeywordsEn": "keyword1, keyword2, keyword3",
  "seoKeywordsZh": "关键词1, 关键词2, 关键词3",
  "readingTimeMinutes": 5,
  "slug": "project-slug-case-study"
}
${formatGlossaryForPrompt()}`;

// ============================================================================
// Helpers
// ============================================================================

function buildProjectContext(project: ProjectDataForBlog): string {
  const lines: string[] = [
    `Project: ${project.titleEn} / ${project.titleZh}`,
    `Service Type: ${project.serviceType}`,
    `Description (EN): ${project.descriptionEn}`,
    `Description (ZH): ${project.descriptionZh}`,
  ];

  if (project.locationCity) lines.push(`Location: ${project.locationCity}`);
  if (project.budgetRange) lines.push(`Budget: ${project.budgetRange}`);
  // #13: Check both EN and ZH duration before building the line
  if (project.durationEn && project.durationZh) {
    lines.push(`Duration: ${project.durationEn} / ${project.durationZh}`);
  } else if (project.durationEn) {
    lines.push(`Duration: ${project.durationEn}`);
  }
  if (project.challengeEn) lines.push(`Challenge (EN): ${project.challengeEn}`);
  if (project.challengeZh) lines.push(`Challenge (ZH): ${project.challengeZh}`);
  if (project.solutionEn) lines.push(`Solution (EN): ${project.solutionEn}`);
  if (project.solutionZh) lines.push(`Solution (ZH): ${project.solutionZh}`);

  if (project.scopes.length > 0) {
    lines.push(`Service Scope: ${project.scopes.map((s) => s.scopeEn).join(', ')}`);
  }

  if (project.externalProducts.length > 0) {
    lines.push(`Products Used: ${project.externalProducts.map((p) => p.labelEn).join(', ')}`);
  }

  if (project.imagePairs.length > 0) {
    lines.push('\nAvailable Images:');
    project.imagePairs.forEach((pair, i) => {
      if (pair.beforeImageUrl) {
        lines.push(`  Before Image ${i + 1}: ${pair.beforeImageUrl} (alt: ${pair.beforeAltTextEn || 'Before renovation'})`);
      }
      if (pair.afterImageUrl) {
        lines.push(`  After Image ${i + 1}: ${pair.afterImageUrl} (alt: ${pair.afterAltTextEn || 'After renovation'})`);
      }
    });
  }

  if (project.heroImageUrl) {
    lines.push(`Hero Image: ${project.heroImageUrl}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a bilingual blog post from a single project's data.
 */
export async function generateBlogFromProjectData(
  project: ProjectDataForBlog
): Promise<BlogGeneration> {
  const client = getOpenAIClient();
  const context = buildProjectContext(project);

  const response = await client.chat.completions.create({
    model: AI_CONFIG.modelContent,
    messages: [
      { role: 'system', content: BLOG_GENERATION_PROMPT },
      {
        role: 'user',
        content: `Generate a case study blog post from this renovation project:\n\n${context}`,
      },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensBlogGeneration,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('No response from OpenAI');
  }

  if (choice.finish_reason === 'length') {
    throw new Error(
      'AI response was truncated. The project data may be too large for processing.'
    );
  }

  const parsed = parseJsonResponse<unknown>(choice.message.content);
  return BlogGenerationSchema.parse(parsed);
}

/**
 * Generate a bilingual blog post from a site (whole-house) with all its child projects.
 */
export async function generateBlogFromSiteData(
  site: SiteDataForBlog,
  projects: ProjectDataForBlog[]
): Promise<BlogGeneration> {
  const client = getOpenAIClient();

  // #7: Build context lines without filter(Boolean) to preserve intentional structure
  const contextParts: string[] = [
    `Whole House Renovation Site: ${site.titleEn} / ${site.titleZh}`,
    `Description (EN): ${site.descriptionEn}`,
    `Description (ZH): ${site.descriptionZh}`,
  ];
  if (site.locationCity) contextParts.push(`Location: ${site.locationCity}`);
  if (site.budgetRange) contextParts.push(`Overall Budget: ${site.budgetRange}`);
  if (site.durationEn) contextParts.push(`Overall Duration: ${site.durationEn} / ${site.durationZh ?? site.durationEn}`);
  if (site.heroImageUrl) contextParts.push(`Site Hero Image: ${site.heroImageUrl}`);
  contextParts.push(`\nThis whole-house renovation includes ${projects.length} project areas:`);

  const siteContext = contextParts.join('\n');

  const projectContexts = projects.map(
    (p, i) => `--- Area ${i + 1}: ${p.titleEn} (${p.serviceType}) ---\n${buildProjectContext(p)}`
  );

  const fullContext = siteContext + '\n\n' + projectContexts.join('\n\n');

  const response = await client.chat.completions.create({
    model: AI_CONFIG.modelContent,
    messages: [
      { role: 'system', content: BLOG_GENERATION_PROMPT },
      {
        role: 'user',
        content: `Generate a comprehensive case study blog post about this whole-house renovation. Cover all project areas:\n\n${fullContext}`,
      },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensBlogGeneration,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('No response from OpenAI');
  }

  if (choice.finish_reason === 'length') {
    throw new Error(
      'AI response was truncated. The site data may be too large for processing.'
    );
  }

  const parsed = parseJsonResponse<unknown>(choice.message.content);
  return BlogGenerationSchema.parse(parsed);
}
