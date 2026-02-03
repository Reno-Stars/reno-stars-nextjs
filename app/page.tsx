'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Hammer, Bath, Home, ArrowDown, Paintbrush, Building2, Phone, Mail, MapPin, Star, Award, ChevronRight, Shield, Loader2 } from 'lucide-react';
import { getLocalizedData } from '@/lib/data';
import { useLanguage } from '@/i18n/LanguageContext';
import TetrisGallery from '@/components/TetrisGallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { submitContactForm } from '@/app/actions/contact';
import {
  NAVY, NAVY_MID, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu, neuIn,
} from '@/lib/theme';

export default function LandingPage() {
  const { lang, t } = useLanguage();
  const { company, services, gallery, testimonials, areas, blogPosts, trustBadges, showroom, aboutSections, video } = getLocalizedData(lang);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'idle', message: '' });

    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setFormStatus({ type: 'success', message: result.message });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setFormStatus({ type: 'error', message: result.message });
      }
    });
  };

  const icons = [Hammer, Bath, Home, ArrowDown, Paintbrush, Building2];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <Navbar variant="landing" />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        {/* Video Background with poster fallback */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
          poster="https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg"
        >
          <source src={video.hero} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
        </video>
        {/* Static image fallback for reduced motion preference */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center hidden motion-reduce:block"
          style={{ backgroundImage: 'url(https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg)' }}
          aria-hidden="true"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl space-y-5">
            <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain rounded-md bg-white/95 px-3 py-1" />
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              {t('hero.transformYourSpace')}
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              {t('hero.professionalExcellenceDesc').replace('{experience}', company.yearsExperience).replace('{coverage}', company.liabilityCoverage)}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#contact"
                className="px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 text-white hover:brightness-110"
                style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}55` }}
              >
                {t('cta.getFreeQuote')}
              </a>
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
              ].map((txt, i) => (
                <span key={i} className="text-xs font-medium text-white/50 flex items-center gap-1.5">
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
            <span key={i} className="text-xs font-medium" style={{ color: TEXT_MID }}>
              {area}{i < areas.length - 1 ? <span className="mx-1.5" style={{ color: `${TEXT}20` }}>&bull;</span> : ''}
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
              const Icon = icons[index] || Hammer;
              return (
                <div key={index}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
                  style={{ boxShadow: neu(5), backgroundColor: CARD }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      <Icon className="w-5 h-5" style={{ color: GOLD }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold mb-1 group-hover:text-[#C8922A] transition-colors" style={{ color: TEXT }}>{service.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
          ].map((s, i) => (
            <div key={i} className="text-center py-2">
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
              { title: t('about.ourJourney'), text: aboutSections.ourJourney },
              { title: t('about.whatWeOffer'), text: aboutSections.whatWeOffer },
              { title: t('about.ourValues'), text: aboutSections.ourValues },
              { title: t('about.whyChooseUs'), text: aboutSections.whyChooseUs },
              { title: t('about.letsBuildTogether'), text: aboutSections.letsBuildTogether },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all duration-200" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: GOLD }} />
                <h3 className="text-base font-bold mb-1.5" style={{ color: TEXT }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{item.text}</p>
              </div>
            ))}
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
            {testimonials.map((t2, i) => (
              <div key={i} className="rounded-2xl p-5 relative" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
                <div className="pl-4">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t2.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5" style={{ fill: GOLD, color: GOLD }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: TEXT_MID }}>&ldquo;{t2.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: NAVY }}>
                      {t2.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: TEXT }}>{t2.name}</div>
                      <div className="text-xs" style={{ color: TEXT_MUTED }}>{t2.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustBadges.map((badge, i) => (
            <div key={i} className="rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
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
            {blogPosts.map((post, i) => (
              <a key={i} href={post.url}
                className="rounded-xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer block hover:translate-x-1"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <span className="text-sm font-semibold" style={{ color: TEXT }}>{post.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0 ml-3" style={{ color: GOLD }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWROOM CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto text-center">
          <img src={company.logo} alt={company.name} className="h-10 w-auto object-contain mx-auto mb-5 rounded-md bg-white/95 px-3 py-1" loading="lazy" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">{t('section.visitShowroom')}</h2>
          <p className="text-sm mb-2 text-white/60">{showroom.appointmentText}</p>
          <p className="text-xs text-white/40 mb-6">{showroom.address} &middot; {showroom.phone}</p>
          <a href={company.quoteUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
          >
            {t('cta.bookAppointment')}
          </a>
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
                { icon: MapPin, title: t('section.serviceAreas'), value: areas.slice(0, 8).join(', ') + '…' },
              ].map((c, i) => (
                <div key={i} className="rounded-xl p-4 flex items-start gap-3" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {formStatus.type !== 'idle' && (
                  <div
                    className="p-3 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: formStatus.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: formStatus.type === 'success' ? '#16a34a' : '#dc2626',
                    }}
                    role="alert"
                  >
                    {formStatus.message}
                  </div>
                )}
                {[
                  { id: 'name', type: 'text', label: t('form.name'), ph: t('form.namePlaceholder') },
                  { id: 'email', type: 'email', label: t('form.email'), ph: t('form.emailPlaceholder') },
                  { id: 'phone', type: 'tel', label: t('form.phone'), ph: t('form.phonePlaceholder2') },
                ].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>{f.label}</label>
                    <input type={f.type} id={f.id} name={f.id} value={formData[f.id as keyof typeof formData]} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border-none outline-none text-sm transition-all duration-200"
                      style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT }}
                      placeholder={f.ph} required disabled={isPending}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>{t('form.message')}</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border-none outline-none text-sm resize-none transition-all duration-200"
                    style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT }}
                    placeholder={t('form.messagePlaceholder')} required disabled={isPending}
                  />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: GOLD, boxShadow: `0 4px 16px ${GOLD}44` }}
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? t('form.sending') : t('cta.sendMessage')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
