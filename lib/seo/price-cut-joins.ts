/**
 * Task 151: what is left on either side of a price that was cut out of a sentence that
 * keeps its duration. Cutting "$20,000–$25,000" alone leaves "비용은 2~3주에입니다",
 * "takes 3–5 weeks and costs.", "総の" — the words that only carried the amount have to go
 * with it, and a verb that only made sense with the amount is turned into one that reads
 * with the duration.
 */

/** Words that only introduce the amount that follows ("and costs", "for", "约", "totaling"). */
export const PRICE_LEAD = /(?:\s*(?:[,，、،]\s*)?(?:(?<![A-Za-zÀ-ɏ])(?:and|or|et|y)\s+)?(?<![A-Za-zÀ-ɏ])(?:costs?|costing|priced at|totall?ing|totalisant|a total of|total of|por un total de|на общую сумму|tổng cộng|بإجمالي|به مجموع|総額|for|at|about|around|roughly|approximately|from|starting at|to|à|coûte|cuesta|约|約|大约|大約|费用|費用|价格|價格|و?(?:يكلف|تكلف)(?:\s+ما)?(?:\s+بين)?|يتراوح\s+بين|ما\s+بين|بين|بتكلفة|حوالي|و?تبلغ\s+تكلفة\s+\S+))?\s*$/i;

const SHORT_DUR = /[0-9]\s*(?:weeks?|days?|months?|周|週|天|个月|個月)/i;
const KO_DUR = String.raw`[0-9]+(?:\s?[~～\-–]\s?[0-9]+)?\s?(?:주|개월|일)`;

/** "걸리" → "걸립" (adds the final ㅂ to a syllable that has none); null when it already has one. */
function addFinalB(syllable: string): string | null {
  const c = syllable.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3 || (c - 0xac00) % 28 !== 0) return null;
  return String.fromCharCode(c + 17);
}

type Join = (left: string, right: string) => [string, string] | null;

/**
 * Each rule sees the text before the cut (`left`) and after it (`right`) and returns the
 * repaired pair, or null when it does not apply. First match wins.
 */
