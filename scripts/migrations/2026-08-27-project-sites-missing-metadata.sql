-- Migration: project_sites missing metadata for space_type_en, duration_en, seo_keywords_en
-- NOT APPLIED — needs human to review and run against live database
-- Rows covered: richmond-whole-house-renovation-3, surrey-whole-house-renovation, coquitlam-whole-house-renovation,
--               richmond-whole-house-renovation-2, richmond-whole-house-renovation, richmond-whole-house-renovation-three-bathrooms,
--               vancouver-wfh-glass-partition-office (7 rows with NULL space_type_en)

UPDATE project_sites
SET
    space_type_en = CASE slug
        WHEN 'richmond-whole-house-renovation-3'              THEN 'House'
        WHEN 'surrey-whole-house-renovation'                 THEN 'House'
        WHEN 'coquitlam-whole-house-renovation'              THEN 'House'
        WHEN 'richmond-whole-house-renovation-2'            THEN 'House'
        WHEN 'richmond-whole-house-renovation'               THEN 'House'
        WHEN 'richmond-whole-house-renovation-three-bathrooms' THEN 'House'
        WHEN 'vancouver-wfh-glass-partition-office'          THEN 'Home Office'
        ELSE space_type_en
    END,
    duration_en = CASE
        WHEN slug = 'richmond-whole-house-renovation-three-bathrooms' THEN '8-10 weeks'
        WHEN slug = 'vancouver-wfh-glass-partition-office'           THEN '1 week'
        ELSE duration_en
    END,
    seo_keywords_en = CASE
        WHEN slug = 'richmond-whole-house-renovation-three-bathrooms'
            THEN 'whole house renovation, Richmond renovation, bathroom remodel, flooring'
        WHEN slug = 'vancouver-wfh-glass-partition-office'
            THEN 'home office, WFH, glass partition, Vancouver renovation'
        ELSE seo_keywords_en
    END
WHERE slug IN (
    'richmond-whole-house-renovation-3',
    'surrey-whole-house-renovation',
    'coquitlam-whole-house-renovation',
    'richmond-whole-house-renovation-2',
    'richmond-whole-house-renovation',
    'richmond-whole-house-renovation-three-bathrooms',
    'vancouver-wfh-glass-partition-office'
);
