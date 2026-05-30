import dynamic from 'next/dynamic';
import type { Locale } from '@/i18n/config';
import type { Company, Service, GooglePlaceRating } from '@/lib/types';
import type { TetrisGalleryItem } from '@/components/TetrisGallery';
import { SURFACE } from '@/lib/theme';

// Server components - no client JS needed
import HeroSection from '@/components/home/HeroSection';
import AnswerBlockSection from '@/components/home/AnswerBlockSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import GallerySection from '@/components/home/GallerySection';
import ServicesSection from '@/components/home/ServicesSection';
import StatsSection from '@/components/home/StatsSection';
import AboutSection from '@/components/home/AboutSection';
import TrustBadgesSection from '@/components/home/TrustBadgesSection';
import PartnersSection from '@/components/home/PartnersSection';
import AreasLinkSection from '@/components/home/AreasLinkSection';
import CostGuidesLinkSection from '@/components/home/CostGuidesLinkSection';
import BlogSection from '@/components/home/BlogSection';
import ShowroomSection from '@/components/home/ShowroomSection';

// Below-fold client components — lazy-load JS
const FaqSection = dynamic(() => import('@/components/home/FaqSection'));
const ContactSection = dynamic(() => import('@/components/home/ContactSection'));

// Pre-localized types (computed server-side)
interface LocalizedBlogPost { slug: string; title: string }
interface LocalizedShowroom { address: string; phone: string }
interface LocalizedFaq { id: string; question: string; answer: string }
interface LocalizedPartner { name: string; logo: string; url?: string; isHiddenVisually: boolean }
interface AboutItem { title: string; text: string }
interface Stat { value: string; label: string; image?: string }

interface HomePageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  googleReviews: GooglePlaceRating;
  gallery: TetrisGalleryItem[];
  trustBadges: string[];
  partners: LocalizedPartner[];
  faqs: LocalizedFaq[];
  blogPosts: LocalizedBlogPost[];
  showroom: LocalizedShowroom;
  areasText: string;
  aboutItems: AboutItem[];
  stats: Stat[];
  translations: {
    hero: {
      transformYourSpace: string;
      professionalExcellenceDesc: string;
      getFreeQuote: string;
      callNow: string;
      yearsExperience: string;
      liabilityCoverage: string;
      wcbCoverage: string;
      rating: string;
      realEstateTitle: string;
      realEstateDesc: string;
    };
    testimonials: { title: string; subtitle: string };
    gallery: { title: string; subtitle: string; projectsLink: string };
    services: { title: string; subtitle: string };
    stats: { srTitle: string };
    about: { title: string; subtitle: string };
    trustBadges: { srTitle: string };
    partners: { title: string; subtitle: string; srTitle: string };
    faq: { title: string; subtitle: string };
    blog: { title: string; subtitle: string };
    showroom: { title: string; appointmentPrefix: string; appointmentBold: string; bookAppointment: string };
    /**
     * AnswerBlockSection translations. Nullable: when the current locale
     * lacks the namespaced section.* keys (the 6 deferred locales
     * tl/vi/pa/fa/ar/hi as of 2026-05-28), the page.tsx server component
     * detects the missing-key fallback and passes null here so HomePage
     * skips rendering AnswerBlockSection entirely. Better than shipping
     * `section.whatDoesRenoStarsDo` as a literal h2 heading on those
     * locales' homepages. Same defensive pattern as
     * app/[locale]/services/page.tsx (PR #70).
     */
    answerBlock: {
      question: string;
      answer: string;
      servicesTitle: string;
      viewServiceLabel: string;
    } | null;
    contact: {
      title: string;
      subtitle: string;
      phone: string;
      email: string;
      serviceAreas: string;
      mapTitle: string;
    };
  };
}

export default function HomePage({
  locale,
  company,
  services,
  googleReviews,
  gallery,
  trustBadges,
  partners,
  faqs,
  blogPosts,
  showroom,
  areasText,
  aboutItems,
  stats,
  translations: t,
}: HomePageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <HeroSection company={company} googleRating={googleReviews.rating} translations={t.hero} />
      {t.answerBlock && (
        <AnswerBlockSection
          foundingYear={company.foundingYear}
          services={services.map((s) => ({
            slug: s.slug,
            title: (s.title as Record<string, string>)[locale] ?? s.title.en,
          }))}
          translations={t.answerBlock}
        />
      )}
      <GallerySection gallery={gallery} translations={t.gallery} />
      <ServicesSection services={services} locale={locale} translations={t.services} />
      <TestimonialsSection googleReviews={googleReviews} locale={locale} translations={t.testimonials} />
      <StatsSection stats={stats} srTitle={t.stats.srTitle} />
      <AboutSection items={aboutItems} translations={t.about} />
      <TrustBadgesSection badges={trustBadges} srTitle={t.trustBadges.srTitle} />
      <PartnersSection partners={partners} translations={t.partners} />
      <AreasLinkSection locale={locale} />
      <CostGuidesLinkSection />
      <FaqSection faqs={faqs} translations={t.faq} />
      <BlogSection posts={blogPosts} translations={t.blog} />
      <ShowroomSection company={company} showroom={showroom} translations={t.showroom} />
      <ContactSection company={company} areasText={areasText} translations={t.contact} />
    </div>
  );
}
