import { describe, it, expect } from 'vitest';
import { stripPriceProse, stripPriceMarkdown, filterPriceFaqs, hasDuration, hasPriceCopy } from '@/lib/seo/strip-price-copy';
import { areaContentRenderer } from '@/lib/seo/area-markdown';

/** Task 145: a duration that shares a sentence with a price stays; only the price goes. */

describe('durations survive when their sentence also quotes a price (verbatim nearMe.services.*.desc)', () => {
  it.each([
    ['ar kitchen', 'تحديث صديق للميزانية إلى التخصيص الكامل. نموذجي 4-8 أسابيع، 15 ألف دولار - 72 ألف دولار.',
      'تحديث صديق للميزانية إلى التخصيص الكامل. نموذجي 4-8 أسابيع.'],
    ['ar bathroom', 'ومنضدة زينة، وتركيبات. 3-6 أسابيع نموذجية، 10 ألف دولار - 60 ألف دولار.',
      'ومنضدة زينة، وتركيبات. 3-6 أسابيع نموذجية.'],
    ['ar cabinet', 'أبواب وأجهزة وكوارتز جديدة لنفس المساحة. 1-2 أسابيع، 8 آلاف دولار - 20 ألف دولار.',
      'أبواب وأجهزة وكوارتز جديدة لنفس المساحة. 1-2 أسابيع.'],
    ['pa kitchen', "ਬਜਟ-ਅਨੁਕੂਲ ਰਿਫਰੈਸ਼ ਤੋਂ ਪੂਰਾ ਕਸਟਮ ਤੱਕ। ਆਮ ਤੌਰ 'ਤੇ 4-8 ਹਫ਼ਤੇ, $15K-$72K।",
      "ਬਜਟ-ਅਨੁਕੂਲ ਰਿਫਰੈਸ਼ ਤੋਂ ਪੂਰਾ ਕਸਟਮ ਤੱਕ। ਆਮ ਤੌਰ 'ਤੇ 4-8 ਹਫ਼ਤੇ।"],
    ['pa bathroom', 'ਵੈਨਿਟੀਆਂ, ਫਿਟਿੰਗਜ਼। ਆਮ 3-6 ਹਫ਼ਤੇ, $10K-$60K।', 'ਵੈਨਿਟੀਆਂ, ਫਿਟਿੰਗਜ਼। ਆਮ 3-6 ਹਫ਼ਤੇ।'],
    ['pa cabinet', 'ਅਤੇ ਕੁਆਰਟਜ਼। 1-2 ਹਫ਼ਤੇ, $8K-$20K।', 'ਅਤੇ ਕੁਆਰਟਜ਼। 1-2 ਹਫ਼ਤੇ।'],
    ['zh cabinet', '在相同占地面积的情况下使用新门、硬件和石英。 1-2 周，8000 加元到 20000 加元。',
      '在相同占地面积的情况下使用新门、硬件和石英。1-2 周。'],
    ['zh kitchen', '预算友好的更新为完全定制。通常 4-8 周，$15K-$72K。', '预算友好的更新为完全定制。通常 4-8 周。'],
    ['zh-Hant cabinet', '在原有格局下換上新門板、五金和石英檯面。1-2 週，8,000 加元至 20,000 加元。',
      '在原有格局下換上新門板、五金和石英檯面。1-2 週。'],
    ['zh-Hant bathroom', '浴室櫃、固定裝置。一般 3-6 週，10000-60000 加元。', '浴室櫃、固定裝置。一般 3-6 週。'],
    ['fr kitchen', 'Actualisation économique pour une personnalisation complète. Typique 4 à 8 semaines, 15 000 $ à 72 000 $.',
      'Actualisation économique pour une personnalisation complète. Typique 4 à 8 semaines.'],
    ['fr bathroom', 'Vanités, luminaires. 3 à 6 semaines typiques, 10 000 $ à 60 000 $.', 'Vanités, luminaires. 3 à 6 semaines typiques.'],
    ['fr cabinet', 'Quartz pour le même encombrement. 1 à 2 semaines, 8 000 $ à 20 000 $.', 'Quartz pour le même encombrement. 1 à 2 semaines.'],
    ['en kitchen', 'Budget-friendly refresh to full custom. Typical 4-8 weeks, $15K-$72K.', 'Budget-friendly refresh to full custom. Typical 4-8 weeks.'],
  ])('%s keeps its weeks', (_name, input, out) => {
    expect(stripPriceProse(input)).toBe(out);
    expect(hasPriceCopy(stripPriceProse(input))).toBe(false);
  });
});

