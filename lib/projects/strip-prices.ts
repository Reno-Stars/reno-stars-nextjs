/**
 * Project-area price-copy filter (part 1b — Ryan 11-24 11:32 / 14:41, Captain
 * 11-24 15:45 option d).
 *
 * #403 removed the template-level prices (Budget cell, offers, filter, budget
 * pages). What remained was COPY: 11 project records whose description /
 * meta_description / one FAQ quote a price, in up to 14 languages. The admin
 * cannot edit 12 of those languages and the database is off-limits, so the
 * projects routes run every project/site through this filter before the data
 * reaches metadata, JSON-LD, components or the RSC payload.
 *
 * Two layers, applied in order:
 *  1. SENTENCE_RULES — exact sentence (or clause) rewrites for the known copy,
 *     whitespace-insensitive. en / zh / zh-Hant come verbatim from the spec CSV
 *     (current_text -> replacement); the other 8 languages delete only the price
 *     clause, keeping the language's own wording. Durations are never touched.
 *  2. A generic fallback for anything the table does not know: delete common
 *     price clauses ("under $27K", "within a $X budget"), then drop any
 *     sentence that still carries an amount — an unseen price must never ship.
 *
 * Never touched: "$$" (no digits), insurance amounts ("$5M CGL", "500 万加元的
 * CGL 保险" — an amount followed by an insurance word is skipped), years,
 * sizes, counts, durations, phone numbers, PO numbers (none carries a currency).
 *
 * USE ONLY IN THE /projects/ ROUTES. Shared helpers (getLocalizedProject,
 * service-page cards, ProjectModal, queries) keep their behaviour: the service
 * and service × city pages — test A included — must render byte-identically.
 */
import type { Block, FaqBlock } from '@/lib/blocks/types';

interface SentenceRule {
  lang: string;
  src: string;
  dst: string;
}

