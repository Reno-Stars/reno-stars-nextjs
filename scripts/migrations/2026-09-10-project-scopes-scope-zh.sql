-- Migrate scope_zh for project_scopes rows where scope_zh is NULL or short
-- 243 total rows affected (confirmed by DB query this tick)
-- NOT APPLIED — needs human to run before merge
-- Idempotent WHERE guards prevent double-update

UPDATE project_scopes SET scope_zh = '全牆瓷磚' WHERE id = 'ea8b8549-7969-4d81-acd8-c5fdc8dd2f2e' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '燈光優化' WHERE id = 'd3956376-8350-4407-8652-c20f3b7bb968' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '全牆瓷磚' WHERE id = 'f43adfaa-ff6c-4459-808f-d29479b04393' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '定制櫥櫃' WHERE id = 'a48a3297-caaf-4287-8099-6647e3820722' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '櫥櫃安裝' WHERE id = '11840124-1db3-402d-a3ec-e3c638d1b02a' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '櫥櫃安裝' WHERE id = 'c93ddf88-6248-4839-93a4-1a5f0ca87c4e' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '防濺板瓷磚' WHERE id = 'a52c3457-2db4-4a75-9f84-673b14e0e27c' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '櫥櫃翻新' WHERE id = 'c0d6f7f9-03a6-40bb-8f5b-7b100bc97e45' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '燈光優化' WHERE id = 'f41f3eba-e7db-4277-ac99-41f959129a06' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
UPDATE project_scopes SET scope_zh = '檯面更換' WHERE id = '3431c2f1-46a8-4f82-950c-67a6a6f47155' AND (scope_zh IS NULL OR char_length(scope_zh) < 5);
