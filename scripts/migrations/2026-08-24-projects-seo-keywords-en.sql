-- NOT APPLIED: needs human to run against production DB
-- Adds seo_keywords_en for 10 published projects missing it

BEGIN;

UPDATE projects SET seo_keywords_en = 'coquitlam kitchen renovation, quartz island countertop, kitchen reno coquitlam bc, kitchen renovation coquitlam'
WHERE slug = 'coquitlam-kitchen-renovation-quartz-island' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'north vancouver bathroom renovation, herringbone tile bathroom, bathroom reno north vancouver, north van bathroom remodel'
WHERE slug = 'north-vancouver-bathroom-renovation-herringbone-tile' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'vancouver house renovation, kitchen bathroom renovation vancouver, whole house renovation vancouver, vancouver home renovation'
WHERE slug = 'vancouver-house-renovation-kitchen-and-bathrooms' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'richmond condo flooring, flooring renovation richmond bc, condo flooring upgrade, richmond condo renovation'
WHERE slug = 'richmond-condo-flooring-renovation' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'richmond house renovation, kitchen bathroom flooring reno, whole home renovation richmond, house renovation richmond bc'
WHERE slug = 'richmond-house-renovation-kitchen-bathrooms-flooring' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'delta kitchen renovation, apron sink kitchen, quartz countertop delta bc, kitchen renovation delta'
WHERE slug = 'delta-kitchen-renovation-apron-sink-quartz' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'richmond whole home renovation, marble kitchen richmond, complete home renovation richmond bc, whole house reno richmond'
WHERE slug = 'richmond-whole-home-renovation-marble-kitchen' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'hallway bathroom renovation richmond, small bathroom reno richmond, hallway bath renovation bc, narrow bathroom renovation'
WHERE slug = 'hallway-bathroom-renovation-richmond' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'powder room renovation richmond, half bath reno richmond bc, powder room remodel, small bathroom renovation richmond'
WHERE slug = 'powder-room-renovation-richmond' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE projects SET seo_keywords_en = 'ensuite bathroom renovation richmond, master bath renovation richmond bc, ensuite remodels, luxury bathroom renovation richmond'
WHERE slug = 'ensuite-bathroom-renovation-richmond' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