/** Generated from the spec CSV (en/zh/zh-Hant) + reviewed clause deletions (8 more languages). */
export const SENTENCE_RULES: readonly SentenceRule[] = [
  { lang: "en", src: "Completed in 2-3 weeks for $23K–$25K.", dst: "Completed in 2-3 weeks." },
  { lang: "en", src: "Completed within 2–3 weeks and a $23,000–$25,000 budget, the renovation helped the business reopen with an upgraded storefront.", dst: "Completed within 2–3 weeks, the renovation helped the business reopen with an upgraded storefront." },
  { lang: "zh", src: "2-3 周内完成，花费 23,000 加元至 25,000 加元。", dst: "2-3 周内完成。" },
  { lang: "zh", src: "翻新工程在 2 至 3 周内完成，预算为 23,000 至 25,000 加元，通过升级店面帮助企业重新开业。", dst: "翻新工程在 2 至 3 周内完成，通过升级店面帮助企业重新开业。" },
  { lang: "zh-Hant", src: "在2-3周內以$23,000–$25,000的預算完成，翻新幫助商家以升級後的店面重新開業。", dst: "在2-3周內完成，翻新幫助商家以升級後的店面重新開業。" },
  { lang: "en", src: "$17K–$20K budget.", dst: "" },
  { lang: "zh", src: "预算为 17,000 加元至 20,000 加元。", dst: "" },
  { lang: "en", src: "$28K–$30K budget.", dst: "" },
  { lang: "zh", src: "预算为 28,000 加元至 30,000 加元。", dst: "" },
  { lang: "en", src: "$32K–$35K project completed in 3-4 weeks.", dst: "Completed in 3-4 weeks." },
  { lang: "zh", src: "32K-35K 加元的项目在 3-4 周内完成。", dst: "项目在 3-4 周内完成。" },
  { lang: "en", src: "$33K–$35K in 6-8 weeks.", dst: "Completed in 6-8 weeks." },
  { lang: "zh", src: "6-8 周内 33,000 加元至 35,000 加元。", dst: "6-8 周内完成。" },
  { lang: "en", src: "$25K–$27K completed in 4-5 weeks.", dst: "Completed in 4-5 weeks." },
  { lang: "zh", src: "4-5 周内完成 25K-27K 加元。", dst: "4-5 周内完成。" },
  { lang: "en", src: "Coquitlam condo kitchen renovation under $27K — fresh cabinets, quartz countertops, vinyl plank floors, and upgraded lighting.", dst: "Coquitlam condo kitchen renovation — fresh cabinets, quartz countertops, vinyl plank floors, and upgraded lighting." },
  { lang: "en", src: "This budget-friendly kitchen renovation in a Coquitlam condo delivered a dramatic transformation within a $25,000–$27,000 budget.", dst: "This budget-friendly kitchen renovation in a Coquitlam condo delivered a dramatic transformation." },
  { lang: "zh", src: "高贵林公寓厨房翻新费用低于 2.7 万加元——全新橱柜、石英台面、乙烯基木板地板和升级照明。", dst: "高贵林公寓厨房翻新——全新橱柜、石英台面、乙烯基木板地板和升级照明。" },
  { lang: "zh", src: "Coquitlam 公寓的厨房改造经济实惠，在 25,000 至 27,000 加元的预算内实现了巨大的转变。", dst: "Coquitlam 公寓的厨房改造经济实惠，实现了巨大的转变。" },
  { lang: "zh-Hant", src: "高貴林公寓這次經濟實惠的廚房翻新在$25,000–$27,000的預算內實現了驚豔的轉變。", dst: "高貴林公寓這次經濟實惠的廚房翻新實現了驚豔的轉變。" },
  { lang: "en", src: "$345K–$360K investment over 4-5 months.", dst: "Completed over 4-5 months." },
  { lang: "en", src: "The project spanned 4–5 months with a $345,000–$360,000 investment, covering a complete interior redesign.", dst: "The project spanned 4–5 months and covered a complete interior redesign." },
  { lang: "zh", src: "4-5 个月内投资 34.5 万至 36 万加元。", dst: "历时 4-5 个月完成。" },
  { lang: "zh", src: "该项目历时 4 至 5 个月，投资 345,000 至 360,000 加元，包括全面的室内重新设计。", dst: "该项目历时 4 至 5 个月，包括全面的室内重新设计。" },
  { lang: "zh-Hant", src: "項目歷時4-5個月，投資$345,000–$360,000，涵蓋完整的室內重新設計。", dst: "項目歷時4-5個月，涵蓋完整的室內重新設計。" },
  { lang: "en", src: "$42K–$45K.", dst: "" },
  { lang: "en", src: "Despite a premium finish, careful material selection kept the project within the $42,000–$45,000 budget while delivering a result that feels truly high-end.", dst: "Careful material selection delivered a result that feels truly high-end." },
  { lang: "zh", src: "42,000 加元–45,000 加元。", dst: "" },
  { lang: "zh", src: "尽管采用了优质的表面处理，但仔细的材料选择使该项目保持在 42,000 至 45,000 加元的预算范围内，同时提供了真正高端的结果。", dst: "精心的材料选择带来了真正高端的效果。" },
  { lang: "zh-Hant", src: "精心的材料選擇將項目控制在$42,000–$45,000的預算內，同時呈現出真正高端的效果。", dst: "精心的材料選擇呈現出真正高端的效果。" },
  { lang: "en", src: "Richmond condo transformed for under $28K — kitchen, bathroom, new flooring throughout.", dst: "Richmond condo transformed — kitchen, bathroom, new flooring throughout." },
  { lang: "en", src: "Working within a $26,000–$28,000 budget, we repainted all kitchen cabinets in crisp white, replaced laminate countertops with durable quartz, updated the bathroom vanity and fixtures, and installed light wood-tone vinyl plank flooring throughout the living areas.", dst: "We repainted all kitchen cabinets in crisp white, replaced laminate countertops with durable quartz, updated the bathroom vanity and fixtures, and installed light wood-tone vinyl plank flooring throughout the living areas." },
  { lang: "zh", src: "列治文公寓的改造费用不到 28,000 加元——厨房、浴室、全新地板。", dst: "列治文公寓改造——厨房、浴室、全新地板。" },
  { lang: "zh", src: "我们在 26,000 至 28,000 加元的预算范围内，将所有厨房橱柜重新粉刷成洁白，用耐用的石英更换了层压板台面，更新了浴室浴室柜和固定装置，并在整个起居区安装了浅色木色调乙烯基板地板。", dst: "我们将所有厨房橱柜重新粉刷成洁白，用耐用的石英更换了层压板台面，更新了浴室浴室柜和固定装置，并在整个起居区安装了浅色木色调乙烯基板地板。" },
  { lang: "zh-Hant", src: "在$26,000–$28,000的預算內，我們將廚房櫥櫃重新噴塗為清爽白色，將層壓板檯面更換為耐用石英石，更新了浴室櫃和潔具，並在整個起居區安裝了淺木紋乙烯基地板。", dst: "我們將廚房櫥櫃重新噴塗為清爽白色，將層壓板檯面更換為耐用石英石，更新了浴室櫃和潔具，並在整個起居區安裝了淺木紋乙烯基地板。" },
  { lang: "en", src: "$57K–$60K over 9-11 weeks.", dst: "Completed over 9-11 weeks." },
  { lang: "en", src: "Total budget: $57,000–$60,000.", dst: "" },
  { lang: "zh", src: "9-11 周内 5.7 万至 6 万加元。", dst: "9-11 周内完成。" },
  { lang: "zh", src: "该项目在 9 至 11 周内耗资 57,000 至 60,000 加元，通过将浴室容量增加一倍，为房屋显着增加了价值和实用性。", dst: "该项目历时 9 至 11 周，通过将浴室容量增加一倍，为房屋显着增加了价值和实用性。" },
  { lang: "zh-Hant", src: "項目投資$57,000–$60,000，歷時9-11周，通過將浴室容量翻倍為住宅增添了顯著的價值和實用性。", dst: "項目歷時9-11周，通過將浴室容量翻倍為住宅增添了顯著的價值和實用性。" },
  { lang: "pa", src: "2-3 ਹਫ਼ਤਿਆਂ ਦੇ ਅੰਦਰ ਅਤੇ $23,000–$25,000 ਦੇ ਬਜਟ ਵਿੱਚ ਪੂਰਾ ਹੋਇਆ, ਨਵੀਨੀਕਰਨ ਨੇ ਇੱਕ ਅੱਪਗ੍ਰੇਡ ਕੀਤੇ ਸਟੋਰਫਰੰਟ ਨਾਲ ਕਾਰੋਬਾਰ ਨੂੰ ਮੁੜ ਖੋਲ੍ਹਣ ਵਿੱਚ ਮਦਦ ਕੀਤੀ।", dst: "2-3 ਹਫ਼ਤਿਆਂ ਦੇ ਅੰਦਰ ਪੂਰਾ ਹੋਇਆ, ਨਵੀਨੀਕਰਨ ਨੇ ਇੱਕ ਅੱਪਗ੍ਰੇਡ ਕੀਤੇ ਸਟੋਰਫਰੰਟ ਨਾਲ ਕਾਰੋਬਾਰ ਨੂੰ ਮੁੜ ਖੋਲ੍ਹਣ ਵਿੱਚ ਮਦਦ ਕੀਤੀ।" },
  { lang: "pa", src: "Coquitlam ਕੰਡੋ ਵਿੱਚ ਇਸ ਬਜਟ-ਅਨੁਕੂਲ ਰਸੋਈ ਦੇ ਨਵੀਨੀਕਰਨ ਨੇ $25,000–$27,000 ਦੇ ਬਜਟ ਦੇ ਅੰਦਰ ਇੱਕ ਨਾਟਕੀ ਤਬਦੀਲੀ ਪ੍ਰਦਾਨ ਕੀਤੀ।", dst: "Coquitlam ਕੰਡੋ ਵਿੱਚ ਇਸ ਬਜਟ-ਅਨੁਕੂਲ ਰਸੋਈ ਦੇ ਨਵੀਨੀਕਰਨ ਨੇ ਇੱਕ ਨਾਟਕੀ ਤਬਦੀਲੀ ਪ੍ਰਦਾਨ ਕੀਤੀ।" },
  { lang: "pa", src: "ਇਹ ਪ੍ਰੋਜੈਕਟ $345,000–$360,000 ਦੇ ਨਿਵੇਸ਼ ਦੇ ਨਾਲ 4-5 ਮਹੀਨਿਆਂ ਵਿੱਚ ਫੈਲਿਆ, ਇੱਕ ਸੰਪੂਰਨ ਅੰਦਰੂਨੀ ਰੀਡਿਜ਼ਾਈਨ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।", dst: "ਇਹ ਪ੍ਰੋਜੈਕਟ 4-5 ਮਹੀਨਿਆਂ ਵਿੱਚ ਫੈਲਿਆ, ਇੱਕ ਸੰਪੂਰਨ ਅੰਦਰੂਨੀ ਰੀਡਿਜ਼ਾਈਨ ਨੂੰ ਕਵਰ ਕਰਦਾ ਹੈ।" },
  { lang: "pa", src: "ਪ੍ਰੀਮੀਅਮ ਮੁਕੰਮਲ ਹੋਣ ਦੇ ਬਾਵਜੂਦ, ਸਾਵਧਾਨੀਪੂਰਵਕ ਸਮੱਗਰੀ ਦੀ ਚੋਣ ਨੇ ਪ੍ਰੋਜੈਕਟ ਨੂੰ $42,000–$45,000 ਦੇ ਬਜਟ ਦੇ ਅੰਦਰ ਰੱਖਿਆ ਜਦੋਂ ਕਿ ਇੱਕ ਨਤੀਜਾ ਪ੍ਰਦਾਨ ਕੀਤਾ ਜੋ ਸੱਚਮੁੱਚ ਉੱਚ-ਅੰਤ ਦਾ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈ।", dst: "ਸਾਵਧਾਨੀਪੂਰਵਕ ਸਮੱਗਰੀ ਦੀ ਚੋਣ ਨੇ ਇੱਕ ਨਤੀਜਾ ਪ੍ਰਦਾਨ ਕੀਤਾ ਜੋ ਸੱਚਮੁੱਚ ਉੱਚ-ਅੰਤ ਦਾ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈ।" },
  { lang: "pa", src: "$26,000–$28,000 ਦੇ ਬਜਟ ਦੇ ਅੰਦਰ ਕੰਮ ਕਰਦੇ ਹੋਏ, ਅਸੀਂ", dst: "ਅਸੀਂ" },
  { lang: "pa", src: "9-11 ਹਫ਼ਤਿਆਂ ਵਿੱਚ $57,000–$60,000 ਵਿੱਚ, ਪ੍ਰੋਜੈਕਟ ਨੇ", dst: "9-11 ਹਫ਼ਤਿਆਂ ਵਿੱਚ, ਪ੍ਰੋਜੈਕਟ ਨੇ" },
  { lang: "tl", src: "Nakumpleto sa loob ng 2–3 linggo at isang $23,000–$25,000 na budget, nakatulong", dst: "Nakumpleto sa loob ng 2–3 linggo, nakatulong" },
  { lang: "tl", src: "naghatid ng isang dramatikong pagbabago sa loob ng $25,000–$27,000 na budget.", dst: "naghatid ng isang dramatikong pagbabago." },
  { lang: "tl", src: "Ang proyekto ay tumagal ng 4–5 na buwan na may $345,000–$360,000 na pamumuhunan, na sumasaklaw", dst: "Ang proyekto ay tumagal ng 4–5 na buwan, na sumasaklaw" },
  { lang: "tl", src: "Sa kabila ng isang premium na pagtatapos, ang maingat na pagpili ng materyal ay nagpapanatili sa proyekto sa loob ng $42,000–$45,000 na budget habang naghahatid ng isang resulta na tunay na high-end.", dst: "Ang maingat na pagpili ng materyal ay naghatid ng isang resulta na tunay na high-end." },
  { lang: "tl", src: "Gumagawa sa loob ng $26,000–$28,000 na budget, muling pininturahan namin", dst: "Muling pininturahan namin" },
  { lang: "tl", src: "Sa $57,000–$60,000 sa loob ng 9–11 na linggo, ang proyekto", dst: "Sa loob ng 9–11 na linggo, ang proyekto" },
  { lang: "fa", src: "این بازسازی که در عرض 2 تا 3 هفته و بودجه 23000 تا 25000 دلاری تکمیل شد،", dst: "این بازسازی که در عرض 2 تا 3 هفته تکمیل شد،" },
  { lang: "fa", src: "تحولی شگرف با بودجه 25000 تا 27000 دلاری ایجاد کرد.", dst: "تحولی شگرف ایجاد کرد." },
  { lang: "fa", src: "این پروژه 4 تا 5 ماه با سرمایه گذاری 345000 تا 360000 دلاری به طول انجامید", dst: "این پروژه 4 تا 5 ماه به طول انجامید" },
  { lang: "fa", src: "علیرغم پرداخت عالی، انتخاب دقیق متریال، پروژه را در بودجه 42000 تا 45000 دلاری نگه داشت و در عین حال نتیجه ای را ارائه داد که واقعاً عالی به نظر می رسید.", dst: "انتخاب دقیق متریال نتیجه ای را ارائه داد که واقعاً عالی به نظر می رسید." },
  { lang: "fa", src: "با بودجه 26000 تا 28000 دلاری، همه کابینت‌های آشپزخانه", dst: "همه کابینت‌های آشپزخانه" },
  { lang: "fa", src: "با قیمت 57000 تا 60000 دلار طی 9 تا 11 هفته، این پروژه", dst: "طی 9 تا 11 هفته، این پروژه" },
  { lang: "vi", src: "Hoàn thành trong vòng 2-3 tuần với ngân sách từ 23.000 đến 25.000 USD, việc cải tạo", dst: "Hoàn thành trong vòng 2-3 tuần, việc cải tạo" },
  { lang: "vi", src: "đã mang lại sự chuyển đổi mạnh mẽ với ngân sách từ 25.000–27.000 USD.", dst: "đã mang lại sự chuyển đổi mạnh mẽ." },
  { lang: "vi", src: "Dự án kéo dài 4–5 tháng với khoản đầu tư từ 345.000 đến 360.000 USD, bao gồm", dst: "Dự án kéo dài 4–5 tháng, bao gồm" },
  { lang: "vi", src: "Mặc dù có lớp hoàn thiện cao cấp nhưng việc lựa chọn vật liệu cẩn thận vẫn giữ cho dự án nằm trong ngân sách từ 42.000 đến 45.000 USD trong khi vẫn mang lại kết quả mang lại cảm giác thực sự cao cấp.", dst: "Việc lựa chọn vật liệu cẩn thận đã mang lại kết quả mang lại cảm giác thực sự cao cấp." },
  { lang: "vi", src: "Làm việc với ngân sách từ 26.000 đến 28.000 đô la, chúng tôi sơn lại", dst: "Chúng tôi sơn lại" },
  { lang: "vi", src: "Với mức giá từ 57.000–60.000 USD trong vòng 9–11 tuần, dự án", dst: "Trong vòng 9–11 tuần, dự án" },
  { lang: "ru", src: "Реконструкция, завершенная в течение 2–3 недель и с бюджетом в 23 000–25 000 долларов, помогла", dst: "Реконструкция, завершенная в течение 2–3 недель, помогла" },
  { lang: "ru", src: "привел к драматическим преобразованиям при бюджете в 25 000–27 000 долларов.", dst: "привел к драматическим преобразованиям." },
  { lang: "ru", src: "Проект длился 4–5 месяцев с инвестициями в размере 345 000–360 000 долларов США и включал", dst: "Проект длился 4–5 месяцев и включал" },
  { lang: "ru", src: "Несмотря на премиальную отделку, тщательный выбор материалов позволил проекту уложиться в бюджет в 42 000–45 000 долларов, обеспечив при этом результат, который кажется действительно высококачественным.", dst: "Тщательный выбор материалов обеспечил результат, который кажется действительно высококачественным." },
  { lang: "ru", src: "Работая в рамках бюджета в 26 000–28 000 долларов, мы перекрасили", dst: "Мы перекрасили" },
  { lang: "ru", src: "Проект стоимостью 57 000–60 000 долларов США в течение 9–11 недель значительно", dst: "Проект продолжительностью 9–11 недель значительно" },
  { lang: "ar", src: "تم الانتهاء من عملية التجديد في غضون 2-3 أسابيع وبميزانية تتراوح بين 23000 و25000 دولار، وساعدت", dst: "تم الانتهاء من عملية التجديد في غضون 2-3 أسابيع، وساعدت" },
  { lang: "ar", src: "إلى تحقيق تحول جذري في حدود ميزانية تتراوح بين 25000 و27000 دولار.", dst: "إلى تحقيق تحول جذري." },
  { lang: "ar", src: "امتد المشروع من 4 إلى 5 أشهر باستثمار قدره 345.000 إلى 360.000 دولار، يغطي", dst: "امتد المشروع من 4 إلى 5 أشهر، يغطي" },
  { lang: "ar", src: "على الرغم من التشطيب المتميز، إلا أن الاختيار الدقيق للمواد أبقى المشروع ضمن ميزانية تتراوح بين 42000 و45000 دولار أمريكي مع تقديم نتيجة تبدو راقية حقًا.", dst: "قدّم الاختيار الدقيق للمواد نتيجة تبدو راقية حقًا." },
  { lang: "ar", src: "من خلال العمل ضمن ميزانية قدرها 26000 إلى 28000 دولار، قمنا", dst: "قمنا" },
  { lang: "ar", src: "بقيمة تتراوح ما بين 57.000 إلى 60.000 دولار على مدار 9 إلى 11 أسبوعًا، أضاف", dst: "على مدار 9 إلى 11 أسبوعًا، أضاف" },
  { lang: "hi", src: "2-3 सप्ताह के भीतर पूरा हुआ और $23,000- $25,000 का बजट, नवीनीकरण", dst: "2-3 सप्ताह के भीतर पूरा हुआ, नवीनीकरण" },
  { lang: "hi", src: "ने $25,000-$27,000 के बजट के भीतर एक नाटकीय परिवर्तन लाया।", dst: "ने एक नाटकीय परिवर्तन लाया।" },
  { lang: "hi", src: "यह परियोजना $345,000-$360,000 के निवेश के साथ 4-5 महीनों तक चली,", dst: "यह परियोजना 4-5 महीनों तक चली," },
  { lang: "hi", src: "प्रीमियम फ़िनिश के बावजूद, सावधानीपूर्वक सामग्री चयन ने परियोजना को $42,000-$45,000 के बजट के भीतर रखा और ऐसा परिणाम दिया जो वास्तव में उच्च-स्तरीय लगता है।", dst: "सावधानीपूर्वक सामग्री चयन ने ऐसा परिणाम दिया जो वास्तव में उच्च-स्तरीय लगता है।" },
  { lang: "hi", src: "$26,000-$28,000 के बजट के भीतर काम करते हुए, हमने", dst: "हमने" },
  { lang: "hi", src: "9-11 सप्ताहों में $57,000-$60,000 पर, परियोजना ने", dst: "9-11 सप्ताहों में, परियोजना ने" },
  { lang: "fr", src: "Achevée en 2 à 3 semaines et avec un budget de 23 000 à 25 000 $, la rénovation", dst: "Achevée en 2 à 3 semaines, la rénovation" },
  { lang: "fr", src: "a apporté une transformation spectaculaire avec un budget de 25 000 $ à 27 000 $.", dst: "a apporté une transformation spectaculaire." },
  { lang: "fr", src: "Le projet a duré 4 à 5 mois avec un investissement de 345 000 à 360 000 $, couvrant", dst: "Le projet a duré 4 à 5 mois, couvrant" },
  { lang: "fr", src: "Malgré une finition haut de gamme, une sélection minutieuse des matériaux a permis au projet de respecter le budget de 42 000 à 45 000 $ tout en offrant un résultat vraiment haut de gamme.", dst: "Une sélection minutieuse des matériaux a permis d'offrir un résultat vraiment haut de gamme." },
  { lang: "fr", src: "Travaillant avec un budget de 26 000 à 28 000 $, nous avons repeint", dst: "Nous avons repeint" },
  { lang: "fr", src: "D'un coût compris entre 57 000 et 60 000 $ sur 9 à 11 semaines, le projet", dst: "Sur 9 à 11 semaines, le projet" },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whitespace-insensitive literal: any whitespace run in the source matches any (or no) whitespace. */
const compiled = SENTENCE_RULES.map((r) => ({
  re: new RegExp(escapeRe(r.src.trim()).replace(/\s+/g, '\\s*'), 'g'),
  dst: r.dst,
}));

// ---------------------------------------------------------------------------
// Generic amount detection
// ---------------------------------------------------------------------------
const D = '[0-9٠-٩۰-۹]';
/** 25,000 · 25.000 · 25 000 (incl. NBSP / narrow NBSP) · 2.7 · 345000 */
const NUM = `${D}{1,3}(?:[,.\u00A0\u202F ]${D}{3})+(?:\\.${D}+)?|${D}+(?:\\.${D}+)?`;
const MAG = `(?:\\s?(?:[KkMm]|万|萬|만)(?![A-Za-z]))?`;
const CUR_PRE = `(?:CA\\$|C\\$|US\\$|CAD\\s?\\$?|\\$)`;
const CUR_POST =
  '(?:\\$|USD|CAD|加元|加幣|dollars?|dólares|đô la|долларов(?:\\s+США)?|доллара|долл\\.|دولار(?:\\s+أمريكي)?|دلار(?:ی)?|डॉलर|ਡਾਲਰ|ドル|달러)';
const SEP = '\\s?(?:–|—|-|~|to|à|a|et|y|至|到|إلى|و|تا|đến|से|ਤੋਂ|до)\\s?';
const PRE_AMT = `${CUR_PRE}\\s?(?:${NUM})${MAG}`;
const POST_AMT = `(?:${NUM})${MAG}\\s?${CUR_POST}`;
const BARE = `(?:${NUM})${MAG}`;
/** One amount or range, with the currency written before and/or after. */
export const PRICE_SOURCE =
  `(?:${PRE_AMT}(?:${SEP}(?:${PRE_AMT}|${POST_AMT}|${BARE}))?\\+?` +
  `|${BARE}${SEP}(?:${PRE_AMT}|${POST_AMT})\\+?` +
  `|${POST_AMT}\\+?)`;

/**
 * Insurance amounts are not prices ("$5M CGL", "500 万ドルの CGL 保険", "$5 मिलियन तक सीजीएल बीमा").
 * An amount with an insurance word within 40 characters on either side is skipped.
 */
const INSURANCE = /CGL|सीजीएल|liabilit|insur|保险|保險|保険|보험|bảo hiểm|страх|تأمين|بیمه|बीमा|ਬੀਮਾ|seguro|assuran|assicura/i;

/** True when `text` contains a price amount (insurance amounts excluded). */
export function containsPrice(text: string): boolean {
  const re = new RegExp(PRICE_SOURCE, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const around = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40);
    if (!INSURANCE.test(around)) return true;
  }
  return false;
}

