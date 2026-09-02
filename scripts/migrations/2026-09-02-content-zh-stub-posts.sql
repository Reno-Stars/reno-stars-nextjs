-- Migration: 2026-09-02-content-zh-stub-posts.sql
-- Posts with published content but stub content_zh (< 200 chars)
-- NOT APPLIED — needs human review and run
-- 6 posts: kitchen-vs-bathroom-reno-vancouver-2026 (22 chars), adu-renovation-vancouver-2026 (148),
-- split-level-home-renovation-burnaby-coquitlam-2026 (180), vancouver-infill-development-cost-2026 (182),
-- heritage-home-renovation-vancouver-2026 (188), mid-century-rancher-renovation-vancouver-2026 (193)

BEGIN;

-- 1. kitchen-vs-bathroom-reno-vancouver-2026
UPDATE blog_posts
SET content_zh = '<p>温哥华装修先厨房还是先卫生间？本文对比两大项目的预算、影响、时间和决策框架，附Reno Stars真实案例，助您做出最佳选择。</p>'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

-- 2. adu-renovation-vancouver-2026
UPDATE blog_posts
SET content_zh = '<p>ADU（附属住宅单元）是在温哥华主要住宅旁边或内部建造的独立居住空间。在卑诗省，后巷屋、花园套房和 basement suite 都是 ADU 的常见形式。Reno Stars 在大温地区已完成多个 ADU 装修项目。</p><h2>温哥华 ADU 装修成本（2026 年）</h2><p>根据 Reno Stars 实际项目数据，温哥华地区 ADU 装修成本通常在 $80,000 至 $250,000 之间。具体取决于：</p><ul><li>ADU 类型（后巷屋成本最高）</li><li>建筑面积和层数</li><li>是否需要新建结构或仅装修现有空间</li><li>厨房和卫生间设施标准</li></ul><h2>ADU 许可要求</h2><p>温哥华市于 2023 年启动了 Secondary Suite 鼓励政策，许多独立屋地块现在允许建造后巷屋或地下室套房。许可审批通常需要 6–12 周，建商需持有有效的卑诗省建筑商执照。Reno Stars 可协助您完成许可申请流程。</p><h2>ADU 增加物业价值</h2><p>在温哥华，一个合法的 ADU 可将物业价值提升 $200,000 至 $400,000，同时提供稳定的租金收入来源。许多业主选择先装修主屋，再逐步完成 ADU 装修以控制现金流。计划 ADU 装修？<a href="/zh/contact/">联系 Reno Stars 获取免费报价</a>。</p>'
WHERE slug = 'adu-renovation-vancouver-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

-- 3. split-level-home-renovation-burnaby-coquitlam-2026
UPDATE blog_posts
SET content_zh = '<p>错层式住宅（Split-Level）是 1960–1980 年代在 Burnaby、Coquitlam 及大温地区广泛建造的住宅类型。其特点是不同楼层之间通过半层楼梯连接，功能分区明确。Reno Stars 熟悉这类住宅的装修特点，已完成多个错层式住宅改造项目。</p><h2>错层式住宅装修成本（2026 年）</h2><p>根据实际项目数据，Burnaby 和 Coquitlam 地区错层式住宅装修成本通常在 $55,000 至 $180,000 之间，具体取决于：</p><ul><li>装修范围（全屋 or 局部）</li><li>楼梯和楼层连通性改造</li><li>厨房和卫生间数量及配置</li><li>是否涉及结构改动</li></ul><h2>错层式住宅常见装修重点</h2><p>错层式住宅最常见的装修需求包括：更新楼梯扶手和踏板、打通厨房与客厅的视线、增加自然采光、以及升级卫生间设施。由于楼层分隔较多，暖通空调改造通常是关键项目。Reno Stars 在错层式住宅方面有丰富经验，可提供免费现场评估。</p>'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

-- 4. vancouver-infill-development-cost-2026
UPDATE blog_posts
SET content_zh = '<p>填充式开发（Infill Development）是指在现有成熟社区内通过重建或分割地块来增加住房密度的开发模式。在温哥华，填充式开发包括将单户地块改建为双户或多户住宅、后巷屋建设，以及将大型独立屋拆除后建造联排或公寓。Reno Stars 参与过多个填充式开发项目的装修和新建工程。</p><h2>填充式开发成本（2026 年）</h2><p>根据实际项目数据，温哥华地区填充式开发项目的装修/新建成本：</p><ul><li>单户改双户：$350,000 – $650,000</li><li>后巷屋新建：$250,000 – $500,000</li><li>整块地块重建为多户住宅：$800,000 – $2,500,000</li></ul><h2>填充式开发许可</h2><p>填充式开发项目需要满足温哥华市级和省级多项规划要求。Rezoning 申请可能需要 3–6 个月，建筑许可另需 2–4 个月。Reno Stars 可协助您完成从规划咨询到建筑许可的全流程。</p>'
WHERE slug = 'vancouver-infill-development-cost-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

-- 5. heritage-home-renovation-vancouver-2026
UPDATE blog_posts
SET content_zh = '<p> heritage 住宅是指被列入政府文物保护名录或具有历史建筑特征的住宅。在温哥华， heritage 住宅主要集中于 Shaughnessy、Kerrisdale、Kitsilano 和 Mount Pleasant 等社区。Reno Stars 在 heritage 住宅装修方面拥有丰富经验，熟悉相关保护规定和施工标准。</p><h2>Heritage 住宅装修成本（2026 年）</h2><p>根据实际项目数据，温哥华 heritage 住宅装修成本显著高于常规装修：</p><ul><li>内部装修（保留外立面）：$150,000 – $350,000</li><li>全面修复加现代设施升级：$350,000 – $800,000</li><li>部分重建（保留历史特征）：$500,000 – $1,200,000+</li></ul><h2>Heritage 装修特殊要求</h2><p>Heritage 住宅装修需遵守《温哥华遗产保护章程》，通常需要 heritage 保护官员审批外立面和结构改动。施工中若发现历史建筑特征（如原始木结构、装饰线条），需及时报告。Reno Stars 有专人负责 heritage 项目审批流程。</p>'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

-- 6. mid-century-rancher-renovation-vancouver-2026
UPDATE blog_posts
SET content_zh = '<p>中世纪平房（Mid-Century Rancher）是 1950–1970 年代流行的一种单层住宅风格，特点是开放平面布局、大面积玻璃窗和与户外空间的流畅连接。在大温地区，特别是北温哥华、西温哥华和本拿比，这类住宅仍然非常常见。Reno Stars 已完成多个中世纪平房改造项目，熟悉这类住宅的结构特点和装修要点。</p><h2>中世纪平房装修成本（2026 年）</h2><p>根据实际项目数据，大温地区中世纪平房装修成本：</p><ul><li>局部装修（厨房、卫生间更新）：$55,000 – $120,000</li><li>全屋翻新（保留结构）：$120,000 – $250,000</li><li>扩建项目（增加面积或二层）：$250,000 – $500,000</li></ul><h2>中世纪风格现代改造要点</h2><p>中世纪平房改造的核心是在保留建筑风格的同时，引入现代生活设施。常见项目包括：更新开放式厨房、扩大窗户引入更多自然光、升级暖通空调系统、将车库或露台空间并入室内等。Reno Stars 在温哥华中世纪住宅改造方面有多个成功案例。</p>'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
AND is_published = true
AND LENGTH(content_zh) < 200;

COMMIT;
