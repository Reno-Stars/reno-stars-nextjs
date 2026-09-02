-- Migration: project_image_pairs before_alt_text_en + before_alt_text_zh
-- Rows where before_alt_text is NULL but after_alt_text follows "After N" pattern → derive "Before N"
-- NOT APPLIED — needs human to run
-- 13 rows with clean derivable values; excluded rows where both before/after are NULL (no data to derive from)

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '161918b8-4bb4-4472-89f1-80195274c655'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '1aa17cdd-481d-4cc2-a8b5-7ed6edfdceb7'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = 'c7f0c86d-cd1b-454f-a74f-974223540404'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = 'deb62913-d242-4659-84f5-6854c656619f'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '624ce942-ff70-45e3-93fa-87d5cc5a5690'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '4a3137f1-b6c6-49a6-b09f-8966e6bf1c9c'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '5904ed07-6a71-4838-83c4-308ff127b1e5'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = 'da5aa467-4ae8-44e7-89e3-58fa030f8deb'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '6b8e2018-9b25-4fd8-8488-087ddff5c71a'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '6f1ea06d-cb51-4765-b609-882a2c67f6d0'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '4aabe80b-0631-45b4-896a-d8aefa62ef1c'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = REPLACE(after_alt_text_en, 'After ', 'Before '),
  before_alt_text_zh = REPLACE(after_alt_text_zh, '改造后', '改造前')
WHERE
  id = '57227518-03f4-43be-b451-cf6b5829a8dd'
  AND before_alt_text_en IS NULL
  AND after_alt_text_en IS NOT NULL;
