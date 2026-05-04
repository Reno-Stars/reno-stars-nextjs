/**
 * Enriches the 4 new specialty services (commit a0f8e03) with:
 *   - service_tags rows (visible chip list on /services/{slug}/, also a strong
 *     SEO signal about service scope keywords)
 *   - service_benefits rows (the "why us" bulleted list rendered on the page)
 *   - localizations JSON (zh-Hant + ja + ko + es title/description native)
 *
 * Per project memory `project_seo_sprint_2026_04_17.md`, ZH-side gets ~63×
 * more efficient clicks per impression than EN. zh-Hant is a separate
 * search audience (HK/TW Mandarin readers) — having native text instead
 * of pickLocale-fallback-to-en is the biggest single win for the new
 * services across the secondary locales.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface ServiceEnrichment {
  slug: string;
  tags: { en: string; zh: string }[];
  benefits: { en: string; zh: string }[];
  localizations: Record<string, Record<string, string>>;
}

const enrichments: ServiceEnrichment[] = [
  {
    slug: 'poly-b-replacement',
    tags: [
      { en: 'PEX re-pipe (PEX-A or PEX-B)', zh: 'PEX 重新走管（PEX-A 或 PEX-B）' },
      { en: 'Insurance-renewal compliance', zh: '保险续保合规' },
      { en: 'Manifold installation', zh: '分水器安装' },
      { en: 'Pressure testing + inspection', zh: '压力测试 + 检验' },
      { en: 'Drywall patch & access points', zh: '墙面修补 + 检修口' },
      { en: 'BC permit + WSBC compliance', zh: 'BC 许可证 + WSBC 合规' },
    ],
    benefits: [
      { en: '50-year manufacturer warranty on PEX', zh: 'PEX 厂商 50 年保修' },
      { en: 'Insurer-friendly documentation provided', zh: '提供保险公司认可的文件' },
      { en: 'Minimal drywall disturbance — strategic access only', zh: '最小化墙面扰动——仅必要检修口' },
      { en: 'Pressure-tested + inspected before close-up', zh: '封闭前压力测试 + 检验通过' },
      { en: 'Coordinated with strata if applicable', zh: '如需配合业主立案沟通' },
    ],
    localizations: {
      'zh-Hant': {
        title: 'Poly-B 水管更換',
        description: '更換 1985–1997 年間在 BC 省建造的房屋中失效的 Poly-B 聚乙烯管道。保險續保、防漏水，$8K–$25K。',
      },
      ja: {
        title: 'Poly-B 配管交換',
        description: '1985–1997年に建てられたBC州の住宅で劣化したポリブチレン配管を交換。保険更新、漏水防止、$8K–$25K。',
      },
      ko: {
        title: 'Poly-B 배관 교체',
        description: '1985–1997년 사이 BC 주에 지어진 주택의 노후된 폴리부틸렌 배관 교체. 보험 갱신, 누수 방지, $8K–$25K.',
      },
      es: {
        title: 'Reemplazo de Tuberías Poly-B',
        description: 'Reemplaza la plomería polibutileno defectuosa en hogares de BC construidos entre 1985–1997. Renovación de seguro, prevención de fugas, $8K–$25K.',
      },
    },
  },
  {
    slug: 'heat-pump-hvac',
    tags: [
      { en: 'Ductless mini-split', zh: '无管道分体' },
      { en: 'Multi-zone systems', zh: '多区系统' },
      { en: 'Cold-climate heat pumps', zh: '寒带级热泵' },
      { en: 'Gas-furnace replacement', zh: '替换燃气炉' },
      { en: 'BC Hydro + Greener Homes rebates', zh: 'BC Hydro + 绿色家园退税' },
      { en: 'Mitsubishi / Daikin / Fujitsu certified', zh: 'Mitsubishi / Daikin / Fujitsu 认证安装' },
      { en: 'Smart-thermostat integration', zh: '智能恒温器整合' },
    ],
    benefits: [
      { en: 'Up to $11K combined rebate when eligible', zh: '符合条件时退税合计可达 $11K' },
      { en: 'We handle rebate paperwork end-to-end', zh: '退税文件全程代办' },
      { en: 'AC + heat in one system (year-round comfort)', zh: '一套系统兼制冷与制热（全年舒适）' },
      { en: 'Lower operating cost vs gas furnace at current carbon pricing', zh: '当前碳定价下运行成本低于燃气炉' },
      { en: 'Coordinated panel + electrical upgrade if needed', zh: '如需配合电箱与电路升级' },
    ],
    localizations: {
      'zh-Hant': {
        title: '熱泵 / 空調升級',
        description: '用熱泵替換燃氣爐。BC Hydro 退稅最高 $11K。溫哥華熱泵安裝 $7K–$25K。',
      },
      ja: {
        title: 'ヒートポンプ設置',
        description: 'ガス炉をヒートポンプに交換。BC Hydroのリベート最大$11K。バンクーバーのヒートポンプ設置$7K-$25K。',
      },
      ko: {
        title: '히트펌프 설치',
        description: '가스 화로를 히트펌프로 교체. BC Hydro 리베이트 최대 $11K. 밴쿠버 히트펌프 설치 $7K–$25K.',
      },
      es: {
        title: 'Instalación de Bomba de Calor',
        description: 'Reemplaza tu caldera de gas con bomba de calor. Reembolsos de BC Hydro hasta $11K. Instalación en Vancouver $7K–$25K.',
      },
    },
  },
  {
    slug: 'accessible-bathroom',
    tags: [
      { en: 'Curbless / barrier-free shower', zh: '无门槛 / 无障碍淋浴' },
      { en: 'Grab bars (structurally backed)', zh: '结构背板锚定的扶手' },
      { en: 'Comfort-height toilet', zh: '舒适高度马桶' },
      { en: 'Roll-in shower seat (folding)', zh: '可滚入式折叠淋浴座椅' },
      { en: 'Lever-handle faucets', zh: '杠杆式水龙头' },
      { en: 'Roll-under (wheelchair-accessible) vanity', zh: '可滚入式（轮椅可入）梳妆台' },
      { en: 'Slip-resistant tile (R10+)', zh: '防滑瓷砖（R10+）' },
      { en: 'Wider doorways (32"–36" clear)', zh: '加宽门洞（32"–36" 净宽）' },
      { en: 'CSA B651 + BC Code compliance', zh: 'CSA B651 + BC 规范合规' },
    ],
    benefits: [
      { en: 'Aging-in-place planning advice from day one', zh: '从第一天起的就地养老规划建议' },
      { en: 'Help with Home Adaptation for Independence grant ($20K)', zh: '协助申请独立生活居家改造资助 ($20K)' },
      { en: 'Coordination with occupational therapists when involved', zh: '如有职业治疗师介入则协调对接' },
      { en: 'Future-proof construction (grab-bar backing pre-installed)', zh: '前瞻施工（扶手背板预先安装）' },
      { en: 'Veterans Affairs Canada accessibility funding support', zh: '退伍军人事务部加拿大无障碍资金支持' },
    ],
    localizations: {
      'zh-Hant': {
        title: '無障礙 / 老人浴室改造',
        description: '老人/無障礙浴室改造：步入式淋浴、扶手、舒適高度馬桶、輪椅通行。溫哥華 $3K–$60K。',
      },
      ja: {
        title: 'バリアフリー浴室リフォーム',
        description: '高齢者・バリアフリー浴室リフォーム：歩行式シャワー、手すり、快適高さのトイレ、車椅子対応。バンクーバー$3K-$60K。',
      },
      ko: {
        title: '배리어 프리 / 고령자 욕실 리노베이션',
        description: '고령자 / 배리어 프리 욕실 리노베이션: 워크인 샤워, 손잡이, 편안한 높이 변기, 휠체어 접근. 밴쿠버 $3K–$60K.',
      },
      es: {
        title: 'Renovación de Baño Accesible',
        description: 'Baño accesible / envejecimiento en el hogar: ducha sin bordes, barras de apoyo, inodoro de altura cómoda, acceso para silla de ruedas. Vancouver $3K–$60K.',
      },
    },
  },
  {
    slug: 'critical-load-panel',
    tags: [
      { en: 'Sub-panel installation', zh: '分电箱安装' },
      { en: 'Manual transfer switch', zh: '手动转换开关' },
      { en: 'Automatic transfer switch', zh: '自动转换开关' },
      { en: 'Battery prep (Powerwall, Enphase)', zh: '储能预装（Powerwall、Enphase）' },
      { en: 'Generator pad + inlet box', zh: '发电机基座 + 入口箱' },
      { en: '100A → 200A panel upgrade', zh: '100A 升级到 200A' },
      { en: 'EV charger circuit', zh: 'EV 充电电路' },
      { en: 'Heat pump dedicated 30A', zh: '热泵专用 30A' },
      { en: 'BC Technical Safety Authority permit', zh: 'BC 技术安全局许可证' },
    ],
    benefits: [
      { en: '5-year electrical-install warranty', zh: '电气安装 5 年保修' },
      { en: 'Permit + inspection coordinated end-to-end', zh: '许可证 + 检验全程协调' },
      { en: 'Bundle savings if combined with EV/heat-pump install', zh: '与 EV / 热泵安装组合时省人工' },
      { en: 'Future-ready for solar + battery additions', zh: '为未来加装太阳能 + 储能预留' },
      { en: 'No surprise after-the-fact panel work', zh: '杜绝事后才发现需要电箱改造' },
    ],
    localizations: {
      'zh-Hant': {
        title: '關鍵負載電箱（應急配電）',
        description: '應急電源就緒電箱，適配發電機、家庭儲能、EV 充電。溫哥華 $3K–$12K。常配合熱泵安裝一併升級。',
      },
      ja: {
        title: 'クリティカルロードパネル設置',
        description: 'バックアップ電源対応の電気パネル：発電機、家庭用蓄電池、EV充電器。バンクーバー$3K-$12K。ヒートポンプ設置と相性が良い。',
      },
      ko: {
        title: '크리티컬 로드 패널 설치',
        description: '백업 전원 대응 전기 패널: 발전기, 가정용 배터리, EV 충전기. 밴쿠버 $3K–$12K. 히트펌프 설치와 함께 자주 업그레이드.',
      },
      es: {
        title: 'Instalación de Panel de Carga Crítica',
        description: 'Panel eléctrico listo para energía de respaldo: generador, batería doméstica, cargador EV. Vancouver $3K–$12K.',
      },
    },
  },
];

async function run() {
  for (const e of enrichments) {
    // Look up service ID
    const sr = await pool.query<{ id: string }>(
      'SELECT id FROM services WHERE slug = $1 LIMIT 1',
      [e.slug],
    );
    if (sr.rows.length === 0) {
      console.log(`SKIP (service not found): ${e.slug}`);
      continue;
    }
    const serviceId = sr.rows[0].id;

    // Wipe existing tags + benefits for idempotency, then re-insert
    await pool.query('DELETE FROM service_tags WHERE service_id = $1', [serviceId]);
    await pool.query('DELETE FROM service_benefits WHERE service_id = $1', [serviceId]);

    // Insert tags
    for (let i = 0; i < e.tags.length; i++) {
      const t = e.tags[i];
      await pool.query(
        'INSERT INTO service_tags (service_id, tag_en, tag_zh, display_order) VALUES ($1, $2, $3, $4)',
        [serviceId, t.en, t.zh, i],
      );
    }

    // Insert benefits
    for (let i = 0; i < e.benefits.length; i++) {
      const b = e.benefits[i];
      await pool.query(
        'INSERT INTO service_benefits (service_id, benefit_en, benefit_zh, display_order) VALUES ($1, $2, $3, $4)',
        [serviceId, b.en, b.zh, i],
      );
    }

    // Update localizations JSON on the service row.
    // The buildLocalized helper reads localizations.title<LocaleSuffix>,
    // localizations.description<LocaleSuffix>, etc. — see lib/utils.ts.
    // LOCALE_TO_DB_SUFFIX uses pascal-case keys like 'titleZhHant', 'titleJa'.
    const localizationsJson: Record<string, string> = {};
    const suffixMap: Record<string, string> = {
      'zh-Hant': 'ZhHant',
      ja: 'Ja',
      ko: 'Ko',
      es: 'Es',
    };
    for (const [loc, fields] of Object.entries(e.localizations)) {
      const suffix = suffixMap[loc];
      if (!suffix) continue;
      for (const [field, value] of Object.entries(fields)) {
        // field is "title" or "description" — capitalize for the DB key
        const cap = field.charAt(0).toUpperCase() + field.slice(1);
        localizationsJson[`${field}${suffix}`] = value;
        // Also store the alternate "<field>Zh-Hant" naming pattern in case
        // buildLocalized prefers it; harmless if unused.
        if (loc === 'zh-Hant') localizationsJson[`${field.charAt(0).toLowerCase() + field.slice(1)}ZhHant`] = value;
        void cap; // unused, kept for symmetry
      }
    }
    await pool.query(
      'UPDATE services SET localizations = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(localizationsJson), serviceId],
    );

    console.log(`ENRICHED ${e.slug}: ${e.tags.length} tags, ${e.benefits.length} benefits, ${Object.keys(e.localizations).length} locales`);
  }
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