describe('synthetic duration + price sentences (verify.json)', () => {
  it('"预计5–6周完成，约$3万。" keeps 5–6周 and is not empty', () => {
    expect(stripPriceProse('预计5–6周完成，约$3万。')).toBe('预计5–6周完成。');
  });
  it('"Takes 5-6 weeks and costs $20K–$55K." keeps the weeks', () => {
    expect(stripPriceProse('Takes 5-6 weeks and costs $20K–$55K.')).toBe('Takes 5-6 weeks.');
  });
  it('a duration-only sentence is untouched', () => {
    expect(stripPriceProse('Typical timeline 5–6 weeks.')).toBe('Typical timeline 5–6 weeks.');
    expect(stripPriceProse('Completed in 5–6 weeks. Kitchens from $25,000.')).toBe('Completed in 5–6 weeks.');
  });
  it('a price-only sentence still goes whole', () => {
    expect(stripPriceProse('Kitchens from $25,000. Licensed. Insured.')).toBe('Licensed. Insured.');
  });
});

describe('Persian / Arabic digits after a comma are a thousands separator, not a clause break', () => {
  it('fa: "۳۳,۰۰۰ تا ۳۵,۰۰۰ دلار" goes whole, "۶ تا ۸ هفته" stays', () => {
    const out = stripPriceProse('دو حمام با دستشویی مهمان: ۳۳,۰۰۰ تا ۳۵,۰۰۰ دلار، ۶ تا ۸ هفته');
    // the label in front of the cut price stays (task 151)
    expect(out).toBe('دو حمام با دستشویی مهمان: ۶ تا ۸ هفته');
    expect(hasPriceCopy(out)).toBe(false);
  });
});

