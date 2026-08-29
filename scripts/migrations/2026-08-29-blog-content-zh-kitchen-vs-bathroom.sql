-- Migration: 2026-08-29-blog-content-zh-kitchen-vs-bathroom.sql
-- Target: blog_posts.content_zh — thin placeholder (22 chars) on 'kitchen-vs-bathroom-reno-vancouver-2026'
-- Status: NOT APPLIED — needs human to run
-- Idempotent WHERE guard: only updates if content_zh is still the short placeholder

UPDATE blog_posts
SET
  content_zh = '<p>温哥华装修先厨房还是先卫生间？Reno Stars 综合考虑预算、生活方式和转售价值，助您做出明智决定。</p><p>厨房装修通常在 3 万至 8 万加元之间，卫生间装修在 1.5 万至 4 万加元之间。如果预算有限，先装修卫生间通常更划算——它对日常生活影响更大，潜在买家回报也更高。</p><p>然而，如果您经常做饭或厨房状况存在安全隐患（如电路老化、漏水），优先处理厨房可以避免更大的维修费用。Reno Stars 在 Vancouver 和 Metro Vancouver 地区拥有多年厨房和卫生间装修经验。</p><p>具体选择应基于三个因素：当前装修的状态（哪些更紧迫）、您的长期居住计划，以及 2026 年的预算结构。计划在 3 至 5 年内售房？卫生间装修的转售回报通常更明显。计划长期居住？投入厨房装修带来的日常体验提升更为持久。</p><p>查看 Reno Stars 完成的 <a href="/en/projects/kitchen-renovation-vancouver/">温哥华厨房装修案例</a> 和 <a href="/en/projects/bathroom-renovation-vancouver/">卫生间装修案例</a>，了解真实成本和效果。</p><p>Planning a kitchen, bathroom, whole-home or commercial renovation? <a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND LENGTH(content_zh) < 100;