// English clause patterns that read cleanly once removed.
const P = PRICE_SOURCE;
const EN_CLAUSES: Array<[RegExp, string]> = [
  // Sentence-initial clause first, so the generic "within a $X budget" below cannot leave "Working, …".
  [new RegExp(`(?:Working\\s+)?[Ww]ithin\\s+(?:a|the)\\s+${P}\\s+budget,\\s*`, 'g'), ''],
  [new RegExp(`\\s+(?:for\\s+)?(?:under|less than|below)\\s+${P}`, 'g'), ''],
  [new RegExp(`(?:,\\s*|\\s+)(?:and|with|within|on|for)\\s+(?:a|an|the)\\s+${P}\\s+(?:budget|investment)\\b`, 'g'), ''],
  [new RegExp(`(?:Total\\s+)?(?:budget|cost|investment):?\\s*${P}\\.?`, 'gi'), ''],
  [new RegExp(`${P}\\s+(?:budget|investment)\\.`, 'g'), ''],
];

const SENTENCE_SPLIT = /(?<=[.!?。！？।۔])\s+|(?<=[。！？])/;

function tidy(s: string): string {
  return s
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?，。；：！？])/g, '$1')
    .replace(/([,，])\s*([.。])/g, '$2')
    .replace(/^\s+|\s+$/g, '')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());
}

