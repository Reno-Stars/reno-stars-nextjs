import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import WholeHouseCostGuidePage from '@/components/pages/WholeHouseCostGuidePage';
import { ArticleSchema, BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getWholeHouseProjectsForGuide } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}


export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.wholeHouseCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/whole-house-renovation-cost-vancouver/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/whole-house-renovation-cost-vancouver/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
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

  const [nav, t, mt, projects, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.wholeHouseCost' }),
    getTranslations({ locale, namespace: 'metadata.guides.wholeHouseCost' }),
    getWholeHouseProjectsForGuide(),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/whole-house-renovation-cost-vancouver/` },
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
      name: locale === 'zh' ? '评估房屋整体状况' : 'Evaluate Your Home\'s Overall Condition',
      text: locale === 'zh'
        ? '评估屋顶、地基、电气、管道和暖通系统的状况。1975年以前的房屋可能需要石棉检测和铅漆处理，预算需增加20-25%。'
        : 'Assess roofing, foundation, electrical, plumbing, and HVAC systems. Pre-1975 homes may need asbestos testing and lead paint remediation, adding 20-25% to budget.',
    },
    {
      name: locale === 'zh' ? '确定装修阶段和优先级' : 'Define Phases and Priorities',
      text: locale === 'zh'
        ? '全屋装修通常分阶段进行：结构/机械系统优先，然后是厨房和浴室，最后是表面装饰。确定哪些区域最需要翻新。'
        : 'Whole-house renovations are typically phased: structural/mechanical first, then kitchens and bathrooms, finally cosmetic finishes. Identify which areas need the most work.',
    },
    {
      name: locale === 'zh' ? '制定详细预算' : 'Build a Detailed Budget',
      text: locale === 'zh'
        ? '温哥华全屋装修真实区间 $150,000-$800,000+（豪华或大型结构改造可达 $1M+）。每平方英尺 $250-$700 取决于范围与饰面等级。预算需含设计费、市政许可费、结构工程师费、和 15-20% 应急款。'
        : 'Vancouver whole-house renovations realistically range $150,000-$800,000+ (luxury or major structural changes hit $1M+). Per-square-foot costs run $250-$700 depending on scope and finish tier. Budget must include design fees, City permit fees, structural engineer fees, and 15-20% contingency.',
    },
    {
      name: locale === 'zh' ? '选择设计-施工团队' : 'Choose a Design-Build Team',
      text: locale === 'zh'
        ? '全屋装修需要设计师和承包商紧密配合。设计-施工一体化模式可以节省时间和成本。确认团队有处理大型项目的经验。'
        : 'Whole-house projects require tight coordination between designer and contractor. Design-build firms save time and cost. Verify the team has experience with large-scale projects.',
    },
    {
      name: locale === 'zh' ? '管理施工过程' : 'Manage the Construction Process',
      text: locale === 'zh'
        ? '全屋装修通常需要2-6个月。制定临时住所计划。定期现场检查和里程碑付款确保项目按计划进行。'
        : 'Whole-house renovations typically take 2-6 months. Plan temporary living arrangements. Regular site inspections and milestone payments keep the project on track.',
    },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ArticleSchema
        company={company}
        headline={mt('title')}
        description={mt('description')}
        url={`/${locale}/guides/whole-house-renovation-cost-vancouver/`}
        authorName={`${company.name} Team`}
        locale={locale}
      />
      <HowToSchema
        name={locale === 'zh' ? '如何规划温哥华全屋装修预算' : 'How to Budget for a Whole House Renovation in Vancouver'}
        description={locale === 'zh'
          ? '温哥华全屋装修费用$50,000-$200,000+的完整预算规划指南。'
          : 'Plan your whole-house renovation budget in Vancouver. Costs range from $50,000 to $200,000+ based on real project data.'}
        totalTime="P24W"
        estimatedCost={{ currency: 'CAD', minValue: 50000, maxValue: 200000 }}
        steps={howToSteps}
      />
      <WholeHouseCostGuidePage locale={locale as Locale} projects={projects} />
    </>
  );
}
