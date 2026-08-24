/**
 * Migration: Set excerpt_en for 22 published blog posts that have NULL excerpt_en.
 * Run: pnpm db:query -f scripts/migrations/2026-08-24-blog-excerpt-en.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-24-blog-excerpt-en.sql
 */

UPDATE blog_posts SET excerpt_en = 'New Westminster basement renovation costs $38,000–$120,000+ in 2026. Complete guide covering City of New Westminster permit requirements, heritage-zone rules for Queens Park and Brow of the Hill, secondary suite potential, and Fraser River delta waterproofing for homeowners and investors.'
WHERE slug = 'basement-renovation-new-westminster-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock basement renovation costs $45,000–$130,000+ in 2026. Complete guide covering Semiahmoo Peninsula permit requirements, oceanfront and coastal waterproofing considerations, secondary suite potential, and waterfront home considerations for White Rock and South Surrey homeowners.'
WHERE slug = 'basement-renovation-white-rock-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster bathroom renovation costs $18,000–$55,000 in 2026. Complete guide covering City of New Westminster permits, heritage home considerations for Queens Park and Brow of the Hill, and design trends for bathrooms in Fraser River delta homes.'
WHERE slug = 'bathroom-renovation-new-westminster-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam bathroom renovation costs $15,000–$55,000+ in 2026. Complete guide covering City of Port Coquitlam permits, strata rules for Citadel Heights, Hyde Creek, and Riverwood, and design ideas for bathrooms in this Fraser Valley community.'
WHERE slug = 'bathroom-renovation-port-coquitlam-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Moody bathroom renovation costs $16,000–$60,000+ in 2026. Complete guide covering District of Port Moody permits, heritage home considerations for Heritage Mountain townhouses and Rocky Point condos, and design ideas for bathrooms in this Tri-Cities community.'
WHERE slug = 'bathroom-renovation-port-moody-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Delta condo renovation costs $12,000–$45,000+ in 2026. Complete guide covering Ladner, Tsawwassen, and North Delta strata renovation rules and permit requirements for Scottsdale, Nordel, and Sunshine Woods condos.'
WHERE slug = 'condo-renovation-delta-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster condo renovation costs $15,000–$50,000+ in 2026. Complete guide covering strata council approval requirements and renovation ideas for Uptown, Downtown, and Fraser River waterfront condos in New Westminster.'
WHERE slug = 'condo-renovation-new-westminster-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'North Vancouver condo renovation costs $18,000–$55,000+ in 2026. Complete guide covering District of North Vancouver permits, strata rules, and renovation ideas for Lonsdale, Lynn Valley, and Deep Cove condos.'
WHERE slug = 'condo-renovation-north-vancouver-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey condo renovation costs $12,000–$45,000+ in 2026. Complete guide covering City of Surrey permits, strata council approval requirements, and renovation ideas for Guildford, Fleetwood, and Newton condos.'
WHERE slug = 'condo-renovation-surrey-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam home renovation costs $25,000–$150,000+ in 2026. Complete guide covering City of Port Coquitlam permits, neighbourhood considerations for Citadel and Shaughnessy Station, and renovation planning for Coquitlam-adjacent homes.'
WHERE slug = 'port-coquitlam-home-renovation-guide-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Burnaby pre-sale renovation ROI guide 2026: top projects for sellers in Metrotown, Brentwood, and Lougheed. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-burnaby-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Delta pre-sale renovation ROI guide 2026: top projects for Tsawwassen, Ladner, and North Delta sellers. Kitchen, bathroom, and curb appeal upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-delta-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Langley pre-sale renovation ROI guide 2026: top projects for Willoughby and Langley City sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-langley-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster pre-sale renovation ROI guide 2026: top projects for sellers in Queens Park, Sapperton, and Brow of the Hill. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-new-westminster-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam pre-sale renovation ROI guide 2026: top projects for Citadel and Port Coquitlam sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-port-coquitlam-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Moody pre-sale renovation ROI guide 2026: top projects for Heritage Mountain and Moody Centre sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-port-moody-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Richmond pre-sale renovation ROI guide 2026: top projects for Steveston, Richmond Centre, and Sea Island sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-richmond-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey pre-sale renovation ROI guide 2026: top projects for Fleetwood, Newton, and South Surrey sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.'
WHERE slug = 'pre-sale-renovation-surrey-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'West Vancouver pre-sale renovation ROI guide 2026: top projects for Ambleside and British Properties sellers. Kitchen, bathroom, and premium staging upgrades that return 150–300% of cost at sale in this luxury market.'
WHERE slug = 'pre-sale-renovation-west-vancouver-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock pre-sale renovation ROI guide 2026: top projects for Semiahmoo and Ocean Park sellers. Kitchen, bathroom, and coastal curb appeal upgrades that return 150–300% of cost at sale in the White Rock beach market.'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey renovation permits guide 2026: complete guide to City of Surrey building permits, electrical and plumbing permits, heritage designations, and strata renovation rules for Surrey homeowners and investors.'
WHERE slug = 'surrey-renovation-permits-guide-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock whole-house renovation costs $80,000–$350,000+ in 2026. Complete guide covering oceanfront waterproofing, full-home renovation planning, and design trends for Semiahmoo Peninsula homes.'
WHERE slug = 'whole-house-renovation-white-rock-2026'
  AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');