/**
 * Remove price amounts and price clauses from one string. Text without an
 * amount is returned unchanged (same reference), so non-price copy is never
 * re-formatted.
 */
export function stripPrices(text: string): string {
  if (!text || !containsPrice(text)) return text;
  let out = text;
  for (const { re, dst } of compiled) out = out.replace(re, dst);
  if (!containsPrice(out)) return tidy(out);
  for (const [re, dst] of EN_CLAUSES) out = out.replace(re, dst);
  if (!containsPrice(out)) return tidy(out);
  // Last resort: drop every sentence that still names an amount.
  const parts = out.split(SENTENCE_SPLIT).filter((s) => !containsPrice(s));
  return tidy(parts.join(' ').replace(/\s+(?=[\u3000-\u9fff])|(?<=[。！？])\s+/g, ''));
}

/** Apply `stripPrices` to every string value of a Localized<string>-like object (or a plain string). */
export function stripLocalized<T>(value: T): T {
  if (typeof value === 'string') return stripPrices(value) as T;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  let changed = false;
  const next: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const nv = typeof v === 'string' ? stripPrices(v) : v;
    if (nv !== v) changed = true;
    next[k] = nv;
  }
  return (changed ? next : value) as T;
}

// ---------------------------------------------------------------------------
// FAQ (dynamic_blocks)
// ---------------------------------------------------------------------------
/**
 * Spec §3.4: West Vancouver two-bathroom FAQ #1 asks what it COSTS; rewrite it
 * to what the job INVOLVED, keeping only the scope sentence of the answer.
 */
