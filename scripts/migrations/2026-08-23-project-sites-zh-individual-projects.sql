-- Migration: project_sites zh fields for individual-projects
-- Row: id=64f0f111-4920-434f-ab7e-0c2c411e6633, slug=individual-projects
-- Note: title_zh="独立项目" and description_zh="独立装修项目的容器。" already exist — these fill the remaining NULL zh fields
-- NOT APPLIED — needs human to run

UPDATE project_sites
SET
  excerpt_zh = '浏览聚星装修在大温哥华地区完成的独立装修项目案例。',
  focus_keyword_zh = '温哥华独立装修项目',
  seo_keywords_zh = '温哥华独立项目,装修案例,温哥华装修,独立项目',
  space_type_zh = '独立项目',
  badge_zh = '独立项目',
  meta_title_zh = '独立项目 | 聚星装修',
  meta_description_zh = '查看聚星装修在大温哥华地区完成的独立装修项目案例，包括厨房、浴室、全屋装修等各类独立项目。'
WHERE
  slug = 'individual-projects'
  AND (
    excerpt_zh IS NULL
    OR focus_keyword_zh IS NULL
    OR seo_keywords_zh IS NULL
    OR space_type_zh IS NULL
    OR badge_zh IS NULL
    OR meta_title_zh IS NULL
    OR meta_description_zh IS NULL
  );
