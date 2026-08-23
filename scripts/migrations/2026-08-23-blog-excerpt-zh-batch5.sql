/**
 * Migration: Set excerpt_zh for 2 pre-sale renovation blog posts (batch 5 — from excerpt_en translation)
 * Scope: published posts with excerpt_en AND missing excerpt_zh, NOT covered by prior migrations
 * NOT APPLIED — run manually after infra gate:
 *   pnpm db:query -f scripts/migrations/2026-08-23-blog-excerpt-zh-batch5.sql
 *
 * IDs excluded (already covered by prior migrations):
 *   02f69e00, 02fbb003, 1caa85a5, 27c9242e, 32736ae2, 34e43ef8,
 *   44ce6c72, 5bb4fbd4, 6567c57b, 66e06686, 89bce1b4, 8fb0d159,
 *   9cbc6ccf, bd3d0048, b3fc215e, c15a3d9f, c24c8d8a, c5b0ec68,
 *   cba2639e, cfdc320d, d261406c, d9d0877e, e2200a9a, f0691cdb,
 *   f4d49e71, f576d97c, fd7f0748, fe32a970, fe6c5026, ff42b7bf
 */

/* Pre-Sale Renovation Maple Ridge BC 2026 */
UPDATE blog_posts SET excerpt_zh = '枫树岭预售翻新：在Silver Valley、Albion和Haney等社区，通过厨房和浴室翻新实现最高投资回报率。2026年市场洞察。' WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Pre-Sale Renovation North Vancouver BC 2026 */
UPDATE blog_posts SET excerpt_zh = '北温哥华预售翻新：在Lynn Valley、Lonsdale和Seymour等社区，通过重点翻新项目实现最高投资回报率。2026年市场洞察。' WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11' AND (excerpt_zh IS NULL OR excerpt_zh = '');
