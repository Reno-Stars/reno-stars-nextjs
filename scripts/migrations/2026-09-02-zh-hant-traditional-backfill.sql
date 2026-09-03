-- Migration: NOT APPLIED — needs human to run
--   pnpm db:query -f scripts/migrations/2026-09-02-zh-hant-traditional-backfill.sql
--
-- /zh-Hant/ was serving SIMPLIFIED Chinese in 13 rendered text nodes.
--
-- MECHANISM (this is a DATA defect, not a code one): `zh-Hant` has no dedicated
-- column. i18n/config.ts declares it `dbColumn: false, fallback: ['zh']`, so
-- buildLocalized() only exposes a zh-Hant value when the row's `localizations`
-- jsonb carries a `<field>ZhHant` key; when the key is absent pickLocale() walks
-- the fallback chain and returns the SIMPLIFIED `<field>_zh` column. The page
-- still declares <html lang="zh-Hant">, so the markup asserts Traditional while
-- the text is Simplified — which is what Semrush flagged as an hreflang language
-- mismatch. The fallback itself is deliberate and stays; what is missing is the
-- Traditional data.
--
-- Scope: every row where a `_zh` value exists but its ZhHant key does not —
-- 10 project titles, 6 project categories, 20 blog titles (36 rows, 21 distinct
-- strings) — plus ONE row whose ZhHant key exists but was stored half-converted.
--
-- Conversion: OpenCC s2t, then 露臺 -> 露台. Both are valid Traditional; the
-- locale serves HK/TW readers (i18n/config.ts:9) and the site's own zh-Hant
-- copy prefers 台 (23 occurrences vs 15). 檯 is kept for 石英檯面 (countertop)
-- and 後 for 後院 (backyard), which are correct in both conventions.
--
-- Every statement writes ONE column and is guarded on exactly what it writes
-- (tests/unit/db/migration-guards.test.ts). The guard here is the ZhHant KEY
-- rather than the column: `localizations` as a whole is never null-guardable,
-- so re-running is safe because a row that already has the key is skipped.

BEGIN;

-- ---------- blog_posts ----------
-- 42d3bcb6-a997-4259-b44d-cbcbbc214b57  测试
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '測試')
WHERE id = '42d3bcb6-a997-4259-b44d-cbcbbc214b57'
  AND (localizations->>'titleZhHant') IS NULL;

-- 7278c82a-85f6-460d-a2da-e8244d22ad97  测试简单帖子2026
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '測試簡單帖子2026')
WHERE id = '7278c82a-85f6-460d-a2da-e8244d22ad97'
  AND (localizations->>'titleZhHant') IS NULL;

-- fbfe62bc-8887-44a0-a6a0-eef892a1e986  温哥华厨房装修费用指南（2026年）
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華廚房裝修費用指南（2026年）')
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (localizations->>'titleZhHant') IS NULL;

-- 6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND (localizations->>'titleZhHant') IS NULL;

-- 6b86f73f-a05d-40a3-a456-5c7d73bf87bb  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
  AND (localizations->>'titleZhHant') IS NULL;

-- 081258dc-0351-4d9d-a3a0-e2cd2a424dd2  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
  AND (localizations->>'titleZhHant') IS NULL;

-- 92ef3796-7d41-4d6c-bb09-520340f6d3b6  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '92ef3796-7d41-4d6c-bb09-520340f6d3b6'
  AND (localizations->>'titleZhHant') IS NULL;

-- 5509a194-8509-4e6d-a201-ae271ab53bde  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde'
  AND (localizations->>'titleZhHant') IS NULL;

-- 48656047-631c-4d86-afc9-722f3dfdda88  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '48656047-631c-4d86-afc9-722f3dfdda88'
  AND (localizations->>'titleZhHant') IS NULL;

-- 3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966'
  AND (localizations->>'titleZhHant') IS NULL;

-- 28386e2c-c726-41ce-95ac-e033e16d8027  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027'
  AND (localizations->>'titleZhHant') IS NULL;

-- fd509df0-d641-4154-96e2-345e7cc71add  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = 'fd509df0-d641-4154-96e2-345e7cc71add'
  AND (localizations->>'titleZhHant') IS NULL;

-- 247e6fde-08dc-4285-b5c7-bbe236069047  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND (localizations->>'titleZhHant') IS NULL;

-- dd064abc-db01-4588-a7a7-9738872b2ea7  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7'
  AND (localizations->>'titleZhHant') IS NULL;

-- c7eabaf3-4afb-4cfa-980a-f416d450d0d3  温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華戶外空間裝修完整指南 -- 露台、甲板、後院改造與許可申請 (2026)')
WHERE id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND (localizations->>'titleZhHant') IS NULL;

-- 094434be-7021-470b-a0c5-13fc680bd92d  温哥华热泵安装（2026年）：费用、BC Hydro 补贴与真实工期
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華熱泵安裝（2026年）：費用、BC Hydro 補貼與真實工期')
WHERE id = '094434be-7021-470b-a0c5-13fc680bd92d'
  AND (localizations->>'titleZhHant') IS NULL;

-- 71c9b551-2fd2-4bba-968e-3a7c9b0200f6  温哥华装修：先装修厨房还是卫生间？
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華裝修：先裝修廚房還是衛生間？')
WHERE id = '71c9b551-2fd2-4bba-968e-3a7c9b0200f6'
  AND (localizations->>'titleZhHant') IS NULL;

-- 011a6d63-0121-4f6b-a536-43c247e18f06  温哥华装修：先装修厨房还是卫生间？
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華裝修：先裝修廚房還是衛生間？')
WHERE id = '011a6d63-0121-4f6b-a536-43c247e18f06'
  AND (localizations->>'titleZhHant') IS NULL;

