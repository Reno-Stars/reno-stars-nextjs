-- Migration: Replace orphaned English "heater" fragment in blog post c7eabaf3 outdoor-living-space-renovation-vancouver-2026
-- Reason: The "heater" fragment is orphaned between two complete Chinese clauses.
--   Original: "...天然气管道，用于户外厨房或heater — 将可用季节..."
--   The radiant-heater context was already translated earlier as
--   "天然气红外线加热器（$800到$2,500安装）".
-- Fix: Remove the orphan fragment, keep the comma and em-dash that link the clauses.
-- NOT applied — human must run this migration.
-- IDs covered: c7eabaf3 (outdoor-living-space-renovation-vancouver-2026)

UPDATE blog_posts
SET
  content_zh = REPLACE(
    content_zh,
    '配备集成LED照明和天然气管道，用于户外厨房或heater — 将可用季节在夏季首尾各延长六至八周。',
    '配备集成LED照明和天然气管道 — 将可用季节在夏季首尾各延长六至八周。'
  )
WHERE
  id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND content_zh LIKE '%heater%';