const JOINS: Join[] = [
  // ---- task 152 -------------------------------------------------------------------------------
  // en "permit fees … run $X, with a 3–5 week processing window" / "run $X in fees with 3–5 weeks of
  // processing" → "permits … come with a 3–5 week processing window" (the fee is gone, the wait stays)
  (l, r) => {
    const m = /(?<![A-Za-z])(runs?|costs?|are|is)(\s+(?:typically|usually|approximately|about|roughly))?\s*$/i.exec(l);
    const t = /^\s*(?:in\s+(?:permit\s+)?fees\s*)?,?\s*with\s+(?=\S)/i.exec(r);
    if (!m || !t || !SHORT_DUR.test(r)) return null;
    const plural = /^(?:run|cost|are)$/i.test(m[1]);
    const subject = l.slice(0, m.index).replace(/\bpermit fees\b/i, 'permits').replace(/\bfees for\b/i, 'permits for');
    const many = plural || /permits/i.test(subject);
    const rest = r.slice(t[0].length);
    // "with 3–5 weeks of processing time" → "take 3–5 weeks of processing time"; "with a 3–5 week window" → "come with a …"
    if (/^[0-9]+(?:\s?[-–]\s?[0-9]+)?\s?(?:weeks?|days?|months?)\s+of\s/i.test(rest)) return [subject + (many ? 'take ' : 'takes '), rest];
    return [subject + (many ? 'come with ' : 'comes with '), rest];
  },
  // en "starts at $X (3–4 weeks)" → "takes 3–4 weeks" (the 151 costs/runs rule, for "start(s) at")
  (l, r) => {
    const m = /(?<![A-Za-z])(starts|start)\s+at\s*$/i.exec(l);
    const t = /^\s*\(([^()]*)\)/.exec(r);
    if (!m || !t || !SHORT_DUR.test(t[1])) return null;
    return [l.slice(0, m.index) + (/s$/i.test(m[1]) ? 'takes' : 'take'), ` ${t[1].trim()}${r.slice(t[0].length)}`];
  },
  // en "homes in Burnaby's $X range sell" → "homes in Burnaby sell"; "homes in the $X range sit" → "homes sit"
  (l, r) => {
    if (!/^\s*(?:price\s+)?range\b/i.test(r)) return null;
    const pos = /([A-Z][\w.-]*)['’]s\s*$/.exec(l);
    if (pos) return [l.slice(0, pos.index) + pos[1], r.replace(/^\s*(?:price\s+)?range/i, '')];
    const the = /\s+in\s+the\s*$/i.exec(l);
    return the ? [l.slice(0, the.index), r.replace(/^\s*(?:price\s+)?range/i, '')] : null;
  },
  // "add $X and 1–2 weeks of …" → "add 1–2 weeks of …": a conjunction that only joined the amount to a duration
  (l, r) => (/(?<![A-Za-zÀ-ɏ])(?:add|adds|adding|plus)\s*$/i.test(l) && /^\s*(?:and|et|y|и|và)\s+(?=[0-9])/i.test(r)
    ? [l, ' ' + r.replace(/^\s*(?:and|et|y|и|và)\s+/i, '')] : null),
  // zh "费用通常为 $X（工期 8–10 周）" → "通常需要 8–10 周"; "许可证费用为 $X（审批 3–5 周）" → "许可证审批需要 3–5 周";
  // "表面翻新起价 $X（3–4 周）" → "表面翻新需要 3–4 周"; "通常需要 $X（工期 8–10 周）" → "通常需要 8–10 周"
  (l, r) => {
    const m = /(?:费用|費用|造价|造價|售价|售價)?(通常|一般)?(?:需要|需|约为|約為|为|為|约|約|起价为|起價為|起价|起價)\s*$/.exec(l);
    const t = /^\s*（\s*(工期|施工期|审批|審批)?\s*([^（）]*?)\s*）/.exec(r);
    if (!m || !t || !SHORT_DUR.test(t[2])) return null;
    const head = l.slice(0, m.index) + (m[1] ?? '');
    const verb = t[1] && /审批|審批/.test(t[1]) ? `${t[1]}需要 ` : '需要 ';
    return [head + verb, t[2] + r.slice(t[0].length)];
  },
  // zh "标准更新——…——费用为 $X，需要 2 至 3 周" / zh-Hant "標準翻新（…）約 $X，工期 2–3 周":
  // the subject stays, the cost words go ("——" already separates it, so no comma after it)
  (l, r) => {
    const m = /(?:的)?(?:费用|費用|售价|售價|价格|價格|造价|造價)?(?:通常|一般)?(?:大约|大約|约|約)?(?:为|為|是)?\s*$/.exec(l);
    const t = /^\s*[，,]\s*(?=需要|工期|需時|需时|耗时|耗時|施工期)/.exec(r);
    if (!m || !m[0].trim() || !t) return null;
    const head = l.slice(0, m.index).replace(/\s+$/, '');
    return [head + (/[—–]$/.test(head) ? '' : '，'), r.slice(t[0].length)];
  },
  // zh "会额外增加 $X 费用和 1–2 周的水管工程量" → "会额外增加 1–2 周的水管工程量"
  (l, r) => (/^\s*(?:的)?(?:费用|費用)(?:和|及|与|與)\s*/.test(r) ? [l.replace(/\s+$/, ' '), r.replace(/^\s*(?:的)?(?:费用|費用)(?:和|及|与|與)\s*/, '')] : null),
  // zh-Hant "在2-3周內以 $X 的預算完成" → "在2-3周內完成"
  (l, r) => (/(?:以|用)\s*$/.test(l) && /^\s*的(?:预算|預算)/.test(r) ? [l.replace(/\s*(?:以|用)\s*$/, ''), r.replace(/^\s*的(?:预算|預算)/, '')] : null),
  // Project cards: "Completed within 2–3 weeks and a $X budget, …" / "spanned 4–5 months with a $X investment,"
  // → "Completed within 2–3 weeks, …" — the budget phrase only carried the amount (every locale's copy)
  (l, r) => {
    const pairs: Array<[RegExp, RegExp]> = [
      [/\s+(?:and|with|on|for)\s+(?:a|an)\s*$/i, /^\s*(?:total\s+)?(?:budget|investment|price tag)\b/i],
      [/\s+(?:at\s+)?isang\s*$/i, /^\s*na\s+(?:budget|badyet|pamumuhunan)\b/i],
      [/\s+(?:और|तथा)\s*$/, /^\s*(?:के|का|की)\s+(?:बजट|निवेश)(?:\s+(?:में|पर|से))?/],
      [/\s+(?:ਅਤੇ)\s*$/, /^\s*(?:ਦੇ|ਦਾ|ਦੀ)\s+(?:ਬਜਟ|ਨਿਵੇਸ਼)(?:\s+(?:ਵਿੱਚ|ਨਾਲ))?/],
      [/\s*(?:,?\s*(?:и\s+)?с\s+(?:бюджетом|инвестициями)(?:\s+в(?:\s+размере)?)?)\s*$/i, /^(?:\s*долларов(?:\s+США)?)?/i],
      [/\s+و?(?:بميزانية|باستثمار)(?:\s+(?:قدره|تتراوح|تبلغ))?(?:\s+ما)?(?:\s+بين)?\s*$/, /^/],
      [/\s+(?:و\s+)?(?:بودجه|با\s+سرمایه\s*گذاری|با\s+سرمایه‌گذاری)\s*$/, /^/],
    ];
    for (const [lead, tail] of pairs) {
      const m = lead.exec(l);
      const t = m && tail.exec(r);
      if (m && t) return [l.slice(0, m.index), r.slice(t[0].length)];
    }
    return null;
  },
  // ar "(…) يتراوح بين X و Y دولار في 2-3 أسابيع" → "(…) يستغرق 2-3 أسابيع"
  (l, r) => {
    const m = /\s*(?:ي|ت)تراوح\s+(?:ما\s+)?(?:بين|من)\s*$/.exec(l);
    const t = /^\s*(?:في|خلال)\s+(?=[0-9٠-٩])/.exec(r);
    return m && t ? [l.slice(0, m.index) + ' يستغرق ', r.slice(t[0].length)] : null;
  },
  // tl "ay nagkakahalaga ng $X at tumatagal ng 2–3 linggo" → "ay tumatagal ng 2–3 linggo"
  (l, r) => (/\s*nagkakahalaga\s+ng\s*$/i.test(l) && /^\s*at\s+(?=\S)/i.test(r)
    ? [l.replace(/\s*nagkakahalaga\s+ng\s*$/i, ''), ' ' + r.replace(/^\s*at\s+/i, '')] : null),
  // pa "— $X ਵਿੱਚ ਆਉਂਦੀ ਹੈ ਅਤੇ 2–3 ਹਫ਼ਤੇ ਲੈਂਦੀ ਹੈ" → "— 2–3 ਹਫ਼ਤੇ ਲੈਂਦੀ ਹੈ"
  (l, r) => {
    const t = /^\s*ਵਿੱਚ\s+(?:ਆਉਂਦੀ|ਆਉਂਦਾ|ਪੈਂਦੀ|ਪੈਂਦਾ|ਹੁੰਦੀ|ਹੁੰਦਾ)\s+ਹੈ\s+ਅਤੇ\s+/.exec(r);
    return t ? [l, ' ' + r.slice(t[0].length)] : null;
  },
  // hi "- $X तक चलता है और इसमें 2-3 सप्ताह लगते हैं" → "- इसमें 2-3 सप्ताह लगते हैं"
  (l, r) => {
    const t = /^\s*(?:तक\s+)?(?:चलता|चलती|होता|होती)\s+है\s+और\s+(?=इसमें|इसे)/.exec(r);
    return t ? [l, ' ' + r.slice(t[0].length)] : null;
  },
  // ar "يكلف ما بين X ويستغرق …" / "تبلغ تكلفة S ما بين X ويستغرق …" → "… يستغرق …" / "S يستغرق …"
  (l, r) => {
    const t = /^\s*و(يستغرق|تستغرق)(?=\s)/.exec(r);
    if (!t) return null;
    const head = l.replace(PRICE_LEAD, '').replace(/(^|[.،:]\s*|\s[-—–]\s*)تبلغ\s+تكلفة\s+/, '$1');
    return [head, ' ' + t[1] + r.slice(t[0].length)];
  },
  // fa "بین X دلار هزینه دارد و ۲ تا ۳ هفته طول می‌کشد" → "۲ تا ۳ هفته طول می‌کشد"
  (l, r) => {
    const t = /^\s*هزینه\s+دارد\s+و\s+/.exec(r);
    return t ? [l.replace(/\s*(?:بین|حدود|از)\s*$/, ''), ' ' + r.slice(t[0].length)] : null;
  },
  // A sentence that OPENS with the amount phrase before a duration ("D'un coût compris entre X et Y $ sur
  // 9 à 11 semaines, le projet …"): the cost phrase goes and the duration opens the sentence.
  (l, r) => {
    const m = /(^|[.!?]\s+)(?:D['’]un\s+coût\s+(?:compris\s+entre|de)|Với\s+mức\s+giá(?:\s+từ)?|بقيمة(?:\s+تتراوح)?(?:\s+ما)?(?:\s+بين)?|با\s+قیمت|Por\s+un\s+(?:costo|coste)\s+de|At\s+a\s+cost\s+of)\s*$/i.exec(l);
    if (!m || !/^\s*(?:sur|en|pendant|trong(?:\s+vòng)?|على\s+مدار|خلال|طی|در|durante|en|over|in)\s/i.test(r)) return null;
    const rest = r.trimStart();
    return [l.slice(0, m.index) + m[1], rest.charAt(0).toUpperCase() + rest.slice(1)];
  },
  // ru "Проект стоимостью X долларов в течение 9–11 недель" → "Проект в течение 9–11 недель"
  (l, r) => (/\s*стоимостью\s*$/i.test(l) && /^\s*(?:в течение|за)\s/i.test(r) ? [l.replace(/\s*стоимостью\s*$/i, ''), r] : null),
  // hi / pa "9-11 सप्ताहों में $X पर, …" / "9-11 ਹਫ਼ਤਿਆਂ ਵਿੱਚ $X ਵਿੱਚ, …" → "9-11 सप्ताहों में, …"
  (l, r) => (/^\s*(?:पर|में|ਵਿੱਚ|ਤੇ|'ਤੇ)\s*[,،]/.test(r) ? [l.replace(/\s+$/, ''), r.replace(/^\s*(?:पर|में|ਵਿੱਚ|ਤੇ|'ਤੇ)\s*/, '')] : null),
  // ko "S 비용은 2~3주에 $X입니다" → "S 기간은 2~3주입니다"
  (l, r) => {
    const m = new RegExp(String.raw`비용(?:은|이)\s*(${KO_DUR})에\s*$`).exec(l);
    return m && /^\s*(?:입니다|이다)/.test(r) ? [l.slice(0, m.index) + `기간은 ${m[1]}`, r.trimStart()] : null;
  },
  // ko "3~5주가 걸리며 비용은 $X입니다" → "3~5주가 걸립니다"
  (l, r) => {
    const m = /(\S)(으)?며\s+(?:총\s*)?비용(?:은|이)\s*$/.exec(l);
    const t = /^\s*(?:입니다|이다)/.exec(r);
    if (!m || !t) return null;
    const verb = m[2] ? m[1] + '습니다' : (addFinalB(m[1]) ?? null);
    if (!verb) return null;
    return [l.slice(0, m.index) + (m[2] ? verb : verb + '니다'), r.slice(t[0].length)];
  },
  // ko "총 $X의 [프로젝트]" → "[프로젝트]"
  (l, r) => (/(?:^|\s)총\s*$/.test(l) && /^의(?=\s)/.test(r) ? [l.replace(/\s*총\s*$/, ''), r.slice(1)] : null),
  // ja "2 ～ 3 週間で 20,000 ～ 25,000 ドルかかります" → "2 ～ 3 週間かかります"
  (l, r) => (/(?:週間|か月|ヶ月|日)で\s*$/.test(l) && /^\s*かか/.test(r) ? [l.replace(/で\s*$/, ''), r.trimStart()] : null),
  // ja "3 ～ 5 週間かかり、費用は 26,000 ～ 32,000 ドルです" → "3 ～ 5 週間かかります"
  (l, r) => {
    const m = /(\S)、\s*費用は\s*$/.exec(l);
    const t = /^\s*(?:です|となります)/.exec(r);
    return m && t && /[りきしちにびみいえけせてねべめれ]/.test(m[1]) ? [l.slice(0, m.index) + m[1] + 'ます', r.slice(t[0].length)] : null;
  },
  // zh "在 2-3 周内花费 20,000-25,000 加元" → "在 2-3 周内完成"
  (l, r) => {
    const m = /([周週])([内內])(?:花[费費]|耗[资資])\s*$/.exec(l);
    return m ? [l.slice(0, m.index) + `${m[1]}${m[2]}完成`, r] : null;
  },
  // ja "6 ～ 8 週間で総額 40,000 ドルかけて完了" → "6 ～ 8 週間で完了"
  (l, r) => (/総額\s*$/.test(l) && /^\s*(?:を)?かけて/.test(r) ? [l.replace(/総額\s*$/, ''), r.replace(/^\s*(?:を)?かけて/, '')] : null),
  // hi "6-8 सप्ताह में कुल $X का [परियोजना]" → "6-8 सप्ताह में [परियोजना]"
  (l, r) => (/(?:^|\s)कुल\s*$/.test(l) && /^\s*का\s/.test(r) ? [l.replace(/\s*कुल\s*$/, ' '), r.replace(/^\s*का\s/, '')] : null),
  // pa "$X ਦੀ ਕੁੱਲ ਮਿਲਾ ਕੇ ਇੱਕ [ਪ੍ਰੋਜੈਕਟ]" → "ਇੱਕ [ਪ੍ਰੋਜੈਕਟ]"
  (l, r) => (/^\s*ਦੀ\s+ਕੁੱਲ\s+ਮਿਲਾ\s+ਕੇ\s/.test(r) ? [l, r.replace(/^\s*ਦੀ\s+ਕੁੱਲ\s+ਮਿਲਾ\s+ਕੇ/, '')] : null),
  // "Pricing: $X from luxury …" (pa/hi word order): the range word after a label goes with the amount
  // — and a label that NAMES the price ("ਅਸਲ … ਪ੍ਰੋਜੈਕਟ ਦੀ ਕੀਮਤ:" = "real project pricing:") goes with it (task 152)
  (l, r) => {
    if (!/[:：]\s*$/.test(l) || !/^\s*(?:ਤੋਂ|से)\s/.test(r)) return null;
    const rest = r.replace(/^\s*(?:ਤੋਂ|से)\s*/, '');
    const label = /(^|\n|[.!?।]\s+)([^\n.!?।:：]*(?:ਦੀ\s+ਕੀਮਤ|ਕੀਮਤਾਂ|की\s+कीमत|कीमतें|मूल्य\s+निर्धारण)[^\n.!?।:：]*)[:：]\s*$/.exec(l);
    return label ? [l.slice(0, label.index) + label[1], rest] : [l, ' ' + rest];
  },
  // "typically costs $X (8–10 weeks)" → "typically takes 8–10 weeks"; zh "为 $X（2–3 周）" → "需要 2–3 周"
  (l, r) => {
    const m = /(?<![A-Za-z])(costs|cost|runs|run)\s*$/i.exec(l);
    const t = /^\s*\(([^()]*)\)/.exec(r);
    if (!m || !t || !SHORT_DUR.test(t[1])) return null;
    // "Township permit fees … run $X (3–5 weeks processing)" → "Township permits … take 3–5 weeks processing"
    const subject = l.slice(0, m.index).replace(/\bpermit fees\b/i, 'permits');
    return [subject + (/s$/i.test(m[1]) ? 'takes' : 'take'), ` ${t[1].trim()}${r.slice(t[0].length)}`];
  },
  // zh "为 $X（2–3 周）" → "需要 2–3 周": see the task 152 zh rule above (it also drops 费用 / 工期 / 起价)
  // ko "(…5~6주)부터 사용자 정의 레이아웃의 경우 $35,000+까지" → "(…5~6주)": the "from … to $Y" half goes
  (l, r) => {
    const m = /[)）]\s*부터[^()（）]*$/.exec(l);
    const t = /^\s*(?:이상\s*)?까지/.exec(r);
    return m && t ? [l.slice(0, m.index + 1), r.slice(t[0].length).replace(/^입니다/, '')] : null;
  },
  // es / fr / ru / vi "costs $X in 2–3 weeks" → "is completed in 2–3 weeks"
  (l, r) => (/(?<![A-Za-zÀ-ɏ])cuestan?\s+(?:entre\s+)?$/i.test(l) && /^\s*en\s/.test(r) ? [l.replace(/cuestan?\s+(?:entre\s+)?$/i, 'se completa'), r] : null),
  (l, r) => (/(?<![A-Za-zÀ-ɏ])coûte(?:nt)?\s+(?:entre\s+)?$/i.test(l) && /^\s*en\s/.test(r) ? [l.replace(/coûte(?:nt)?\s+(?:entre\s+)?$/i, 'se réalise'), r] : null),
  (l, r) => (/(?:^|\s)стоит\s*$/i.test(l) && /^\s*за\s/.test(r) ? [l.replace(/стоит\s*$/i, 'выполняется'), r] : null),
  (l, r) => (/(?:^|\s)dao động\s*$/i.test(l) && /^\s*trong\s/.test(r) ? [l.replace(/dao động\s*$/i, 'hoàn thành'), r] : null),
  // "and costs $X." at the end of a sentence: the whole coordinated cost predicate goes
  (l, r) => {
    const m = /\s+(?:y\s+cuestan?(?:\s+entre)?|et\s+coûte(?:nt)?(?:\s+entre)?|и\s+стоит|at\s+nagkakahalaga\s+ng|và\s+có\s+giá)\s*$/i.exec(l);
    return m && /^\s*(?:[.!?]|$)/.test(r) ? [l.slice(0, m.index), r.trimStart()] : null;
  },
  // tl "ay nagtatakbo ng $X sa loob ng 2–3 linggo" → "ay nagtatakbo sa loob ng 2–3 linggo"
  (l, r) => (/\s+ng\s*$/.test(l) && /^\s*sa\s+loob\s+ng\s/.test(r) ? [l.replace(/\s+ng\s*$/, ''), r] : null),
  // hi / pa "और इसकी लागत $X होती है" → (gone); "2-3 सप्ताह में $X तक चलता है" → "2-3 सप्ताह में चलता है"
  (l, r) => {
    const m = /\s*(?:और|ਅਤੇ)\s+(?:इसकी\s+|ਇਸਦੀ\s+)?(?:लागत|ਕੀਮਤ)\s*$/.exec(l);
    const t = /^\s*(?:होती|होता|ਹੁੰਦੀ|ਹੁੰਦਾ)\s+(?:है|ਹੈ)/.exec(r);
    return m && t ? [l.slice(0, m.index), r.slice(t[0].length)] : null;
  },
  (l, r) => (/(?:में|ਵਿੱਚ)\s*$/.test(l) && /^\s*(?:तक|ਤੱਕ)\s/.test(r) ? [l, r.replace(/^\s*(?:तक|ਤੱਕ)/, '')] : null),
  // fa "و ۲۶,۰۰۰ تا ۳۲,۰۰۰ دلار هزینه دارد" → (gone); "X دلار در ۲ تا ۳ هفته هزینه دارد" → "در ۲ تا ۳ هفته انجام می‌شود"
  (l, r) => {
    const t = /^\s*هزینه\s+دارد/.exec(r);
    const m = /\s+و\s*$/.exec(l);
    return m && t ? [l.slice(0, m.index), r.slice(t[0].length)] : null;
  },
  (l, r) => {
    const t = /^(\s*در\s+[0-9۰-۹]+(?:\s*(?:تا|-|–)\s*[0-9۰-۹]+)?\s*(?:هفته|ماه|روز))\s+هزینه\s+دارد/.exec(r);
    return t ? [l, `${t[1]} انجام می‌شود${r.slice(t[0].length)}`] : null;
  },
  // "costs $X and takes 2–3 weeks" (en/fr/es/ru/vi): the cost verb goes, the duration verb stays (task 151b)
  (l, r) => {
    const m = /\s*(?<![A-Za-zÀ-ɏ])(?:costs?|coûte(?:nt)?|cuestan?|стоит|có giá)(?:\s+(?:entre|between))?\s*$/i.exec(l);
    const t = /^\s*(?:and|et|y|и|và)\s+(?=\S)/i.exec(r);
    return m && t ? [l.slice(0, m.index), ' ' + r.slice(t[0].length)] : null;
  },
  // fr / vi "… 2 à 3 semaines et avec un budget de $X, la rénovation" → "… 2 à 3 semaines, la rénovation"
  (l, r) => {
    const m = /\s*(?:(?<![A-Za-zÀ-ɏ])et\s+)?avec\s+un\s+(?:budget|investissement)\s+(?:compris\s+entre|de)\s*$|\s*với\s+(?:khoản\s+đầu\s+tư|ngân\s+sách)(?:\s+từ)?\s*$/i.exec(l);
    return m && /^\s*(?:[,.;]|$)/.test(r) ? [l.slice(0, m.index), r.trimStart()] : null;
  },
  // hi "एनसुइट की लागत $X है और इसमें 3-5 सप्ताह लगते हैं" → "एनसुइट में 3-5 सप्ताह लगते हैं"
  (l, r) => {
    const m = /\s*की\s+लागत\s*$/.exec(l);
    const t = /^\s*है\s+और\s+इसमें\s+/.exec(r);
    return m && t ? [l.slice(0, m.index) + ' में ', r.slice(t[0].length)] : null;
  },
];

