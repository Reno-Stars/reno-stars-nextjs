import dynamic from 'next/dynamic';
import type { Locale } from '@/i18n/config';
import type { Company, Service, GooglePlaceRating } from '@/lib/types';
import { SURFACE } from '@/lib/theme';

// Server components - no client JS needed
import HeroSection from '@/components/home/HeroSection';
import ServiceAreasBar from '@/components/home/ServiceAreasBar';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import GallerySection from '@/components/home/GallerySection';
import ServicesSection from '@/components/home/ServicesSection';
import StatsSection from '@/components/home/StatsSection';
import AboutSection from '@/components/home/AboutSection';
import TrustBadgesSection from '@/components/home/TrustBadgesSection';
import PartnersSection from '@/components/home/PartnersSection';
import BlogSection from '@/components/home/BlogSection';
import ShowroomSection from '@/components/home/ShowroomSection';

// Below-fold client components — lazy-load JS
const FaqSection = dynamic(() => import('@/components/home/FaqSection'));
const ContactSection = dynamic(() => import('@/components/home/ContactSection'));

// Pre-localized types (computed server-side)
interface LocalizedArea { slug: string; name: string }
interface LocalizedGalleryItem { image: string; title: string; category: string }
interface LocalizedBlogPost { slug: string; title: string }
interface LocalizedShowroom { address: string; appointmentText: string; phone: string }
interface LocalizedFaq { id: string; question: string; answer: string }
interface LocalizedPartner { name: string; logo: string; url?: string; isHiddenVisually: boolean }
interface AboutItem { title: string; text: string }
interface Stat { value: string; label: string; image?: string }

interface HomePageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  googleReviews: GooglePlaceRating;
  gallery: LocalizedGalleryItem[];
  trustBadges: string[];
  partners: LocalizedPartner[];
  faqs: LocalizedFaq[];
  blogPosts: LocalizedBlogPost[];
  showroom: LocalizedShowroom;
  areas: LocalizedArea[];
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
      rating: string;
    };
    serviceAreas: string;
    testimonials: { title: string; subtitle: string };
    gallery: { title: string; subtitle: string; projectsLink: string };
    services: { title: string; subtitle: string };
    stats: { srTitle: string };
    about: { title: string; subtitle: string };
    trustBadges: { srTitle: string };
    partners: { title: string; subtitle: string; srTitle: string };
    faq: { title: string; subtitle: string };
    blog: { title: string; subtitle: string };
    showroom: { title: string; bookAppointment: string };
    contact: {
      title: string;
      subtitle: string;
      phone: string;
      email: string;
      serviceAreas: string;
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
  areas,
  areasText,
  aboutItems,
  stats,
  translations: t,
}: HomePageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <HeroSection company={company} translations={t.hero} />
      <ServiceAreasBar areas={areas} label={t.serviceAreas} />
      <GallerySection gallery={gallery} translations={t.gallery} />
      <ServicesSection services={services} locale={locale} translations={t.services} />
      <TestimonialsSection googleReviews={googleReviews} locale={locale} translations={t.testimonials} />
      <StatsSection stats={stats} srTitle={t.stats.srTitle} />
      <AboutSection items={aboutItems} translations={t.about} />
      <TrustBadgesSection badges={trustBadges} srTitle={t.trustBadges.srTitle} />
      <PartnersSection partners={partners} translations={t.partners} />
      <FaqSection faqs={faqs} translations={t.faq} />
      <BlogSection posts={blogPosts} translations={t.blog} />
      <ShowroomSection company={company} showroom={showroom} translations={t.showroom} />
      <ContactSection company={company} areasText={areasText} translations={t.contact} />
    </div>
  );
}
