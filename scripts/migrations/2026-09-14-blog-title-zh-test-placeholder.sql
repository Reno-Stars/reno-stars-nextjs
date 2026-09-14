-- Migration: 2026-09-14
-- Target:  blog_posts.title_zh = 'Test ZH' placeholder on test post ae52f455
-- Trigger: DB query — SELECT id FROM blog_posts WHERE title_zh !~ '[一-鿿]' AND title_zh IS NOT NULL AND title_zh != '';
-- Status:  NOT YET APPLIED — needs human to run before 2026-09-15 tick
-- Idempotent WHERE guard prevents double-apply if run multiple times.

UPDATE blog_posts
SET
  title_zh       = '联排别墅装修共管规则 | 温哥华2026指南',
  excerpt_zh     = 'Reno Stars详解温哥华联排别墅装修的共管法规、审批流程与常见限制，帮助业主顺利推进装修项目。',
  content_zh     = '<p>联排别墅（Strata）装修涉及一套独特的审批流程，与独立屋装修有显著不同。无论您进行简单的墙面刷新还是全面的厨房改造，了解温哥华共管物业的装修规则都是成功项目的关键第一步。</p><h2>共管物业装修基本要求</h2><p>根据卑诗省《共管物业法》，联排别墅的室内装修通常需要提前获得共管物业委员会的批准。部分工程（如更换开关插座、修补墙面等）属于豁免范围，无需审批即可进行。但涉及结构改动、更换固定装置或改动管线的工程，必须提交正式申请。</p><h2>常见审批限制</h2><p>大多数共管物业对装修时间有严格限制：工作日施工通常限于上午9点至下午5点，周末和法定假日一般不允许进行噪音工程。此外，部分物业对承包商有资质要求，必须提供有效的商业保险证明方可进场施工。</p><h2>如何顺利获批</h2><p>提交装修申请时，附上详细的设计方案和材料说明可以显著提高通过率。建议提前与物业管理处沟通，了解该物业的具体规定，必要时可请专业装修顾问协助准备申请材料。</p>',
  focus_keyword_zh = '联排别墅装修',
  meta_title_zh    = '联排别墅装修共管规则 | 温哥华Reno Stars',
  meta_description_zh = '了解温哥华联排别墅共管物业装修的法规、审批流程与常见限制。Reno Stars专业团队为您提供合规指导。'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';  -- idempotent guard
