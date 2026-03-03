import { z } from 'zod';
import { getOpenAIClient, parseJsonResponse, AI_CONFIG } from './openai';
import type { ProjectDataForBlog, SiteDataForBlog } from './blog-generator';

// ============================================================================
// Types
// ============================================================================

export interface BlogDataForSocialPost {
  titleEn: string;
  titleZh: string;
  excerptEn: string | null;
  excerptZh: string | null;
  contentEn: string;
  contentZh: string;
  featuredImageUrl: string | null;
}

// ============================================================================
// Zod schema for AI response
// ============================================================================

const SocialPostGenerationSchema = z.object({
  titleEn: z.string().min(1),
  titleZh: z.string().min(1),
  instagramCaptionEn: z.string().min(1),
  instagramCaptionZh: z.string().min(1),
  instagramHashtagsEn: z.string().min(1),
  instagramHashtagsZh: z.string().min(1),
  facebookCaptionEn: z.string().min(1),
  facebookCaptionZh: z.string().min(1),
  facebookHashtagsEn: z.string().min(1),
  facebookHashtagsZh: z.string().min(1),
  xiaohongshuCaptionZh: z.string().min(1),
  xiaohongshuCaptionEn: z.string().min(1),
  xiaohongshuTopicTagsZh: z.string().min(1),
});

export type SocialPostGeneration = z.infer<typeof SocialPostGenerationSchema>;

// ============================================================================
// System prompt
// ============================================================================

const SOCIAL_POST_GENERATION_PROMPT = `You are a bilingual social media content creator for Reno Stars, a renovation company in Vancouver, BC.

Generate social media content for 3 platforms simultaneously from the provided renovation content.

PLATFORM RULES:

**Instagram:**
- Caption: max 2200 characters, engaging visual storytelling
- Up to 30 hashtags (mix of broad + niche renovation hashtags)
- Emoji-rich, visual CTA ("Link in bio", "Save for inspiration")
- Break text into short paragraphs with line breaks
- Include location mentions (Vancouver, BC)

**Facebook:**
- Caption: narrative, professional tone, link-ready text
- 3-5 relevant hashtags only
- Longer form storytelling, include project details
- End with a call-to-action (contact us, visit our showroom)

**Xiaohongshu (小红书):**
- Caption: Chinese-first, conversational, heavy emojis (🏠✨🔨💡)
- Topic tags in format: #装修# #温哥华装修# (Chinese topic tags with # on both sides)
- Listicle/tip format works well (e.g., "5 things we learned...")
- Personal, sharing-oriented tone ("分享我们的...")
- Include pricing/budget info if available (Chinese users value transparency)

CRITICAL REQUIREMENTS:
1. All Chinese content MUST be written entirely in Chinese characters
2. Return ONLY valid JSON, no markdown code blocks
3. titleEn/titleZh are campaign labels (short, 5-10 words)
4. Instagram captions should feel native to Instagram
5. Facebook captions should feel native to Facebook
6. Xiaohongshu content should feel native to 小红书 (not a translation)

Response format:
{
  "titleEn": "Campaign title in English",
  "titleZh": "活动标题中文",
  "instagramCaptionEn": "English IG caption with emojis...",
  "instagramCaptionZh": "中文IG文案...",
  "instagramHashtagsEn": "#renovation #vancouver #beforeandafter ...",
  "instagramHashtagsZh": "#装修 #温哥华 #改造前后 ...",
  "facebookCaptionEn": "English Facebook post...",
  "facebookCaptionZh": "中文Facebook帖子...",
  "facebookHashtagsEn": "#VancouverRenovation #HomeTransformation",
  "facebookHashtagsZh": "#温哥华装修 #家居改造",
  "xiaohongshuCaptionZh": "🏠 分享我们最新的装修案例...",
  "xiaohongshuCaptionEn": "English version of XHS post...",
  "xiaohongshuTopicTagsZh": "#装修# #温哥华装修# #厨房改造#"
}`;

// ============================================================================
// Helpers
// ============================================================================

