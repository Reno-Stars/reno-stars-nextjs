/**
 * Migration: Set excerpt_en for 22 blog posts that have NULL excerpt_en.
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-en.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-en.sql
 */
UPDATE blog_posts SET excerpt_en = 'New Westminster basement renovation costs $38,000–$120,000 in 2026. Complete guide covering permit fees, heritage-zone rules, secondary suite requirements, and waterproofing for Fraser River delta homes.' WHERE id = '02fbb003-b3d6-4ed9-8c64-302601db37b6' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock basement renovation costs $45,000–$130,000 in 2026. Complete guide covering oceanfront waterproofing, coastal permit requirements, and secondary suite potential for Semiahmoo Peninsula homes.' WHERE id = 'd9d0877e-e396-4950-9922-8402822b6f59' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster bathroom renovation costs $18,000–$55,000 in 2026. Complete guide covering City of New Westminster permits, heritage home considerations, and design trends for Queens Park and Brow of the Hill homes.' WHERE id = 'f0691cdb-80bf-469f-9201-d43b0c22c8ba' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam bathroom renovation costs $15,000–$55,000+ in 2026. Complete guide covering City of Port Coquitlam permits, strata rules, and design ideas for Citadel Heights, Hyde Creek, and Riverwood homes.' WHERE id = '3ddc8b6b-10d6-4e27-9295-5732991d77ec' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Moody bathroom renovation costs $16,000–$60,000+ in 2026. Complete guide covering District of Port Moody permits, heritage home considerations, and design ideas for Heritage Mountain townhouses and Rocky Point condos.' WHERE id = 'c15a3d9f-1d8d-453d-be8f-99e6c2ac5f5a' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Delta condo renovation costs $12,000–$45,000+ in 2026. Complete guide covering Tsawwassen and Ladner strata renovation rules and permit requirements for Scottsdale, Nordel, and Sunshine Woods condos.' WHERE id = 'c5b0ec68-78a5-4cfb-beb3-73806152bf3a' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster condo renovation costs $15,000–$50,000+ in 2026. Complete guide covering strata council approval requirements and renovation ideas for Uptown, Downtown, and Fraser River waterfront condos.' WHERE id = '7bfed8e7-2b7d-4149-98bb-86298e327775' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'North Vancouver condo renovation costs $18,000–$55,000+ in 2026. Complete guide covering District of North Vancouver permits, strata rules, and renovation ideas for Lonsdale, Lynn Valley, and Deep Cove condos.' WHERE id = '9739d7cc-5b6e-4a3d-ac10-3159e5df0967' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey condo renovation costs $12,000–$45,000+ in 2026. Complete guide covering City of Surrey permits, strata council approval requirements, and renovation ideas for Guildford, Fleetwood, and Newton condos.' WHERE id = '8fb0d159-29d6-4744-8203-7f5972eb31ed' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam home renovation costs $25,000–$150,000+ in 2026. Complete guide covering City of Port Coquitlam permits, neighbourhood considerations for Citadel and Shaughnessy Station, and renovation planning for Coquitlam-adjacent homes.' WHERE id = 'fd7f0748-f4e4-440b-8f6f-0955a4d83eca' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Burnaby pre-sale renovation ROI guide 2026: top projects for sellers in Metrotown, Brentwood, and Lougheed. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'b3fc215e-f51c-4857-9dd8-b535f9746f68' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Delta pre-sale renovation ROI guide 2026: top projects for Tsawwassen, Ladner, and North Delta sellers. Kitchen, bathroom, and curb appeal upgrades that return 150–300% of cost at sale.' WHERE id = '66e06686-e4ff-4987-a62c-918ac0dea481' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Langley pre-sale renovation ROI guide 2026: top projects for Willoughby and Langley City sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = '6db67571-7d0e-455c-a88b-4601ed53a6e1' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'New Westminster pre-sale renovation ROI guide 2026: top projects for sellers in Queens Park, Sapperton, and Brow of the Hill. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'd261406c-b23b-42af-9d83-68ca2415b478' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Coquitlam pre-sale renovation ROI guide 2026: top projects for Citadel and Port Coquitlam sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'f4d49e71-3d4d-4f9a-ae46-efd741c63c8e' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Port Moody pre-sale renovation ROI guide 2026: top projects for Heritage Mountain and Moody Centre sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'c24c8d8a-6052-42b9-bb8c-32c73abdb5df' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Richmond pre-sale renovation ROI guide 2026: top projects for Steveston, Richmond Centre, and Sea Island sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'e2200a9a-6f48-4fc5-af1d-2038fbdb1f73' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey pre-sale renovation ROI guide 2026: top projects for Fleetwood, Newton, and South Surrey sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = '02f69e00-ad87-4665-a4b0-8316d78db673' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'West Vancouver pre-sale renovation ROI guide 2026: top projects for Ambleside and British Properties sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = 'cba2639e-a408-4a0c-8543-9f81b5c5422e' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock pre-sale renovation ROI guide 2026: top projects for Semiahmoo and Ocean Park sellers. Kitchen, bathroom, and staging upgrades that return 150–300% of cost at sale.' WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'Surrey renovation permits guide 2026: complete guide to City of Surrey building permits, electrical and plumbing permits, heritage designations, and strata renovation rules for Surrey homeowners and investors.' WHERE id = '1caa85a5-3449-469c-b1fc-9c9054ec8efe' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');

UPDATE blog_posts SET excerpt_en = 'White Rock whole-house renovation costs $80,000–$350,000+ in 2026. Complete guide covering oceanfront waterproofing, full-home renovation planning, and design trends for Semiahmoo Peninsula homes.' WHERE id = '90eab35f-6c73-4e54-8fe2-3a127f0ba35c' AND (excerpt_en IS NULL OR excerpt_en = '' OR excerpt_en = ' ');
