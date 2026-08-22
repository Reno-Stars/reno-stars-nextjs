/**
 * Migration: Set excerpt_zh for 15 blog posts that have English source but no Chinese.
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh.sql
 */

UPDATE blog_posts SET excerpt_zh = '本拿比是Metro Vancouver人口最密集的城市之一，也是最活躍的裝修市場之一。Metrotown和Brentwood近年經歷' WHERE id = '44ce6c72-bdff-4b15-956f-091b4a483aaf' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'North Vancouver是Metro Vancouver最受青睞的裝修市場之一 — 優越景觀、便利山地資源、強勁轉售價值，豐富住宅選擇' WHERE id = 'bd3d0048-474b-4a27-bf1b-e1662e4ced91' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '高貴林是Metro Vancouver最活躍的裝修市場之一 — 一個對比鮮明的城市，2018年建成的Burke Mountain鎮屋與數公里' WHERE id = '746a5a1e-f204-4461-80c5-07f54f2797ce' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '素里是Metro Vancouver最大的城市 — 近60萬居民，城市面貌多元，從Newton的1980年代普通住宅到豪華莊園' WHERE id = 'bad6eb5a-d9f1-4e89-8754-5cc200947eb7' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '2026年溫哥華裝修：業主面對的是一個匯聚百年住宅的城市 — Kitsilano的戰前工匠屋、1960年代' WHERE id = 'ff42b7bf-b12c-4f32-83ba-4f63f664b80e' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '列治文是Reno Stars的根據地 — 我們的陳列室位於21300 Gordon Way, Unit 188, Richmond BC。我們在列治文完成過數百個裝修項目，涵蓋每一' WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '白石鎮是Metro Vancouver最具特色的裝修市場之一 — 也是最具挑戰性的。海濱位置帶來的' WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'Maple Ridge預售屋裝修：Silver Valley、Albion及Haney賣家最高回報項目。上市前廚房、浴室及地下室改造。Poly-B管道更換建議。免費報價。' WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'Delta是Metro Vancouver地理最多元化的城市 — 三個截然不同的社區，各有不同住宅類型、不同裝修' WHERE id = 'fe6c5026-02df-4dd5-b21f-01ae46358656' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '北溫預售屋裝修：Lynn Valley、Lonsdale及Deep Cove賣家最高回報項目。上市前廚房、浴室及地下室改造。48小時內免費報價。' WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'New Westminster — 不列顛哥倫比亞省原首都城市 — 提供Metro Vancouver最多元的裝修市場。Queen''s Park的維多利亞' WHERE id = 'ae3b018b-2452-460c-b2be-6f0295ce201a' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = '西溫是Metro Vancouver最頂級的裝修市場。從Ambleside的傳統特色住宅到Dundarave的海濱物業，' WHERE id = '27c9242e-44c6-4744-9122-59f830904950' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'Port Moody在Metro Vancouver裝修市場中佔據最獨特的位置。它同時是該地區最環保的' WHERE id = 'f576d97c-86d7-4663-ba74-ff56ac49ca2a' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'Langley是Metro Vancouver最強勁的裝修市場之一 — 不是因為名氣，而是因為成交量、價值和時機。Langley Township的' WHERE id = 'fe32a970-c27e-468e-9841-34f22a7e60fe' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

UPDATE blog_posts SET excerpt_zh = 'Maple Ridge提供Metro Vancouver周邊城市無法比擬的條件：更大的地塊、更低的土地成本，住宅類型從' WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');
