import type { Locale } from '@/i18n/config';
import type { Company, Service, Testimonial } from '@/lib/types';
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
import FaqSection from '@/components/home/FaqSection';
import BlogSection from '@/components/home/BlogSection';
import ShowroomSection from '@/components/home/ShowroomSection';
import ContactSection from '@/components/home/ContactSection';

// Pre-localized types (computed server-side)
interface LocalizedArea { slug: string; name: string }
interface LocalizedGalleryItem { image: string; title: string; category: string }
interface LocalizedBlogPost { slug: string; title: string }
interface LocalizedShowroom { address: string; appointmentText: string; phone: string }
interface LocalizedFaq { id: string; question: string; answer: string }
interface AboutItem { title: string; text: string }
interface Stat { value: string; label: string }

interface HomePageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  testimonials: Testimonial[];
  gallery: LocalizedGalleryItem[];
  trustBadges: string[];
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
  testimonials,
  gallery,
  trustBadges,
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
      <TestimonialsSection testimonials={testimonials} locale={locale} translations={t.testimonials} />
      <GallerySection gallery={gallery} translations={t.gallery} />
      <ServicesSection services={services} locale={locale} translations={t.services} />
      <StatsSection stats={stats} srTitle={t.stats.srTitle} />
      <AboutSection items={aboutItems} translations={t.about} />
      <TrustBadgesSection badges={trustBadges} srTitle={t.trustBadges.srTitle} />
      <FaqSection faqs={faqs} translations={t.faq} />
      <BlogSection posts={blogPosts} translations={t.blog} />
      <ShowroomSection company={company} showroom={showroom} translations={t.showroom} />
      <ContactSection company={company} areasText={areasText} translations={t.contact} />
    </div>
  );
}