/** Repair the two sides of one cut. */
export function joinAroundCut(left: string, right: string): string {
  for (const rule of JOINS) {
    const hit = rule(left, right);
    if (hit) return tidyJoin(hit[0], hit[1]);
  }
  const l = left.replace(PRICE_LEAD, '');
  let r = right;
  // ko genitive / ja-zh enumeration comma that only attached the amount: "**라벨:** $X、2～3 週間"
  if (/[:：](?:\*\*|__)?\s*$/.test(l)) r = r.replace(/^\s*[、,，]\s*/, ' ');
  if (/^의\s/.test(r)) r = r.slice(1);
  return tidyJoin(l, r);
}

function tidyJoin(l: string, r: string): string {
  if (/\s$/.test(l) && /^\s/.test(r)) r = r.trimStart();
  return l + r;
}

// ---------------------------------------------------------------------------
// A price range whose only duration is a note on one of its amounts
// ---------------------------------------------------------------------------
const PAREN = /[(（]([^()（）]*)[)）]/g;
/** The word that makes two amounts ONE range ("from $X (…) to $Y"), in every locale's copy. */
const RANGE_WORD = /(?<![\p{L}\p{M}])(?:to|à|hasta|до|đến|hanggang|bis|إلى|تا|से|ਤੋਂ)(?![\p{L}\p{M}])|到|至|から|부터|에서|〜|(?:^|\s)[-–—~～](?:\s|$)/u;
/** A markdown link — also the "[text] (/url/)" some translations wrote with a space. */
const LINK = /\[[^\]]+\]\s?\([^)]*\)[A-Za-z]*/g;
const HAS_LINK = /\[[^\]]+\]\s?\([^)]*\)/;
const RANGE_LEAD = /\s*(?:from|desde|de|à partir de|从|從|价格从|價格從|từ|mula|يتراوح من|من|از|от)\s*$/i;

