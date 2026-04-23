import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import BathroomCostGuidePage from '@/components/pages/BathroomCostGuidePage';
import { BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getBathroomProjectsForGuide } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.bathroomCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/bathroom-renovation-cost-vancouver/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/bathroom-renovation-cost-vancouver/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: ogImage, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, projects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.bathroomCost' }),
    getBathroomProjectsForGuide(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/bathroom-renovation-cost-vancouver/` },
  ];

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ];

  const howToSteps = [
    {
      name: locale === 'zh' ? '评估现有浴室状况' : 'Assess Your Current Bathroom',
      text: locale === 'zh'
        ? '检查管道、防水层和通风状况。老房子可能需要额外的管道升级或结构修复，这会影响总预算。'
        : 'Check plumbing condition, waterproofing, and ventilation. Older homes may need plumbing upgrades or structural repairs that affect total budget.',
    },
    {
      name: locale === 'zh' ? '确定装修范围和预算' : 'Define Scope and Set Budget',
      text: locale === 'zh'
        ? '温哥华浴室装修从$10,000（基础翻新）到$60,000+（豪华主卫）。确定是更换表面还是完全重新布局。预留15-20%应急款。'
        : 'Vancouver bathroom renovations range from $10,000 (basic refresh) to $60,000+ (luxury ensuite). Decide between surface updates vs full layout change. Reserve 15-20% contingency.',
    },
    {
      name: locale === 'zh' ? '选择固定装置和饰面' : 'Select Fixtures and Finishes',
      text: locale === 'zh'
        ? '选择浴缸/淋浴、梳妆台、瓷砖和水龙头。考虑无障碍设计和节水功能。材料费通常占总成本的40-50%。'
        : 'Choose tub/shower, vanity, tile, and faucets. Consider accessibility features and water efficiency. Materials typically account for 40-50% of total cost.',
    },
    {
      name: locale === 'zh' ? '获取报价并选择承包商' : 'Get Quotes and Select Contractor',
      text: locale === 'zh'
        ? '获取3个以上详细报价。确认承包商有适当的保险（$5M CGL）、工人赔偿保险（WCB）和相关认证。'
        : 'Get 3+ detailed quotes. Verify contractor has proper insurance ($5M CGL), workers compensation (WCB), and relevant certifications.',
    },
    {
      name: locale === 'zh' ? '施工与质量检查' : 'Construction and Quality Inspection',
      text: locale === 'zh'
        ? '浴室装修通常需要3-6周。关键检查点：防水测试、管道压力测试、瓷砖对齐。完工后进行详细验收。'
        : 'Bathroom renovations typically take 3-6 weeks. Key checkpoints: waterproofing test, plumbing pressure test, tile alignment. Conduct detailed walkthrough upon completion.',
    },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <HowToSchema
        name={locale === 'zh' ? '如何规划温哥华浴室装修预算' : 'How to Budget for a Bathroom Renovation in Vancouver'}
        description={locale === 'zh'
          ? '根据19个真实项目数据，了解温哥华浴室装修费用$10,000-$60,000+的完整预算规划指南。'
          : 'Plan your bathroom renovation budget using real data from 19 completed Vancouver projects. Costs range from $10,000 to $60,000+.'}
        totalTime="P6W"
        estimatedCost={{ currency: 'CAD', minValue: 10000, maxValue: 60000 }}
        steps={howToSteps}
      />
      <BathroomCostGuidePage locale={locale as Locale} projects={projects} />
    </>
  );
}
