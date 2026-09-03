-- Migration: project_sites.duration_zh from duration_en
-- NOT APPLIED — needs human review and execution
-- Translates English duration patterns to Chinese:
--   "weeks" → "周", "months" → "个月", "days" → "天"
-- Only rows where duration_en is set but duration_zh is NULL are touched.
UPDATE project_sites
SET
  duration_zh = CASE
    WHEN duration_en ~* 'month'  THEN regexp_replace(duration_en, 'month[s]?', '个月', 'i')
    WHEN duration_en ~* 'week'   THEN regexp_replace(duration_en, 'week[s]?', '周', 'i')
    WHEN duration_en ~* 'day'    THEN regexp_replace(duration_en, 'day[s]?', '天', 'i')
    ELSE duration_en
  END
WHERE is_published = true
  AND duration_en IS NOT NULL
  AND duration_en != ''
  AND (duration_zh IS NULL OR duration_zh = '');