const WEST_VAN_SLUG = 'two-bathroom-renovation-west-vancouver';
const WEST_VAN_Q = /how much does it cost to divide one bathroom into two/i;
export const WEST_VAN_FAQ = {
  questionEn: 'What did dividing one bathroom into two in West Vancouver involve?',
  questionZh: '西温哥华把一个浴室分成两个包括哪些工程？',
};

function rewriteWestVanItem(item: FaqBlock['items'][number]): FaqBlock['items'][number] {
  const en = (item.answerEn ?? '')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => !containsPrice(s) && !/^Pricing varies/i.test(s))
    .join(' ')
    .replace(/^The budget covered/, 'The scope covered');
  const zh = (item.answerZh ?? '')
    .split(/(?<=[。！？])/)
    .filter((s) => s.trim() && !containsPrice(s) && !/^\s*实际报价因/.test(s))
    .join('')
    .replace(/^\s*预算涵盖：/, '工程涵盖：');
  return { ...item, ...WEST_VAN_FAQ, answerEn: en.trim(), answerZh: zh.trim() };
}

function stripDeep(v: unknown): unknown {
  if (typeof v === 'string') return stripPrices(v);
  if (Array.isArray(v)) {
    const next = v.map(stripDeep);
    return next.some((x, i) => x !== v[i]) ? next : v;
  }
  if (v && typeof v === 'object') {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      // URLs / sources are never copy.
      const nx = /^(src|url|href|poster|image|thumbnail)$/i.test(k) ? x : stripDeep(x);
      if (nx !== x) changed = true;
      next[k] = nx;
    }
    return changed ? next : v;
  }
  return v;
}

