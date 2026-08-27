-- Migrate project_story_zh for projects that have project_story_en content
-- NOT APPLIED — needs human review and execution
-- Covers: 2 published projects (vancouver-wfh-glass-partition-office-conversion, returning-customer-kitchen-renovation-richmond-white-shaker)
-- These are the ONLY 2 published projects with project_story_en content.
-- All other published projects have NULL project_story_en, so no Chinese translation source exists for them yet.

BEGIN;

UPDATE projects
SET project_story_zh = '每个家庭办公室装修都会面临同样的权衡：实墙能提供专注力和隔音效果，但会破坏房间的自然光线——而自然光线正是让这个房间最初感觉良好的原因。客户两个都想要。定制的黑色框架玻璃隔断是答案——但前提是它看起来具有建筑感，而不是像临时的办公隔断。纤薄的黑色框架、全高天花板、真正的黑色五金 swing 玻璃门。正是这个"看起来不是事后才想到的"的细节让项目得以成功。'
WHERE is_published
  AND slug = 'vancouver-wfh-glass-partition-office-conversion'
  AND (project_story_zh IS NULL OR project_story_zh = '')
  AND project_story_en IS NOT NULL AND project_story_en <> '';

UPDATE projects
SET project_story_zh = '"信任循环"项目。同一个业主——我们之前为她女儿做过浴室装修——现在回来做厨房。这是承包商能收到的最强的认可。简报很短：尽量减少干扰，让他们在这期间仍能做饭，并交付与早期完成的浴室相匹配的美学。配置：台面上方的开放架子、柜下 LED 灯带营造晚间氛围、全石英岩瀑布半岛作为核心细节。'
WHERE is_published
  AND slug = 'returning-customer-kitchen-renovation-richmond-white-shaker'
  AND (project_story_zh IS NULL OR project_story_zh = '')
  AND project_story_en IS NOT NULL AND project_story_en <> '';

COMMIT;