-- c88b22eb-13c7-45f6-9597-4a6852742c54  温哥华装修：先装修厨房还是卫生间？2026年完整对比指南
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華裝修：先裝修廚房還是衛生間？2026年完整對比指南')
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND (localizations->>'titleZhHant') IS NULL;

-- ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f  温哥华装修：先装修厨房还是卫生间？2026年完整对比指南
UPDATE blog_posts
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華裝修：先裝修廚房還是衛生間？2026年完整對比指南')
WHERE id = 'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f'
  AND (localizations->>'titleZhHant') IS NULL;

-- ---------- projects ----------
-- 25febb78-bca5-4b0a-bdfb-d08df7bfbbab  厨房翻新
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '廚房翻新')
WHERE id = '25febb78-bca5-4b0a-bdfb-d08df7bfbbab'
  AND (localizations->>'categoryZhHant') IS NULL;

-- 70047904-0a5b-4cfa-8b3e-e2afe4a04114  商业装修
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '商業裝修')
WHERE id = '70047904-0a5b-4cfa-8b3e-e2afe4a04114'
  AND (localizations->>'categoryZhHant') IS NULL;

-- 47b532fc-74a5-4048-a038-d983091032ab  居家办公室改造
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '居家辦公室改造')
WHERE id = '47b532fc-74a5-4048-a038-d983091032ab'
  AND (localizations->>'categoryZhHant') IS NULL;

-- 9063e628-abf9-411a-a7a4-2ddc179c1689  浴室装修
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '浴室裝修')
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND (localizations->>'categoryZhHant') IS NULL;

-- 018eda65-401d-4ec3-84cc-7793597e75c7  浴室装修
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '浴室裝修')
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND (localizations->>'categoryZhHant') IS NULL;

-- a0690f3a-af1f-4cd1-a2b6-8920908801ea  浴室装修
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('categoryZhHant', '浴室裝修')
WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
  AND (localizations->>'categoryZhHant') IS NULL;

-- 25febb78-bca5-4b0a-bdfb-d08df7bfbbab  Richmond老客户回购：白色shaker厨房翻新 — 石英台面 + 柜下灯带
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', 'Richmond老客戶回購：白色shaker廚房翻新 — 石英檯面 + 櫃下燈帶')
WHERE id = '25febb78-bca5-4b0a-bdfb-d08df7bfbbab'
  AND (localizations->>'titleZhHant') IS NULL;

-- 7c9a9237-4f64-480b-a2fa-2d14e9faa99f  三角洲全屋装修：厨房与两间浴室
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '三角洲全屋裝修：廚房與兩間浴室')
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (localizations->>'titleZhHant') IS NULL;

-- c8a66604-00ed-4307-8b28-b95257eaa249  列治文全屋装修：仿大理石厨房
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '列治文全屋裝修：仿大理石廚房')
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND (localizations->>'titleZhHant') IS NULL;

-- 331f03b3-624e-4ddf-9b38-c8768d3d1932  列治文全屋装修：厨房、卫浴与全屋地板
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '列治文全屋裝修：廚房、衛浴與全屋地板')
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (localizations->>'titleZhHant') IS NULL;

-- 3ef5531b-cfb9-454d-9cd2-90887b3775f0  列治文公寓全屋地板更换
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '列治文公寓全屋地板更換')
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND (localizations->>'titleZhHant') IS NULL;

-- 0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb  北温哥华浴室装修：黑色人字拼瓷砖
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '北溫哥華浴室裝修：黑色人字拼瓷磚')
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND (localizations->>'titleZhHant') IS NULL;

-- 47b532fc-74a5-4048-a038-d983091032ab  居家办公室改造 — 黑框玻璃隔断 + 双开门
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '居家辦公室改造 — 黑框玻璃隔斷 + 雙開門')
WHERE id = '47b532fc-74a5-4048-a038-d983091032ab'
  AND (localizations->>'titleZhHant') IS NULL;

-- 70047904-0a5b-4cfa-8b3e-e2afe4a04114  本拿比牙医诊所翻新
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '本拿比牙醫診所翻新')
WHERE id = '70047904-0a5b-4cfa-8b3e-e2afe4a04114'
  AND (localizations->>'titleZhHant') IS NULL;

-- 9cbc6ccf-bc07-4c2f-a867-c57ab4218728  温哥华全屋装修：厨房、卫浴与全屋地板
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '溫哥華全屋裝修：廚房、衛浴與全屋地板')
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND (localizations->>'titleZhHant') IS NULL;

-- 838f1ee4-beaa-42e7-bca5-73c810422d76  高贵林厨房装修：瀑布式石英石中岛
UPDATE projects
SET localizations = COALESCE(localizations, '{}'::jsonb) || jsonb_build_object('titleZhHant', '高貴林廚房裝修：瀑布式石英石中島')
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (localizations->>'titleZhHant') IS NULL;

-- ---------- services: key EXISTS but was stored half-converted ----------
-- 8ced0acf-88e2-483f-9e92-0a625502093c (accessible-bathroom)
-- Guarded on the exact current value, NOT on IS NULL: the key is present, so an
-- IS NULL guard would match 0 rows and silently no-op.
UPDATE services
SET localizations = localizations || jsonb_build_object('descriptionZhHant', '老化浴室翻新——無門檻淋浴、扶手、舒適高度的固定裝置、防燙閥門、防滑地板。符合 CSA B651，職能治療師協調。我們幫助 HAFI 撥款文書工作。')
WHERE id = '8ced0acf-88e2-483f-9e92-0a625502093c'
  AND localizations->>'descriptionZhHant' = '老化浴室翻新——无门槛淋浴、扶手、舒适高度的固定装置、防烫阀门、防滑地板。符合 CSA B651，職能治療師協調。我們幫助 HAFI 撥款文書工作。';

COMMIT;
