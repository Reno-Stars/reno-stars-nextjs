'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Hammer, Bath, Home, ArrowDown, Paintbrush, Building2, Phone, Mail, MapPin, Star, Award, ChevronRight, Shield } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Service, Testimonial, AboutSections } from '@/lib/types';
import {
  video,
  images,
  getAllGalleryItemsLocalized,
  getTrustBadges,
  getAllBlogPostsLocalized,
  getShowroomLocalized,
  getAllAreasLocalized,
} from '@/lib/data';
import TetrisGallery from '@/components/TetrisGallery';
import ContactForm from '@/components/ContactForm';
import {
  NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

const serviceIcons = [Hammer, Bath, Home, ArrowDown, Paintbrush, Building2];

interface HomePageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  testimonials: Testimonial[];
  aboutSections: AboutSections;
}

export default function HomePage({ locale, company, services, testimonials, aboutSections }: HomePageProps) {
  const t = useTranslations();
  const gallery = useMemo(() => getAllGalleryItemsLocalized(locale), [locale]);
  const trustBadges = useMemo(() => getTrustBadges(locale), [locale]);
  const blogPosts = useMemo(() => getAllBlogPostsLocalized(locale), [locale]);
  const showroom = useMemo(() => getShowroomLocalized(locale), [locale]);
  const areas = useMemo(() => getAllAreasLocalized(locale), [locale]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
          poster={images.hero}
        >
          <source src={video.hero} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center hidden motion-reduce:block"
          style={{ backgroundImage: `url(${images.hero})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl space-y-5">
            <Image src={company.logo} alt={company.name} width={180} height={40} className="h-10 w-auto object-contain rounded-md bg-white/95 px-3 py-1" />
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              {t('hero.transformYourSpace')}
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              {t('hero.professionalExcellenceDesc', { experience: company.yearsExperience, coverage: company.liabilityCoverage })}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/contact"
                className="px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 text-white hover:brightness-110"
                style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}55` }}
              >
                {t('cta.getFreeQuote')}
              </Link>
              <a href={`tel:${company.phone}`}
                className="px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer border border-white/30 text-white/90 hover:text-white hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
              >
                {t('cta.callNow')}
              </a>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                `${company.yearsExperience}+ ${t('stats.yearsExperience')}`,
                `${company.liabilityCoverage} ${t('stats.liabilityCoverage')}`,
                `${company.rating} ${t('stats.rating')}`,
              ].map((txt) => (
                <span key={txt} className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" style={{ color: GOLD }} /> {txt}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD}00)` }} />
      </section>

      {/* SERVICE AREAS */}
      <section className="py-5 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>{t('section.serviceAreas')}</span>
          <span className="mx-1" style={{ color: TEXT_MUTED }}>|</span>
          {areas.map((area, i) => (
            <span key={area.slug} className="text-xs font-medium" style={{ color: TEXT_MID }}>
              <Link href={`/areas/${area.slug}` as '/'} className="hover:underline" style={{ color: TEXT_MID }}>
                {area.name}
              </Link>
              {i < areas.length - 1 ? <span className="mx-1.5" style={{ color: `${TEXT}20` }}>&bull;</span> : ''}
            </span>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.ourServices')}</h2>
            <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.servicesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => {
              const Icon = serviceIcons[index] || Hammer;
              return (
                <Link key={service.slug} href={`/services/${service.slug}`}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group block"
                  style={{ boxShadow: neu(5), backgroundColor: CARD }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      <Icon className="w-5 h-5" style={{ color: GOLD }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold mb-1 group-hover:text-gold transition-colors" style={{ color: TEXT }}>{service.title[locale]}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{service.description[locale]}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.ourPortfolio')}</h2>
              <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.gallerySubtitle2')}</p>
            </div>
            <Link href="/projects"
              className="hidden md:flex items-center gap-1 text-sm font-semibold cursor-pointer transition-colors hover:opacity-80"
              style={{ color: GOLD }}
            >
              {t('nav.projects')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <TetrisGallery
            items={gallery}
            cardClassName="rounded-xl"
            cardStyle={{ boxShadow: neu(5) }}
          />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.whatOurClientsSay')}</h2>
            <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.testimonialsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="rounded-2xl p-5 relative" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
                <div className="pl-4">
                  <div className="flex gap-0.5 mb-3" role="img" aria-label={`${testimonial.rating}/5`}>
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={`star-${j}`} className="w-3.5 h-3.5" aria-hidden="true" style={{ fill: GOLD, color: GOLD }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: TEXT_MID }}>&ldquo;{testimonial.text[locale]}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: NAVY }}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: TEXT }}>{testimonial.name}</div>
                      <div className="text-xs" style={{ color: TEXT_MUTED }}>{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '500+', label: t('stats.projectsDone') },
            { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
            { value: '100%', label: t('stats.satisfaction') },
            { value: '24/7', label: t('stats.support') },
          ].map((s) => (
            <div key={s.value} className="text-center py-2">
              <div className="text-2xl md:text-3xl font-bold" style={{ color: GOLD }}>{s.value}</div>
              <div className="text-xs font-medium text-white/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.aboutUs')}</h2>
            <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.aboutSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: t('about.ourJourney'), text: aboutSections.ourJourney[locale] },
              { title: t('about.whatWeOffer'), text: aboutSections.whatWeOffer[locale] },
              { title: t('about.ourValues'), text: aboutSections.ourValues[locale] },
              { title: t('about.whyChooseUs'), text: aboutSections.whyChooseUs[locale] },
              { title: t('about.letsBuildTogether'), text: aboutSections.letsBuildTogether[locale] },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl p-5 transition-all duration-200" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: GOLD }} />
                <h3 className="text-base font-bold mb-1.5" style={{ color: TEXT }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustBadges.map((badge) => (
            <div key={badge} className="rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
              <Award className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
              <span className="text-sm font-bold" style={{ color: TEXT }}>{badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.blogTips')}</h2>
            <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.blogSubtitle')}</p>
          </div>
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="rounded-xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer block hover:translate-x-1"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <span className="text-sm font-semibold" style={{ color: TEXT }}>{post.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0 ml-3" style={{ color: GOLD }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWROOM CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto text-center">
          <Image src={company.logo} alt={company.name} width={180} height={40} className="h-10 w-auto object-contain mx-auto mb-5 rounded-md bg-white/95 px-3 py-1" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">{t('section.visitShowroom')}</h2>
          <p className="text-sm mb-2 text-white/60">{showroom.appointmentText}</p>
          <p className="text-xs text-white/40 mb-6">{showroom.address} &middot; {showroom.phone}</p>
          <Link href="/contact"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
          >
            {t('cta.bookAppointment')}
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t('section.getInTouch')}</h2>
            <p className="text-sm" style={{ color: TEXT_MID }}>{t('section.contactSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { icon: Phone, title: t('label.phone'), value: company.phone, href: `tel:${company.phone}` },
                { icon: Mail, title: t('label.email'), value: company.email, href: `mailto:${company.email}` },
                { icon: MapPin, title: t('section.serviceAreas'), value: areas.slice(0, 8).map((a) => a.name).join(', ') + '\u2026' },
              ].map((c) => (
                <div key={c.title} className="rounded-xl p-4 flex items-start gap-3" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD_PALE }}>
                    <c.icon className="w-4 h-4" style={{ color: GOLD }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: TEXT_MUTED }}>{c.title}</div>
                    {c.href ? (
                      <a href={c.href} className="text-sm font-medium cursor-pointer transition-colors hover:underline" style={{ color: TEXT }}>{c.value}</a>
                    ) : (
                      <p className="text-sm" style={{ color: TEXT_MID }}>{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-6" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
