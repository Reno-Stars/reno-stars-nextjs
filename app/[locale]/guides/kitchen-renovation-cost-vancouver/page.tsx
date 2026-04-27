import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import KitchenCostGuidePage from '@/components/pages/KitchenCostGuidePage';
import { BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getKitchenProjectsForGuide } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.kitchenCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/kitchen-renovation-cost-vancouver/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/kitchen-renovation-cost-vancouver/`,
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

  const [nav, t, projects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.kitchenCost' }),
    getKitchenProjectsForGuide(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/kitchen-renovation-cost-vancouver/` },
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
      name: locale === 'zh' ? '确定装修范围' : 'Define Your Renovation Scope',
      text: locale === 'zh'
        ? '决定是局部翻新（更换台面、柜门）还是全面改造（重新布局、定制橱柜、电器升级）。范围直接决定预算。'
        : 'Decide whether you want a partial refresh (countertops, cabinet doors) or a full remodel (layout changes, custom cabinets, appliance upgrades). Scope directly determines budget.',
    },
    {
      name: locale === 'zh' ? '设定预算并预留应急款' : 'Set Your Budget with Contingency',
      text: locale === 'zh'
        ? '温哥华厨房装修通常在$25,000-$90,000之间。在总预算中预留15-20%作为应急款，用于应对意外情况。'
        : 'Kitchen renovations in Vancouver typically range from $25,000 to $90,000. Set aside 15-20% of your total budget as contingency for unexpected issues behind walls.',
    },
    {
      name: locale === 'zh' ? '选择材料和风格' : 'Choose Materials and Finishes',
      text: locale === 'zh'
        ? '选择橱柜（定制或预制）、台面（石英石、花岗岩）、瓷砖和电器。材料选择对总成本影响最大。'
        : 'Select cabinets (custom vs stock), countertops (quartz, granite), backsplash tile, and appliances. Material choices have the biggest impact on total cost.',
    },
    {
      name: locale === 'zh' ? '获取报价并比较' : 'Get Quotes and Compare',
      text: locale === 'zh'
        ? '获取至少3个承包商的详细报价。比较工作范围、材料品牌、时间表和保修条款。不要只看价格。'
        : 'Get detailed quotes from at least 3 contractors. Compare scope of work, material specs, timelines, and warranty terms — not just price.',
    },
    {
      name: locale === 'zh' ? '施工与验收' : 'Construction and Final Walkthrough',
      text: locale === 'zh'
        ? '施工通常需要4-8周。完工后进行详细验收，检查所有细节。优质承包商提供2-3年工艺保修。'
        : 'Construction typically takes 4-8 weeks. Do a detailed walkthrough upon completion, checking every detail. Quality contractors offer 2-3 year workmanship warranties.',
    },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <HowToSchema
        name={locale === 'zh' ? '如何规划温哥华厨房装修预算' : 'How to Budget for a Kitchen Renovation in Vancouver'}
        description={locale === 'zh'
          ? '根据16个真实项目数据，了解温哥华厨房装修费用$15,000-$72,000的完整预算规划指南。'
          : 'Plan your kitchen renovation budget using real data from 16 completed Vancouver projects. Costs range from $15,000 to $72,000.'}
        totalTime="P8W"
        estimatedCost={{ currency: 'CAD', minValue: 15000, maxValue: 72000 }}
        steps={howToSteps}
      />
      <KitchenCostGuidePage locale={locale as Locale} projects={projects} />
    </>
  );
}
