import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import BasementCostGuidePage from '@/components/pages/BasementCostGuidePage';
import { ArticleSchema, BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getWholeHouseProjectsForGuide } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 604800; // 7d — Vercel quota optimization

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.basementCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/basement-renovation-cost-vancouver/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/basement-renovation-cost-vancouver/`,
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
    getTranslations({ locale, namespace: 'guides.basementCost' }),
    getTranslations({ locale, namespace: 'metadata.guides.basementCost' }),
    getWholeHouseProjectsForGuide(),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/basement-renovation-cost-vancouver/` },
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
      name: locale === 'zh' ? '检查地下室状况' : 'Inspect Basement Condition',
      text: locale === 'zh'
        ? '检查湿度、地基裂缝、排水和天花板高度。地下室是否有渗水历史？天花板高度是否满足建筑规范（最低6\'8"）？这些因素直接影响预算。'
        : 'Check moisture levels, foundation cracks, drainage, and ceiling height. Does the basement have a history of water intrusion? Is ceiling height code-compliant (min 6\'8")? These factors directly impact budget.',
    },
    {
      name: locale === 'zh' ? '确定用途和许可要求' : 'Determine Use and Permit Requirements',
      text: locale === 'zh'
        ? '家庭娱乐室、家庭办公室还是合法出租套间？合法套间需要独立出入口、防火分隔和建筑许可。温哥华许可费约$2,000-$5,000。'
        : 'Family room, home office, or legal rental suite? Legal suites require separate entry, fire separation, and building permits. Vancouver permit fees run $2,000-$5,000.',
    },
    {
      name: locale === 'zh' ? '制定预算' : 'Create Your Budget',
      text: locale === 'zh'
        ? '温哥华地下室装修通常在$30,000-$120,000+。基础装修约$30-50K，含卫浴约$60-80K，合法套间$80-120K+。预留20%应急款。'
        : 'Vancouver basement renovations typically range $30,000-$120,000+. Basic finishing ~$30-50K, with bathroom ~$60-80K, legal suite $80-120K+. Reserve 20% contingency.',
    },
    {
      name: locale === 'zh' ? '选择承包商并获取报价' : 'Select Contractor and Get Quotes',
      text: locale === 'zh'
        ? '选择有地下室装修经验的承包商。确认他们了解温哥华建筑规范，有$5M保险和WCB。获取至少3个详细报价。'
        : 'Choose contractors experienced in basement renovations. Confirm they understand Vancouver building codes, carry $5M insurance and WCB. Get at least 3 detailed quotes.',
    },
    {
      name: locale === 'zh' ? '施工与最终检查' : 'Construction and Final Inspection',
      text: locale === 'zh'
        ? '地下室装修通常需要8-16周。关键阶段：防水处理、框架检查、电气/管道粗管、石膏板、最终装饰。市政检查员将在关键节点进行检查。'
        : 'Basement renovations typically take 8-16 weeks. Key phases: waterproofing, framing inspection, electrical/plumbing rough-in, drywall, final finishes. City inspectors check at critical milestones.',
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
        url={`/${locale}/guides/basement-renovation-cost-vancouver/`}
        authorName={`${company.name} Team`}
        locale={locale}
      />
      <HowToSchema
        name={locale === 'zh' ? '如何规划温哥华地下室装修预算' : 'How to Budget for a Basement Renovation in Vancouver'}
        description={locale === 'zh'
          ? '温哥华地下室装修费用$30,000-$120,000+的完整预算规划指南，含合法套间选项。'
          : 'Plan your basement renovation budget in Vancouver. Costs range from $30,000 to $120,000+ including legal suite options.'}
        totalTime="P16W"
        estimatedCost={{ currency: 'CAD', minValue: 30000, maxValue: 120000 }}
        steps={howToSteps}
      />
      <BasementCostGuidePage locale={locale as Locale} projects={projects} />
    </>
  );
}
