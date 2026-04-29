import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import { NAVY, TEXT_MID, SURFACE } from '@/lib/theme';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 604800; // 7d — Vercel quota optimization

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'zh' ? `隐私政策 | ${SITE_NAME}` : `Privacy Policy | ${SITE_NAME}`;
  const description = locale === 'zh'
    ? 'Reno Stars 隐私政策 — 了解我们如何收集、使用和保护您的个人信息。'
    : 'Reno Stars Privacy Policy — Learn how we collect, use, and protect your personal information.';

  return {
    title,
    description,
    alternates: buildAlternates('/privacy/', locale),
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const company = await getCompanyFromDb();
  const isZh = locale === 'zh';

  const breadcrumbs = [
    { name: isZh ? '首页' : 'Home', url: `/${locale}/` },
    { name: isZh ? '隐私政策' : 'Privacy Policy', url: `/${locale}/privacy/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main id="main-content" className="min-h-screen py-16 px-4" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: NAVY }}>
            {isZh ? '隐私政策' : 'Privacy Policy'}
          </h1>
          <div className="prose prose-lg max-w-none" style={{ color: TEXT_MID }}>
            {isZh ? (
              <>
                <p><strong>最后更新：</strong>2026年4月20日</p>
                <p>{company.name}（以下简称"我们"）重视您的隐私。本隐私政策说明了我们在您访问我们的网站 www.reno-stars.com 时如何收集、使用和保护您的个人信息。</p>

                <h2 style={{ color: NAVY }}>我们收集的信息</h2>
                <p>当您通过联系表单、电话或电子邮件与我们联系时，我们可能会收集以下信息：</p>
                <ul>
                  <li>姓名</li>
                  <li>电子邮件地址</li>
                  <li>电话号码</li>
                  <li>地址（用于提供装修报价）</li>
                  <li>项目描述和偏好</li>
                </ul>

                <h2 style={{ color: NAVY }}>信息使用方式</h2>
                <p>我们使用收集的信息用于：</p>
                <ul>
                  <li>回复您的询问并提供装修报价</li>
                  <li>安排咨询和项目管理</li>
                  <li>改善我们的网站和服务</li>
                  <li>发送与您项目相关的更新</li>
                </ul>

                <h2 style={{ color: NAVY }}>信息保护</h2>
                <p>我们采取合理的安全措施来保护您的个人信息。我们不会将您的个人信息出售或出租给第三方。</p>

                <h2 style={{ color: NAVY }}>Cookie</h2>
                <p>我们的网站使用 Google Analytics 来了解访客如何使用我们的网站。这些 Cookie 收集匿名数据，帮助我们改善用户体验。</p>

                <h2 style={{ color: NAVY }}>联系我们</h2>
                <p>如果您对本隐私政策有任何疑问，请联系我们：</p>
                <ul>
                  <li>电话：{company.phone}</li>
                  <li>电子邮件：{company.email}</li>
                  <li>地址：{company.address}</li>
                </ul>
              </>
            ) : (
              <>
                <p><strong>Last Updated:</strong> April 20, 2026</p>
                <p>{company.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website at www.reno-stars.com.</p>

                <h2 style={{ color: NAVY }}>Information We Collect</h2>
                <p>When you contact us through our contact form, phone, or email, we may collect the following information:</p>
                <ul>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Address (for providing renovation quotes)</li>
                  <li>Project description and preferences</li>
                </ul>

                <h2 style={{ color: NAVY }}>How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Respond to your inquiries and provide renovation quotes</li>
                  <li>Schedule consultations and manage projects</li>
                  <li>Improve our website and services</li>
                  <li>Send updates related to your project</li>
                </ul>

                <h2 style={{ color: NAVY }}>Information Protection</h2>
                <p>We implement reasonable security measures to protect your personal information. We do not sell or rent your personal information to third parties.</p>

                <h2 style={{ color: NAVY }}>Cookies</h2>
                <p>Our website uses Google Analytics to understand how visitors use our site. These cookies collect anonymous data to help us improve the user experience.</p>

                <h2 style={{ color: NAVY }}>Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us:</p>
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