function buildBlogContext(blog: BlogDataForSocialPost): string {
  const lines: string[] = [
    `Blog Post: ${blog.titleEn} / ${blog.titleZh}`,
  ];

  if (blog.excerptEn) lines.push(`Excerpt (EN): ${blog.excerptEn}`);
  if (blog.excerptZh) lines.push(`Excerpt (ZH): ${blog.excerptZh}`);

  // Include first 500 chars of content for context
  if (blog.contentEn) {
    const stripped = blog.contentEn.replace(/<[^>]*>/g, '').slice(0, 500);
    lines.push(`Content Preview (EN): ${stripped}`);
  }
  if (blog.contentZh) {
    const stripped = blog.contentZh.replace(/<[^>]*>/g, '').slice(0, 500);
    lines.push(`Content Preview (ZH): ${stripped}`);
  }

  if (blog.featuredImageUrl) lines.push(`Featured Image: ${blog.featuredImageUrl}`);

  return lines.join('\n');
}

function buildProjectContext(project: ProjectDataForBlog): string {
  const lines: string[] = [
    `Project: ${project.titleEn} / ${project.titleZh}`,
    `Service Type: ${project.serviceType}`,
    `Description (EN): ${project.descriptionEn}`,
    `Description (ZH): ${project.descriptionZh}`,
  ];

  if (project.locationCity) lines.push(`Location: ${project.locationCity}`);
  if (project.budgetRange) lines.push(`Budget: ${project.budgetRange}`);
  if (project.durationEn) lines.push(`Duration: ${project.durationEn}`);
  if (project.challengeEn) lines.push(`Challenge: ${project.challengeEn}`);
  if (project.solutionEn) lines.push(`Solution: ${project.solutionEn}`);

  if (project.scopes.length > 0) {
    lines.push(`Service Scope: ${project.scopes.map((s) => s.scopeEn).join(', ')}`);
  }

  if (project.imagePairs.length > 0) {
    lines.push(`Has ${project.imagePairs.length} before/after image pairs`);
  }

  return lines.join('\n');
}

function buildSiteContext(site: SiteDataForBlog, projects: ProjectDataForBlog[]): string {
  const lines: string[] = [
    `Whole House Renovation: ${site.titleEn} / ${site.titleZh}`,
    `Description (EN): ${site.descriptionEn}`,
    `Description (ZH): ${site.descriptionZh}`,
  ];

  if (site.locationCity) lines.push(`Location: ${site.locationCity}`);
  if (site.budgetRange) lines.push(`Overall Budget: ${site.budgetRange}`);
  if (site.durationEn) lines.push(`Overall Duration: ${site.durationEn}`);

  if (projects.length > 0) {
    lines.push(`\nIncludes ${projects.length} project areas:`);
    for (const p of projects) {
      lines.push(`- ${p.titleEn} (${p.serviceType})`);
    }
  }

  return lines.join('\n');
}

async function callOpenAI(context: string, sourceLabel: string): Promise<SocialPostGeneration> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: AI_CONFIG.modelContent,
    messages: [
      { role: 'system', content: SOCIAL_POST_GENERATION_PROMPT },
      {
        role: 'user',
        content: `Generate social media posts for all 3 platforms from this ${sourceLabel}:\n\n${context}`,
      },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokensSocialPost,
  });

  const choice = response.choices[0];
  if (!choice?.message?.content) {
    throw new Error('No response from OpenAI');
  }

  if (choice.finish_reason === 'length') {
    throw new Error('AI response was truncated. The content may be too long.');
  }

  const parsed = parseJsonResponse<unknown>(choice.message.content);
  return SocialPostGenerationSchema.parse(parsed);
}

// ============================================================================
// Public API
// ============================================================================

/** Generate social media posts from a blog post's data. */
export async function generateSocialPostsFromBlog(
  blog: BlogDataForSocialPost
): Promise<SocialPostGeneration> {
  const context = buildBlogContext(blog);
  return callOpenAI(context, 'blog post');
}

/** Generate social media posts from a project's data. */
export async function generateSocialPostsFromProject(
  project: ProjectDataForBlog
): Promise<SocialPostGeneration> {
  const context = buildProjectContext(project);
  return callOpenAI(context, 'renovation project');
}

/** Generate social media posts from a site (whole-house) with all its child projects. */
export async function generateSocialPostsFromSite(
  site: SiteDataForBlog,
  projects: ProjectDataForBlog[]
): Promise<SocialPostGeneration> {
  const context = buildSiteContext(site, projects);
  return callOpenAI(context, 'whole-house renovation');
}
