'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import type { Company, Service, Testimonial, AboutSections, GalleryItem, BlogPost, Showroom, ServiceArea } from '@/lib/types';
import { SURFACE, SURFACE_ALT } from '@/lib/theme';

// Above-fold components - direct imports (Server Components)
import HeroSection from '@/components/home/HeroSection';
import ServiceAreasBar from '@/components/home/ServiceAreasBar';

// Below-fold components loaded dynamically
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
  loading: () => <SectionSkeleton />,
});
const GallerySection = dynamic(() => import('@/components/home/GallerySection'), {
  loading: () => <SectionSkeleton />,
});
const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'), {
  loading: () => <SectionSkeleton />,
});
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), {
  loading: () => <SectionSkeleton height="h-32" />,
});
const AboutSection = dynamic(() => import('@/components/home/AboutSection'), {
  loading: () => <SectionSkeleton />,
});
const TrustBadgesSection = dynamic(() => import('@/components/home/TrustBadgesSection'), {
  loading: () => <SectionSkeleton height="h-24" />,
});
const BlogSection = dynamic(() => import('@/components/home/BlogSection'), {
  loading: () => <SectionSkeleton />,
});
const ShowroomSection = dynamic(() => import('@/components/home/ShowroomSection'), {
  loading: () => <SectionSkeleton height="h-64" />,
});
const ContactSection = dynamic(() => import('@/components/home/ContactSection'), {
  loading: () => <SectionSkeleton />,
});

function SectionSkeleton({ height = 'h-96' }: { height?: string }) {
  return <div className={`${height} animate-pulse`} style={{ backgroundColor: SURFACE_ALT }} />;
}

interface HomePageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  testimonials: Testimonial[];
  aboutSections: AboutSections;
  gallery: GalleryItem[];
  trustBadges: { en: string; zh: string }[];
  blogPosts: BlogPost[];
  showroom: Showroom;
  areas: ServiceArea[];
}

export default function HomePage({ locale, company, services, testimonials, aboutSections, gallery, trustBadges, blogPosts, showroom, areas }: HomePageProps) {
  const t = useTranslations();

  // Memoize localized data
  const localizedAreas = useMemo(() => areas.map((a) => ({ slug: a.slug, name: a.name[locale] })), [areas, locale]);
  const localizedGallery = useMemo(() => gallery.map((g) => ({ image: g.image, title: g.title[locale], category: g.category })), [gallery, locale]);
  const localizedBadges = useMemo(() => trustBadges.map((b) => b[locale]), [trustBadges, locale]);
  const localizedBlogPosts = useMemo(() => blogPosts.map((p) => ({ slug: p.slug, title: p.title[locale] })), [blogPosts, locale]);
  const localizedShowroom = useMemo(() => ({ address: showroom.address, appointmentText: showroom.appointmentText[locale], phone: showroom.phone }), [showroom, locale]);
  const areasText = useMemo(() => localizedAreas.slice(0, 8).map((a) => a.name).join(', ') + '…', [localizedAreas]);

  const aboutItems = useMemo(() => [
    { title: t('about.ourJourney'), text: aboutSections.ourJourney[locale] },
    { title: t('about.whatWeOffer'), text: aboutSections.whatWeOffer[locale] },
    { title: t('about.ourValues'), text: aboutSections.ourValues[locale] },
    { title: t('about.whyChooseUs'), text: aboutSections.whyChooseUs[locale] },
    { title: t('about.letsBuildTogether'), text: aboutSections.letsBuildTogether[locale] },
  ], [aboutSections, locale, t]);

  const stats = useMemo(() => [
    { value: '500+', label: t('stats.projectsDone') },
    { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { value: '100%', label: t('stats.satisfaction') },
    { value: '24/7', label: t('stats.support') },
  ], [company, t]);

  // Hero translations
  const heroTranslations = useMemo(() => ({
    transformYourSpace: t('hero.transformYourSpace'),
    professionalExcellenceDesc: t('hero.professionalExcellenceDesc', { experience: company.yearsExperience, coverage: company.liabilityCoverage }),
    getFreeQuote: t('cta.getFreeQuote'),
    callNow: t('cta.callNow'),
    yearsExperience: t('stats.yearsExperience'),
    liabilityCoverage: t('stats.liabilityCoverage'),
    rating: t('stats.rating'),
  }), [t, company]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Above fold - loaded immediately */}
      <HeroSection company={company} translations={heroTranslations} />
      <ServiceAreasBar areas={localizedAreas} label={t('section.serviceAreas')} />

      {/* Below fold - dynamically loaded */}
      <TestimonialsSection
        testimonials={testimonials}
        locale={locale}
        translations={{ title: t('section.whatOurClientsSay'), subtitle: t('section.testimonialsSubtitle') }}
      />
      <GallerySection
        gallery={localizedGallery}
        translations={{ title: t('section.ourPortfolio'), subtitle: t('section.gallerySubtitle2'), projectsLink: t('nav.projects') }}
      />
      <ServicesSection
        services={services}
        locale={locale}
        translations={{ title: t('section.ourServices'), subtitle: t('section.servicesSubtitle') }}
      />
      <StatsSection stats={stats} />
      <AboutSection
        items={aboutItems}
        translations={{ title: t('section.aboutUs'), subtitle: t('section.aboutSubtitle') }}
      />
      <TrustBadgesSection badges={localizedBadges} />
      <BlogSection
        posts={localizedBlogPosts}
        translations={{ title: t('section.blogTips'), subtitle: t('section.blogSubtitle') }}
      />
      <ShowroomSection
        company={company}
        showroom={localizedShowroom}
        translations={{ title: t('section.visitShowroom'), bookAppointment: t('cta.bookAppointment') }}
      />
      <ContactSection
        company={company}
        areasText={areasText}
        translations={{
          title: t('section.getInTouch'),
          subtitle: t('section.contactSubtitle'),
          phone: t('label.phone'),
          email: t('label.email'),
          serviceAreas: t('section.serviceAreas'),
        }}
      />
    </div>
  );
}