describe('area copy: a duration between two prices (verbatim DB area copy)', () => {
  it('Coquitlam: "(5-6 weeks …)" stays, both prices go', () => {
    const out = stripPriceProse('Real Coquitlam project pricing from our portfolio: kitchen renovations from $25,000–$27,000 (5-6 weeks for a budget-friendly condo kitchen with quartz countertops) to $35,000+ for custom layouts.');
    expect(out).toBe('kitchen renovations: 5-6 weeks for a budget-friendly condo kitchen with quartz countertops.');
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('Maple Ridge: a comma inside the parenthetical does not split it', () => {
    const out = stripPriceProse('Real Maple Ridge project pricing: bathroom renovations from $18,000–$21,000 (3-4 weeks, including custom glass door and tiled walls) to $35,000+ for full master bath suites with heated floors.');
    expect(out).toBe('bathroom renovations: 3-4 weeks, including custom glass door and tiled walls.');
    expect(hasPriceCopy(out)).toBe(false);
  });
});

describe('ranges with the currency after each number are ONE price', () => {
  it.each(['15 ألف دولار - 72 ألف دولار', '15 000 $ à 72 000 $', '8000 加元到 20000 加元'])('%s', (s) => {
    expect(stripPriceProse(`A, ${s}.`)).toBe('A.');
  });
});

describe('hasDuration recognises fr / pa / ar / CJK forms', () => {
  it.each(['4 à 8 semaines', '4-8 ਹਫ਼ਤੇ', '4-8 أسابيع', '1-2 週', '5–6周', '3-6 weeks', '2-6 個月'])('%s', (s) => {
    expect(hasDuration(s)).toBe(true);
  });
  it('a year or a price is not a duration', () => {
    expect(hasDuration('2026')).toBe(false);
    expect(hasDuration('$15K-$72K')).toBe(false);
  });
});

describe('task 148: durations in cost FAQs, tables and Arabic area copy stay', () => {
  it('a cost FAQ whose answer states a duration is kept, price-free (West Vancouver basement FAQ)', () => {
    const out = filterPriceFaqs([{ question: 'How much does a basement suite cost in West Vancouver?',
      answer: 'A full unfinished-to-suite conversion typically costs $65,000–$95,000 (8–10 weeks) given the higher labour and finish standards. A finished-basement conversion runs $45,000–$70,000 (6–8 weeks). A building permit and stamped drawings are required.' }]);
    expect(out).toHaveLength(1);
    expect(out[0].answer).toContain('typically takes 8–10 weeks given the higher labour');
    expect(out[0].answer).toContain('A finished-basement conversion takes 6–8 weeks.');
    expect(hasPriceCopy(out[0].answer)).toBe(false);
  });
  it('a cost FAQ with no duration (and no insurance) is still dropped', () => {
    expect(filterPriceFaqs([{ question: 'How much does a kitchen cost?', answer: 'Kitchens run $25,000–$55,000 depending on finishes and layout changes.' }])).toEqual([]);
  });
  it('ar Burnaby: "ويستغرق من 2 إلى 3 أسابيع" stays when the price goes', () => {
    // task 152: the "و" ("and") only joined the cost verb to the duration verb — it goes with the cost
    expect(stripPriceProse('يكلف ما بين 20000 إلى 25000 دولار ويستغرق من 2 إلى 3 أسابيع.')).toBe('يستغرق من 2 إلى 3 أسابيع.');
    expect(stripPriceProse('يستغرق الحمام الرئيسي الكامل مع الميزات المخصصة من 3 إلى 5 أسابيع ويكلف 26000 إلى 32000 دولار.'))
      .toBe('يستغرق الحمام الرئيسي الكامل مع الميزات المخصصة من 3 إلى 5 أسابيع.');
  });
  it('zh Richmond: "$15,000–$18,000（2–3 周）" keeps （2–3 周）', () => {
    const out = stripPriceProse('标准翻新（壁挂式浴室柜、无框淋浴、地铁砖）为 $15,000–$18,000（2–3 周）。');
    expect(out).toBe('标准翻新（壁挂式浴室柜、无框淋浴、地铁砖）需要 2–3 周。');
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('a table row with a duration keeps it and empties only the price cell', () => {
    expect(stripPriceMarkdown('| Scope | Cost | Time |\n|---|---|---|\n| Suite | $65K–$95K | 8–10 weeks |\n| Rec room | $50K–$90K | |'))
      .toBe('| Scope | Cost | Time |\n|---|---|---|\n| Suite | | 8–10 weeks |');
  });
});

describe('task 149: Korean "~" ranges survive strip + area markdown render', () => {
  const coquitlam = '[주방 개조](/en/guides/kitchen-renovation-cost-vancouver/)(쿼츠 조리대가 있는 예산 친화적인 콘도 주방의 경우 5~6주)부터 사용자 정의 레이아웃의 경우 $35,000+까지. [욕실 리모델링](/en/guides/bathroom-renovation-cost-vancouver/) 타일로 마감된 맞춤형 유리 샤워실의 경우 $14,000~$17,000(2~3주 표준 샤워 전환)에서 $25,000+까지입니다.\n\nWestwood Plateau 및 Burke Mountain의 콘도 개조는 시작하기 전에 스트라타 승인이 필요합니다.';
  it('the stripper keeps (2~3주 …) and 5~6주 when the $ ranges go', () => {
    const out = stripPriceMarkdown(coquitlam);
    expect(out).toContain('5~6주');
    expect(out).toContain('[욕실 리모델링](/en/guides/bathroom-renovation-cost-vancouver/): 2~3주 표준 샤워 전환.');
    expect(out).not.toMatch(/부터|까지/);
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('the area renderer prints "~" literally (no strikethrough pairing): 5~6주 / 2~3주 / 6~8주', () => {
    const html = areaContentRenderer.parse(stripPriceMarkdown(coquitlam)) as string;
    expect(html).toContain('5~6주');
    expect(html).toContain('2~3주');
    expect(html).not.toContain('<del>');
    const delta = areaContentRenderer.parse('우리는 최근 6~8주에 걸쳐 총 $40,000~$43,000의 개조를 완료했습니다.') as string;
    expect(delta).toContain('6~8주');
    expect(delta).toContain('$40,000~$43,000');
  });
  it('a real double-tilde stays literal too (copy never uses strikethrough)', () => {
    expect(areaContentRenderer.parse('a ~~b~~ c') as string).toContain('~~b~~');
  });
});

/**
 * Task 151: what a cut price leaves behind must read as a sentence — no "비용은입니다", "총의",
 * "(…)부터(…)", "and costs.", "cuesta entre en" — and no half of a range ("25,000 ～").
 * Verbatim area-copy lines from the DB, all 14 locales' families.
 */
const FRAGMENT = /비용(?:은|이)\s*(?:입니다|[.,])|에입니다|(?:^|\s)총의|[)）](?:부터|에서|까지)|경우까지|에서까지|(?:^|\s)(?:and costs|totaling|cuesta entre|coûte entre|y cuesta|et coûte|и стоит|có giá)\s*[.,]?\s*(?:$|en\s|\.)|totaling over|[从從]\s*[（(]|[0-9],[0-9]{3}\s*～\s*(?![0-9])|総額|耗资|耗資/;

describe('task 151: no sentence fragments after a price is cut (verbatim area copy)', () => {
  it.each([
    ["burnaby [ko]", "- **[욕실 개조](/en/guides/bathroom-renovation-cost-vancouver/)s:** 범위에 따라 $20,000~$32,000. 표준 욕실 업데이트(새 세면대, 타일, 설비) 비용은 2~3주에 $20,000~$25,000입니다. 맞춤형 기능을 갖춘 전체 마스터 욕실은 3~5주가 걸리며 비용은 $26,000~$32,000입니다.",
      "- 표준 욕실 업데이트(새 세면대, 타일, 설비) 기간은 2~3주입니다. 맞춤형 기능을 갖춘 전체 마스터 욕실은 3~5주가 걸립니다."],
    ["delta [ko]", "실제 Delta 프로젝트 가격: [욕실 개조](/en/guides/bathroom-renovation-cost-vancouver/) $15,000~$20,000(표준 3개 부품)부터 $40,000~$43,000(욕실 3개 반 패키지, 6~8주 — 가장 인기 있는 Delta 범위). [주방 개조](/en/guides/kitchen-renovation-cost-vancouver/)는 새로 고치는 데 $28,000부터 Tsawwassen 해안가 주택의 맞춤형 아일랜드 레이아웃을 위해 $60,000 이상입니다.",
      "[욕실 개조](/en/guides/bathroom-renovation-cost-vancouver/): 욕실 3개 반 패키지, 6~8주 — 가장 인기 있는 Delta 범위."],
    ["delta [ko]", "욕실 리노베이션 시공업체를 찾는 Delta 주택 소유자는 우리 팀이 해당 지역의 주택 스타일에 정통하다는 것을 알게 될 것입니다. 우리는 최근 6~8주에 걸쳐 총 $40,000~$43,000의 [Delta에서 욕실 3개 반 개조](/en/projects/3-and-a-half-bathroom-renovation-delta/)를 완료했습니다. 이는 현재까지 가장 포괄적인 Delta 욕실 프로젝트입니다.",
      "욕실 리노베이션 시공업체를 찾는 Delta 주택 소유자는 우리 팀이 해당 지역의 주택 스타일에 정통하다는 것을 알게 될 것입니다. 우리는 최근 6~8주에 걸쳐 [Delta에서 욕실 3개 반 개조](/en/projects/3-and-a-half-bathroom-renovation-delta/)를 완료했습니다. 이는 현재까지 가장 포괄적인 Delta 욕실 프로젝트입니다."],
    ["coquitlam [ko]", "당사 포트폴리오의 실제 Coquitlam 프로젝트 가격: [주방 개조](/en/guides/kitchen-renovation-cost-vancouver/) $25,000~$27,000(쿼츠 조리대가 있는 예산 친화적인 콘도 주방의 경우 5~6주)부터 사용자 정의 레이아웃의 경우 $35,000+까지. [욕실 리모델링](/en/guides/bathroom-renovation-cost-vancouver/) 타일로 마감된 맞춤형 유리 샤워실의 경우 $14,000~$17,000(2~3주 표준 샤워 전환)에서 $25,000+까지입니다. Westwood Plateau 및 Burke Mountain의 콘도 개조는 시작하기 전에 스트라타 승인이 필요합니다. 우리는 신청 서류 작업을 처리하고 귀하의 스트라타 협의회와 협력합니다.",
      "[주방 개조](/en/guides/kitchen-renovation-cost-vancouver/): 쿼츠 조리대가 있는 예산 친화적인 콘도 주방의 경우 5~6주. [욕실 리모델링](/en/guides/bathroom-renovation-cost-vancouver/): 2~3주 표준 샤워 전환. Westwood Plateau 및 Burke Mountain의 콘도 개조는 시작하기 전에 스트라타 승인이 필요합니다. 우리는 신청 서류 작업을 처리하고 귀하의 스트라타 협의회와 협력합니다."],
    ["burnaby [en]", "- **[bathroom renovation](/en/guides/bathroom-renovation-cost-vancouver/)s:** $20,000–$32,000 depending on scope. A standard bathroom update (new vanity, tile, fixtures) runs $20,000–$25,000 in 2–3 weeks. A full master ensuite with custom features takes 3–5 weeks and costs $26,000–$32,000.",
      "- A standard bathroom update (new vanity, tile, fixtures) runs in 2–3 weeks. A full master ensuite with custom features takes 3–5 weeks."],
    ["burnaby [fr]", "- **[rénovation de la salle de bain](/en/guides/bathroom-renovation-cost-vancouver/)s :** 20 000 $ à 32 000 $ selon l'ampleur. Une mise à jour standard d'une salle de bain (nouvelle vanité, carrelage, luminaires) coûte entre 20 000 et 25 000 dollars en 2 à 3 semaines. Une salle de bain principale complète avec des fonctionnalités personnalisées prend 3 à 5 semaines et coûte entre 26 000 et 32 ​​000 $.",
      "- Une mise à jour standard d'une salle de bain (nouvelle vanité, carrelage, luminaires) se réalise en 2 à 3 semaines. Une salle de bain principale complète avec des fonctionnalités personnalisées prend 3 à 5 semaines."],
    ["burnaby [es]", "- **[renovación de baños](/es/guides/bathroom-renovation-cost-vancouver/)s:** $20 000–$32 000 según el alcance. Una actualización estándar del baño (tocador nuevo, azulejos, accesorios) cuesta entre $20 000 y $25 000 en 2 a 3 semanas. Un baño principal completo con características personalizadas tarda de 3 a 5 semanas y cuesta entre 26 000 y 32 000 dólares.",
      "- Una actualización estándar del baño (tocador nuevo, azulejos, accesorios) se completa en 2 a 3 semanas. Un baño principal completo con características personalizadas tarda de 3 a 5 semanas."],
    ["burnaby [ja]", "- **[浴室の改修](/en/guides/bathroom-renovation-cost-vancouver/)s:** 範囲に応じて 20,000 ～ 32,000 ドル。標準的なバスルームの更新 (新しい洗面化粧台、タイル、設備) には、2 ～ 3 週間で 20,000 ～ 25,000 ドルかかります。カスタム機能を備えた完全なマスターエンスイートには 3 ～ 5 週間かかり、費用は 26,000 ～ 32,000 ドルです。",
      "- 標準的なバスルームの更新 (新しい洗面化粧台、タイル、設備) には、2 ～ 3 週間かかります。カスタム機能を備えた完全なマスターエンスイートには 3 ～ 5 週間かかります。"],
    ["delta [ja]", "バスルーム改修請負業者を探している Delta 住宅所有者は、その地域の住宅スタイルに精通した私たちのチームを見つけるでしょう。私たちは最近、[Delta の 3 つ半のバスルームの改修](/en/projects/three-and-a-half-bathroom-renovation-delta/) を 6 ～ 8 週間で総額 40,000 ～ 43,000 ドルかけて完了しました。これは、これまでで最も包括的な Delta バスルームプロジェクトです。",
      "バスルーム改修請負業者を探している Delta 住宅所有者は、その地域の住宅スタイルに精通した私たちのチームを見つけるでしょう。私たちは最近、[Delta の 3 つ半のバスルームの改修](/en/projects/three-and-a-half-bathroom-renovation-delta/) を 6 ～ 8 週間で完了しました。これは、これまでで最も包括的な Delta バスルームプロジェクトです。"],
    ["maple-ridge [zh]", "真正的枫树岭项目定价：[浴室翻新](/en/guides/bathroom-renovation-cost-vancouver/)从 18,000 加元至 21,000 加元（3-4 周，包括定制玻璃门和瓷砖墙）到 35,000 加元以上，带加热地板的全套主浴室套房。 [厨房装修](/en/guides/kitchen-renovation-cost-vancouver/)从橱柜+台面翻新25,000加元到内部和重建布局50,000+加元。",
      "[浴室翻新](/en/guides/bathroom-renovation-cost-vancouver/)：3-4 周，包括定制玻璃门和瓷砖墙。"],
    ["delta [en]", "Delta homeowners searching for bathroom renovation contractors will find our team well-versed in the area's housing styles. We recently completed a [three-and-a-half bathroom renovation in Delta](/en/projects/three-and-a-half-bathroom-renovation-delta/) totaling $40,000–$43,000 over 6-8 weeks — our most comprehensive Delta bathroom project to date.",
      "Delta homeowners searching for bathroom renovation contractors will find our team well-versed in the area's housing styles. We recently completed a [three-and-a-half bathroom renovation in Delta](/en/projects/three-and-a-half-bathroom-renovation-delta/) over 6-8 weeks — our most comprehensive Delta bathroom project to date."],
    ["coquitlam [en]", "Real Coquitlam project pricing from our portfolio: [kitchen renovation](/en/guides/kitchen-renovation-cost-vancouver/)s from $25,000–$27,000 (5-6 weeks for a budget-friendly condo kitchen with quartz countertops) to $35,000+ for custom layouts. [bathroom renovation](/en/guides/bathroom-renovation-cost-vancouver/)s from $14,000–$17,000 (2-3 week standard shower conversion) to $25,000+ for tiled walk-in showers with custom glass. Condo renovations in Westwood Plateau and Burke Mountain require strata approval before starting — we handle the application paperwork and coordinate with your strata council.",
      "[kitchen renovation](/en/guides/kitchen-renovation-cost-vancouver/)s: 5-6 weeks for a budget-friendly condo kitchen with quartz countertops. [bathroom renovation](/en/guides/bathroom-renovation-cost-vancouver/)s: 2-3 week standard shower conversion. Condo renovations in Westwood Plateau and Burke Mountain require strata approval before starting — we handle the application paperwork and coordinate with your strata council."],
    ["richmond [ja]", "- **[カスタム機能を備えた 2 つのバスルーム](/en/projects/two-bathroom-renovation-with-custom-features-in-richmond/):** 25,000 ～ 28,000 ドル、4 ～ 5 週間",
      "- **[カスタム機能を備えた 2 つのバスルーム](/en/projects/two-bathroom-renovation-with-custom-features-in-richmond/):** 4 ～ 5 週間"],
    ["richmond [en]", "- **[Minimalist Bathroom Renovation](/en/projects/minimalist-bathroom-renovation-in-richmond/):** $15,000–$18,000, 2-3 weeks",
      "- **[Minimalist Bathroom Renovation](/en/projects/minimalist-bathroom-renovation-in-richmond/):** 2-3 weeks"],
    ["burnaby [ru]", "- **[ремонт ванной комнаты](/en/guides/bathroom-renovation-cost-vancouver/)s:** 20 000–32 000 долларов США в зависимости от объема. Стандартное обновление ванной комнаты (новый туалетный столик, плитка, сантехника) стоит 20–25 000 долларов за 2–3 недели. Полная главная ванная комната с индивидуальными функциями занимает 3–5 недель и стоит 26 000–32 000 долларов.",
      "- Стандартное обновление ванной комнаты (новый туалетный столик, плитка, сантехника) выполняется за 2–3 недели. Полная главная ванная комната с индивидуальными функциями занимает 3–5 недель."],
  ])('%s', (_name, src, want) => {
    const out = stripPriceMarkdown(src);
    expect(out).toBe(want);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).not.toMatch(FRAGMENT);
    // every duration in the source survives
    for (const d of src.match(/[0-9]+\s?[-–~～]\s?[0-9]+\s?(?=주|週|周|weeks?|semaines|semanas|недел)/g) ?? []) expect(out).toContain(d);
  });
  it('fr: a range written with zero-width spaces ("32 \u200B\u200B000 $") is one price, no "26 000 et 32" left', () => {
    const out = stripPriceProse('Une salle de bain principale prend 3 à 5 semaines et coûte entre 26 000 et 32 \u200B\u200B000 $.');
    expect(out).toBe('Une salle de bain principale prend 3 à 5 semaines.');
  });
  it('ja: "15,000～$18,000" / "25,000 ～ 28,000 ドル" go whole — the label stays, no "～、"', () => {
    expect(stripPriceProse('**[2 つのバスルーム](/en/projects/x/):** $15,000～$18,000、2～3 週間')).toBe('**[2 つのバスルーム](/en/projects/x/):** 2～3 週間');
    expect(stripPriceProse('**[2 つのバスルーム](/en/projects/x/):** 25,000 ～ 28,000 ドル、4 ～ 5 週間')).toBe('**[2 つのバスルーム](/en/projects/x/):** 4 ～ 5 週間');
  });
  it('ko: a verb before "비용은 $X입니다" becomes final: 걸리며 → 걸립니다, 있으며 → 있습니다', () => {
    expect(stripPriceProse('전체 욕실은 3~5주가 걸리며 비용은 $26,000~$32,000입니다.')).toBe('전체 욕실은 3~5주가 걸립니다.');
    expect(stripPriceProse('보증이 있으며 3~5주가 소요되고 2~3주 내에 시작할 수 있으며 비용은 $26,000~$32,000입니다.')).toBe('보증이 있으며 3~5주가 소요되고 2~3주 내에 시작할 수 있습니다.');
  });
});

describe('task 151b: two-clause cost FAQs and empty "budget of" clauses (live area pages)', () => {
  it.each([
    ['en Maple Ridge FAQ: both subjects and both durations stay; the price-only follow-on goes',
      'Converting an unfinished basement to a legal suite costs $65,000–$95,000 (8–10 weeks); converting a finished basement runs $45,000–$70,000 (6–8 weeks). A cosmetic refresh of an existing suite starts at $20,000–$35,000.',
      'Converting an unfinished basement to a legal suite takes 8–10 weeks; converting a finished basement takes 6–8 weeks.'],
    ['en Port Coquitlam FAQ (order reversed, "typically costs")',
      'A finished-to-legal-suite conversion typically costs $45,000–$70,000 (6–8 weeks); an unfinished basement conversion runs $65,000–$95,000 (8–10 weeks).',
      'A finished-to-legal-suite conversion typically takes 6–8 weeks; an unfinished basement conversion takes 8–10 weeks.'],
    ['en Delta FAQ: ", while … runs $Y (6–8 weeks)" is a second clause, not the top of a range',
      'Converting an unfinished basement to a legal suite typically costs $65,000–$95,000 (8–10 weeks), while converting a finished basement runs $45,000–$70,000 (6–8 weeks). A cosmetic refresh of an existing suite starts around $20,000–$35,000. Permit fees vary by project value—contact Delta Building Department for current rates.',
      'Converting an unfinished basement to a legal suite typically takes 8–10 weeks, while converting a finished basement takes 6–8 weeks. Permit fees vary by project value—contact Delta Building Department for current rates.'],
    ['ar North Vancouver: a link written "[…] (/url/)" still heads the note; no "يتراوح من (" left',
      'التسعير الحقيقي لمشروع North Vancouver: فاخر [تجديد الحمام] (/en/guides/bathroom-renovation-cost-vancouver/) يتراوح من 42,000 دولار إلى 45,000 دولار (3-4 أسابيع، دش بلا حدود) - ينجذب عملاء Deep Cove نحو التشطيبات.',
      '[تجديد الحمام] (/en/guides/bathroom-renovation-cost-vancouver/): 3-4 أسابيع، دش بلا حدود.'],
    ['fr Burnaby: "et avec un budget de … $," goes',
      "Achevée en 2 à 3 semaines et avec un budget de 23 000 à 25 000 $, la rénovation a permis à l'entreprise de rouvrir avec une vitrine améliorée.",
      "Achevée en 2 à 3 semaines, la rénovation a permis à l'entreprise de rouvrir avec une vitrine améliorée."],
    ['fr Burnaby: "coûte entre … et prend" → "prend"',
      'Une mise à jour standard (nouvelle vanité, carrelage, luminaires et éclairage) coûte entre 20 000 et 25 000 dollars et prend 2 à 3 semaines.',
      'Une mise à jour standard (nouvelle vanité, carrelage, luminaires et éclairage) prend 2 à 3 semaines.'],
    ['fr Burnaby: "coûte entre 28 000 $ et 32 000 $ et prend"',
      'Une salle de bain principale complète avec des fonctionnalités personnalisées et une baignoire autoportante coûte entre 28 000 $ et 32 000 $ et prend 3 à 5 semaines.',
      'Une salle de bain principale complète avec des fonctionnalités personnalisées et une baignoire autoportante prend 3 à 5 semaines.'],
    ['fr Vancouver: "avec un investissement de …," goes, "4 à 5 mois" stays',
      "Le projet a duré 4 à 5 mois avec un investissement de 345 000 à 360 000 $, couvrant une refonte complète de l'intérieur.",
      "Le projet a duré 4 à 5 mois, couvrant une refonte complète de l'intérieur."],
    ['vi Vancouver: "với khoản đầu tư từ …," goes',
      'Dự án kéo dài 4–5 tháng với khoản đầu tư từ $345.000 đến $360.000, bao gồm việc thiết kế lại toàn bộ nội thất.',
      'Dự án kéo dài 4–5 tháng, bao gồm việc thiết kế lại toàn bộ nội thất.'],
    ['vi Burnaby: "với ngân sách từ …," goes',
      'Hoàn thành trong vòng 2-3 tuần với ngân sách từ $23.000–$25.000, việc cải tạo đã giúp doanh nghiệp mở cửa trở lại với mặt tiền cửa hàng được nâng cấp.',
      'Hoàn thành trong vòng 2-3 tuần, việc cải tạo đã giúp doanh nghiệp mở cửa trở lại với mặt tiền cửa hàng được nâng cấp.'],
    ['hi Burnaby: "की लागत … है और इसमें" → "में"',
      'कस्टम सुविधाओं और फ्रीस्टैंडिंग टब के साथ एक पूर्ण मास्टर एनसुइट की लागत $28,000-$32,000 है और इसमें 3-5 सप्ताह लगते हैं।',
      'कस्टम सुविधाओं और फ्रीस्टैंडिंग टब के साथ एक पूर्ण मास्टर एनसुइट में 3-5 सप्ताह लगते हैं।'],
  ])('%s', (_name, src, want) => {
    const out = stripPriceProse(src);
    expect(out).toBe(want);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).not.toMatch(/costs:|budget de,|investissement de,|entre et|từ,|लागत है/);
  });
});

// ---------------------------------------------------------------------------
// Task 152 (Captain CAP-13 re-audit of 9d9c3333): everything the area page renders — FAQ answers
// (incl. the EN fallback), project cards, meta, body. BASE = verbatim raw field from the live site
// (local DB where the live copy differs); WANT = the hand-reviewed render. `needle` = the broken
// fragment Captain saw on the branch.
// ---------------------------------------------------------------------------
import task152 from './fixtures/task152-cases.json';
import { stripPriceCopy } from '@/lib/seo/strip-price-copy';

const DUR152 = /[0-9٠-٩۰-۹]+(?:\s?(?:[-–—~～]|to|à|a|bis|до|đến|से|ਤੋਂ|إلى|تا|至)\s?[0-9٠-٩۰-۹]+)?\s?(?:weeks?|months?|semaines?|mois|недел\p{L}*|месяц\p{L}*|tuần|tháng|linggo|सप्ताह\p{L}*|ਹਫ਼ਤ\p{L}*|أسابيع|أسبوع\p{L}*|أشهر|هفته|ماه|周|週|个月|個月)/gu;
const durKey = (d: string) => d.replace(/\s/g, '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x6f0));

describe('task 152: no fragments in FAQ answers / project cards / meta after a price is cut', () => {
  it.each(task152.map((c) => [c.id, c] as const))('%s', (_id, c) => {
    const out = c.fn === 'markdown' ? stripPriceMarkdown(c.base) : stripPriceCopy(c.base);
    expect(out).toBe(c.want);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).not.toContain(c.needle.trim());
    // every duration of the base text that is not inside a dropped price-only sentence survives
    const kept = new Set((out.match(DUR152) ?? []).map(durKey));
    for (const d of (c.want ?? '').match(DUR152) ?? []) expect(kept.has(durKey(d))).toBe(true);
  });

  it('Persian digits with U+066C ARABIC THOUSANDS SEPARATOR are one amount (fa Burnaby leak)', () => {
    expect(hasPriceCopy('بین ۲۰٬۰۰۰ تا ۲۵٬۰۰۰ دلار هزینه دارد')).toBe(true);
    const fa = 'یک بروزرسانی استاندارد شامل روشویی جدید، کاشی، شیرآلات و روشنایی بین ۲۰٬۰۰۰ تا ۲۵٬۰۰۰ دلار هزینه دارد و ۲ تا ۳ هفته طول می‌کشد. یک مستر انسوئیت کامل با ویژگی‌های سفارشی و وان تک‌پایه بین ۲۸٬۰۰۰ تا ۳۲٬۰۰۰ دلار هزینه دارد و ۳ تا ۵ هفته طول می‌کشد.';
    const out = stripPriceCopy(fa);
    expect(out).toBe('یک بروزرسانی استاندارد شامل روشویی جدید، کاشی، شیرآلات و روشنایی ۲ تا ۳ هفته طول می‌کشد. یک مستر انسوئیت کامل با ویژگی‌های سفارشی و وان تک‌پایه ۳ تا ۵ هفته طول می‌کشد.');
    expect(out).not.toMatch(/[۰-۹]٬|٬\s/);
  });

  it('"美元" is a currency: "20,000 美元至 32,000 美元" is a price', () => {
    expect(hasPriceCopy('浴室翻新费用通常为 20,000 美元至 32,000 美元。')).toBe(true);
    expect(stripPriceCopy('标准更新——新的浴室柜、瓷砖、固定装置和照明——费用为 20,000 至 25,000 美元，需要 2 至 3 周。'))
      .toBe('标准更新——新的浴室柜、瓷砖、固定装置和照明——需要 2 至 3 周。');
  });

  it('a "these prices include…" sentence goes once the prices are gone, and only then', () => {
    expect(stripPriceCopy('浴室翻新费用通常为 20,000 加元至 32,000 加元。这些价格包括劳动力、材料和许可证。')).toBe('');
    expect(stripPriceCopy('These prices include labour, materials and permits.')).toBe('These prices include labour, materials and permits.');
    expect(stripPriceCopy('Bathrooms run $20,000–$32,000. A refresh takes 2–3 weeks. These prices include labour.')).toBe('A refresh takes 2–3 weeks.');
  });

  it('"주방" (kitchen) after an amount is not a duration ("$55,000 주방" ≠ "55,000 weeks")', () => {
    expect(hasDuration('$35,000~$55,000 주방 개조')).toBe(false);
    expect(hasDuration('2~3주')).toBe(true);
  });
});