/** Filter every text field of dynamic_blocks; apply the §3.4 FAQ rewrite for its one project. */
export function stripBlocksPrices<T extends unknown[] | undefined | null>(blocks: T, slug?: string): T {
  if (!Array.isArray(blocks)) return blocks;
  const withFaq =
    slug === WEST_VAN_SLUG
      ? blocks.map((b) => {
          const blk = b as Block;
          if (blk?.type !== 'faq') return b;
          return { ...blk, items: blk.items.map((it) => (WEST_VAN_Q.test(it.questionEn ?? '') ? rewriteWestVanItem(it) : it)) };
        })
      : blocks;
  return stripDeep(withFaq) as T;
}

// ---------------------------------------------------------------------------
// Row helpers (multi-locale Project / Site rows and single-locale views)
// ---------------------------------------------------------------------------
type PriceCopyRow = {
  slug?: string;
  description?: unknown;
  meta_description?: unknown;
  excerpt?: unknown;
  dynamic_blocks?: unknown[];
};

/** A copy of a project (or localized project) with its price copy filtered. Other fields untouched. */
export function stripProjectPrices<T extends PriceCopyRow>(row: T): T {
  const next = { ...row };
  if ('description' in row) next.description = stripLocalized(row.description);
  if ('meta_description' in row) next.meta_description = stripLocalized(row.meta_description);
  if ('excerpt' in row) next.excerpt = stripLocalized(row.excerpt);
  if ('dynamic_blocks' in row) next.dynamic_blocks = stripBlocksPrices(row.dynamic_blocks, row.slug);
  return next;
}

/** `stripProjectPrices` for a site and every child project. */
export function stripSitePrices<S extends PriceCopyRow & { projects?: PriceCopyRow[] }>(site: S): S {
  const next = stripProjectPrices(site);
  if (Array.isArray(site.projects)) next.projects = site.projects.map((p) => stripProjectPrices(p));
  return next;
}