/**
 * "Pricing: [bathroom renovation](…)s from $18,000–$21,000 (3-4 weeks, custom glass) to $35,000+
 * for full suites." states its duration only as a note on an amount. Cutting the amounts leaves
 * "from (3-4 weeks …) to for full suites" in every language, so the sentence is rebuilt as
 * "[bathroom renovation](…)s: 3-4 weeks, custom glass." Returns null when the sentence is not
 * of that shape (a duration outside the notes, or a note that does not follow an amount).
 */
export function salvageRangeNotes(
  sentence: string,
  hits: ReadonlyArray<{ start: number; end: number }>,
  hasDuration: (s: string) => boolean,
): string | null {
  if (!hits.length) return null;
  const parens = [...sentence.matchAll(PAREN)].map((m) => ({ s: m.index ?? 0, e: (m.index ?? 0) + m[0].length, inner: m[1] }));
  const notes = parens.filter((p) => hasDuration(p.inner) && !hits.some((h) => h.start >= p.s && h.end <= p.e));
  if (!notes.length) return null;
  let outside = sentence;
  for (const p of [...parens].reverse()) outside = outside.slice(0, p.s) + outside.slice(p.e);
  if (hasDuration(outside)) return null;
  const follows = (p: { s: number }) => hits.some((h) => h.end <= p.s && /^[\s~～]*(?:不等)?[\s~～]*$/.test(sentence.slice(h.end, p.s)));
  if (!notes.every(follows)) return null;
  // a range ("from $X (…) to $Y") or a linked service name: one plain "costs $X (8–10 weeks)" is a JOINS case
  const before0 = sentence.slice(0, Math.min(...hits.map((h) => h.start)));
  if (hits.length < 2 && !HAS_LINK.test(before0)) return null;
  // "costs $X (8–10 weeks); converting … runs $Y (6–8 weeks)" is two clauses, not one range (task 151b)
  // — and so is "costs $X (8–10 weeks), while … runs $Y (6–8 weeks)": any clause separator in the
  // text BETWEEN the amounts (outside notes; the amounts' own thousands commas are not looked at)
  const sorted = [...hits].sort((x, y) => x.start - y.start);
  const gaps = sorted.slice(1).map((h, i) => sentence.slice(sorted[i].end, h.start).replace(PAREN, '')).join(' ');
  if (/[;；]/.test(gaps)) return null;
  if (hits.length >= 2 && !RANGE_WORD.test(gaps)) return null;

  const first = Math.min(...hits.map((h) => h.start));
  const before = sentence.slice(0, first);
  const links = [...before.matchAll(LINK)];
  let head = links.length
    ? links[links.length - 1][0]
    : before.replace(/^[^[*]*[:：]\s*(?=\S)/, '').replace(RANGE_LEAD, '');
  head = head.trim();

  const last = notes[notes.length - 1];
  const end = /[.!?。！？।۔؟]\s*$/.exec(sentence)?.[0].trim() ?? '';
  const tail = sentence.slice(last.e).replace(/[.!?。！？।۔؟]\s*$/, '');
  const keepTail = /^\s*[—–]\s/.test(tail) && !hits.some((h) => h.start >= last.e) ? tail : '';
  const cjk = /[぀-ヿ㐀-鿿]/.test(notes.map((n) => n.inner).join(''));
  const body = notes.map((n) => n.inner.trim()).join(cjk ? '；' : '; ');
  return (head ? head + (cjk ? '：' : ': ') + body : body) + keepTail + end;
}

// ---------------------------------------------------------------------------
// "costs $X for … (8–10 weeks), or $Y to … (6–8 weeks)" — task 152
// ---------------------------------------------------------------------------
const NOTE_PHRASE = String.raw`([^()（）.;:!?]{1,90}?)\s*\(([^()]*)\)`;
const COST_VERB = /(?<![A-Za-z])(cost ranges from|costs?|runs?|ranges? from)\s*$/i;

/**
 * "A legal secondary suite typically costs $65K–$95K for a standard conversion (8–10 weeks), or
 * $45K–$70K to convert a finished basement (6–8 weeks)." — each amount is followed by what it buys and
 * that job's duration. Cutting the amounts leaves "typically for a standard conversion (8–10 weeks)";
 * the sentence is rebuilt as "typically takes 8–10 weeks for a standard conversion, or 6–8 weeks to
 * convert a finished basement." Returns null unless EVERY amount has that shape and the verb is a
 * cost verb.
 */
export function rewriteNotedAmounts(
  sentence: string,
  hits: ReadonlyArray<{ start: number; end: number }>,
  hasDuration: (s: string) => boolean,
): string | null {
  if (!hits.length) return null;
  const sorted = [...hits].sort((a, b) => a.start - b.start);
  const verb = COST_VERB.exec(sentence.slice(0, sorted[0].start));
  if (!verb) return null;
  const parts: string[] = [];
  let at = sorted[0].start;
  for (let i = 0; i < sorted.length; i++) {
    const h = sorted[i];
    const glue = sentence.slice(at, h.start);
    if (i > 0 && !/^\s*,?\s*(?:or|and|to|while|whereas)\s+$/i.test(glue)) return null;
    const m = new RegExp('^' + NOTE_PHRASE).exec(sentence.slice(h.end));
    if (!m || !hasDuration(m[2]) || hits.some((x) => x.start > h.end && x.start < h.end + m[0].length)) return null;
    const dur = m[2].trim();
    const phrase = m[1].trim();
    parts.push((i > 0 ? glue.replace(/\s+$/, ' ') : '') + `${dur} ${phrase}`);
    at = h.end + m[0].length;
  }
  const v = verb[1].toLowerCase();
  const newVerb = v === 'cost ranges from' ? 'time ranges from' : /ranges? from/.test(v) ? v : /s$/.test(v) ? 'takes' : 'take';
  let body = parts.join('');
  if (/ranges? from$/.test(newVerb)) body = body.replace(/,?\s+or\s+/i, ' to ');
  return sentence.slice(0, verb.index) + newVerb + ' ' + body + sentence.slice(at);
}
