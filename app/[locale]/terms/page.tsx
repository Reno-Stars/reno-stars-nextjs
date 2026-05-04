import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import { BreadcrumbSchema } from '@/components/structured-data';
import { buildAlternates, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import { NAVY, TEXT_MID, SURFACE } from '@/lib/theme';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

export async function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'zh' ? `服务条款 | ${SITE_NAME}` : `Terms of Service | ${SITE_NAME}`;
  const description = locale === 'zh'
    ? 'Reno Stars 服务条款 — 了解使用我们的服务和网站的相关条款与条件。'
    : 'Reno Stars Terms of Service — The terms and conditions that govern your use of our services and website.';

  return {
    title,
    description,
    alternates: buildAlternates('/terms/', locale),
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const company = await getCompanyFromDb();
  const isZh = locale === 'zh';

  const breadcrumbs = [
    { name: isZh ? '首页' : 'Home', url: `/${locale}/` },
    { name: isZh ? '服务条款' : 'Terms of Service', url: `/${locale}/terms/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main id="main-content" className="min-h-screen py-16 px-4" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: NAVY }}>
            {isZh ? '服务条款' : 'Terms of Service'}
          </h1>
          <div className="prose prose-lg max-w-none" style={{ color: TEXT_MID }}>
            {isZh ? (
              <>
                <p><strong>最后更新：</strong>2026年4月27日</p>
                <p>欢迎访问 {company.name}（以下简称&ldquo;公司&rdquo;、&ldquo;我们&rdquo;）。本服务条款（&ldquo;条款&rdquo;）规定了您使用我们的网站 www.reno-stars.com 以及我们提供的装修服务的相关条件。访问或使用本网站即表示您同意受本条款约束。</p>

                <h2 style={{ color: NAVY }}>1. 接受条款</h2>
                <p>访问或使用本网站、提交咨询表单、或与我们签订装修合同，即表示您同意本条款。如果您不同意本条款的任何部分，请停止使用本网站。</p>

                <h2 style={{ color: NAVY }}>2. 我们提供的服务</h2>
                <p>{company.name} 在大温哥华地区提供住宅装修服务，包括但不限于厨房、浴室、地下室和整屋翻新。具体的工作范围、材料和时间将在每个项目的书面合同中详细说明。本网站上展示的内容仅供参考，不构成正式报价或合同要约。</p>

                <h2 style={{ color: NAVY }}>3. 报价与估算</h2>
                <p>我们提供免费的现场咨询和书面装修报价。除非另有书面约定，所有报价的有效期为出具之日起 30 天。最终价格在签订正式合同时确定。报价中可能不包含许可证费用、市政检查费用、以及在施工过程中发现的隐藏问题（如结构损坏、电气或管道老化等）的额外费用。</p>

                <h2 style={{ color: NAVY }}>4. 付款条款</h2>
                <p>项目付款条件将在每份装修合同中明确规定，通常采用分阶段付款方式（例如，签约时、施工开始时、关键节点完成时、以及验收完成时）。我们接受电子转账、银行支票和信用卡付款。逾期付款可能产生利息或暂停施工。</p>

                <h2 style={{ color: NAVY }}>5. 项目时间表</h2>
                <p>每个项目的预计时间表将在合同中说明。我们将尽合理努力按时完成工作。但因业主决策延迟、材料供应中断、政府检查延误或不可抗力（包括但不限于极端天气、自然灾害、流行病）造成的延期不视为违约。</p>

                <h2 style={{ color: NAVY }}>6. 保修</h2>
                <p>我们对所有施工提供最长 3 年的工艺质保（具体期限以合同为准）。质保涵盖工艺缺陷，但不包括：(a) 正常磨损；(b) 业主或第三方造成的损坏；(c) 业主提供的材料或设备的制造商缺陷（这些应由制造商保修）；(d) 未按我们指引进行保养或使用造成的问题。</p>

                <h2 style={{ color: NAVY }}>7. 取消与变更</h2>
                <p>合同签订后取消项目可能产生已发生的设计、采购、人工成本费用。施工过程中的范围变更（&ldquo;变更单&rdquo;）须经双方书面同意，并可能影响项目价格和时间表。</p>

                <h2 style={{ color: NAVY }}>8. 责任与保险</h2>
                <p>{company.name} 持有 {company.liabilityCoverage} 商业综合责任险（CGL）和有效的工伤保险（WCB）。在适用法律允许的最大范围内，我们对任何间接、附带、特殊或后果性损害不承担责任，并且我们的总责任不超过相关项目合同金额。本条款不限制我们对人身伤害或法律明确不可免除的责任。</p>

                <h2 style={{ color: NAVY }}>9. 知识产权</h2>
                <p>本网站上的所有内容（包括文字、图片、设计、徽标、视频）均归 {company.name} 所有或经授权使用，受版权法和商标法保护。未经书面许可，不得复制、分发或商业使用。我们项目页面展示的施工前后照片均经客户授权使用。</p>

                <h2 style={{ color: NAVY }}>10. 第三方链接</h2>
                <p>本网站可能包含指向第三方网站的链接。我们对这些第三方网站的内容、隐私政策或做法不承担责任，您访问这些链接由您自行承担风险。</p>

                <h2 style={{ color: NAVY }}>11. 隐私</h2>
                <p>您对本网站的使用还受我们的<a href={`/${locale}/privacy/`}>隐私政策</a>约束，该政策已通过引用并入本条款。</p>

                <h2 style={{ color: NAVY }}>12. 适用法律</h2>
                <p>本条款受加拿大不列颠哥伦比亚省（British Columbia, Canada）法律管辖。任何因本条款产生的争议应提交不列颠哥伦比亚省的法院专属管辖。</p>

                <h2 style={{ color: NAVY }}>13. 条款变更</h2>
                <p>我们可能会不时更新本条款。更新后的版本将在本页面发布并注明最后更新日期。在重大变更后继续使用本网站即表示您接受修订后的条款。</p>

                <h2 style={{ color: NAVY }}>14. 联系我们</h2>
                <p>如对本服务条款有任何疑问，请联系：</p>
                <ul>
                  <li>电话：{company.phone}</li>
                  <li>电子邮件：{company.email}</li>
                  <li>地址：{company.address}</li>
                </ul>
              </>
            ) : (
              <>
                <p><strong>Last Updated:</strong> April 27, 2026</p>
                <p>Welcome to {company.name} (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our website at www.reno-stars.com and the renovation services we provide. By accessing this site or engaging our services, you agree to these Terms.</p>

                <h2 style={{ color: NAVY }}>1. Acceptance of Terms</h2>
                <p>By using this website, submitting an inquiry through any of our forms, or entering into a renovation contract with us, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please discontinue use of the site.</p>

                <h2 style={{ color: NAVY }}>2. Services We Provide</h2>
                <p>{company.name} offers residential renovation services across Metro Vancouver, including but not limited to kitchen, bathroom, basement, and whole-house renovations. The specific scope of work, materials, and schedule are described in detail in the written contract executed for each project. Content on this website is for general information only and does not constitute a formal quote or offer.</p>

                <h2 style={{ color: NAVY }}>3. Quotes and Estimates</h2>
                <p>We offer free in-person consultations and written renovation estimates. Unless otherwise stated in writing, all quotes are valid for 30 days from the date issued. Final pricing is established upon execution of a project contract. Quotes may exclude permit fees, municipal inspection fees, and additional costs for hidden conditions discovered during construction (e.g., structural damage, outdated wiring or plumbing).</p>

                <h2 style={{ color: NAVY }}>4. Payment Terms</h2>
                <p>Payment terms are set out in each project contract and are typically structured in milestones (e.g., on signing, at start of construction, on completion of key phases, and on final acceptance). We accept e-transfer, certified cheque, and credit card. Late payments may accrue interest or result in a pause of work.</p>

                <h2 style={{ color: NAVY }}>5. Project Timelines</h2>
                <p>Each project contract includes an estimated timeline. We will use commercially reasonable efforts to complete work on schedule. Delays caused by client decision-making, material supply disruptions, government inspection delays, or events of force majeure (including extreme weather, natural disasters, pandemics) shall not constitute breach of contract.</p>

                <h2 style={{ color: NAVY }}>6. Warranty</h2>
                <p>We provide up to a 3-year workmanship warranty on our construction work, with the exact term specified in each project contract. This warranty covers defects in workmanship but does not cover: (a) ordinary wear and tear; (b) damage caused by the client or third parties; (c) defects in client-supplied materials or appliances (which remain the responsibility of their respective manufacturers); or (d) issues resulting from failure to follow our care or usage instructions.</p>

                <h2 style={{ color: NAVY }}>7. Cancellation and Changes</h2>
                <p>Cancellation of a signed contract may incur charges for design, procurement, and labor costs already incurred. Mid-project scope changes (&quot;change orders&quot;) require written agreement from both parties and may affect both project price and timeline.</p>

                <h2 style={{ color: NAVY }}>8. Liability and Insurance</h2>
                <p>{company.name} carries {company.liabilityCoverage} Commercial General Liability (CGL) insurance and active WorkSafeBC (WCB) coverage. To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, or consequential damages, and our aggregate liability shall not exceed the value of the project contract in question. Nothing in these Terms limits our liability for personal injury or any liability that cannot lawfully be excluded.</p>

                <h2 style={{ color: NAVY }}>9. Intellectual Property</h2>
                <p>All content on this website (including text, photographs, designs, logos, and video) is owned by or licensed to {company.name} and is protected by copyright and trademark law. No part may be reproduced, redistributed, or used commercially without written permission. Before-and-after photographs displayed on our project pages are used with client consent.</p>

                <h2 style={{ color: NAVY }}>10. Third-Party Links</h2>
                <p>This website may contain links to third-party sites. We are not responsible for the content, privacy practices, or operations of those sites, and you access them at your own risk.</p>

                <h2 style={{ color: NAVY }}>11. Privacy</h2>
                <p>Your use of this website is also governed by our <a href={`/${locale}/privacy/`}>Privacy Policy</a>, which is incorporated into these Terms by reference.</p>

                <h2 style={{ color: NAVY }}>12. Governing Law</h2>
                <p>These Terms are governed by the laws of the Province of British Columbia, Canada. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of British Columbia.</p>

                <h2 style={{ color: NAVY }}>13. Changes to These Terms</h2>
                <p>We may update these Terms from time to time. Updated versions will be posted on this page with a revised &quot;Last Updated&quot; date. Continued use of the website after a material change constitutes acceptance of the revised Terms.</p>

                <h2 style={{ color: NAVY }}>14. Contact Us</h2>
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <ul>
                  <li>Phone: {company.phone}</li>
                  <li>Email: {company.email}</li>
                  <li>Address: {company.address}</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
