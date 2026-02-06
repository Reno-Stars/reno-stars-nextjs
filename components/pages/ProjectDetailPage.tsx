'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, MapPin, Calendar, DollarSign, Layers, X, ExternalLink } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Project, LocalizedProject } from '@/lib/types';
import { getLocalizedProject } from '@/lib/data/projects';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import {
  GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface ProjectDetailPageProps {
  locale: Locale;
  project: Project;
  allProjects: Project[];
  company: Company;
}

export default function ProjectDetailPage({ locale, project, allProjects, company }: ProjectDetailPageProps) {
  const t = useTranslations();
  const localizedProject = useMemo(() => getLocalizedProject(project, locale), [project, locale]);

  // Find first "after" image index (default to 0 if none found)
  const firstAfterIndex = useMemo(() => {
    const idx = localizedProject.images.findIndex((img) => !img.is_before);
    return idx >= 0 ? idx : 0;
  }, [localizedProject.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(firstAfterIndex);
  useEffect(() => {
    setActiveImageIndex(firstAfterIndex);
  }, [project.slug, firstAfterIndex]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<LocalizedProject | null>(null);

  const handleCardClick = useCallback((p: LocalizedProject) => {
    setSelectedProject(p);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleLightboxOpen = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const handleLightboxKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxOpen(true);
    }
  }, []);

  const relatedProjects = useMemo(() => {
    return allProjects
      .filter((p) => p.slug !== project.slug && p.service_type === project.service_type)
      .map((p) => getLocalizedProject(p, locale))
      .slice(0, 3);
  }, [allProjects, project.slug, project.service_type, locale]);

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % localizedProject.images.length);
  }, [localizedProject.images.length]);

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev - 1 + localizedProject.images.length) % localizedProject.images.length);
  }, [localizedProject.images.length]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" items={[
        { href: '/', label: t('nav.home') },
        { href: '/projects', label: t('nav.projects') },
        { label: localizedProject.title },
      ]} />

      {/* Main Content */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <div
                className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                style={{ boxShadow: neu(6), backgroundColor: SURFACE_ALT }}
                role="button"
                tabIndex={0}
                aria-label={t('projects.openLightbox')}
                onClick={handleLightboxOpen}
                onKeyDown={handleLightboxKeyDown}
              >
                {(() => {
                  const activeImg = localizedProject.images[activeImageIndex];
                  return (
                    <>
                      <Image
                        src={activeImg?.src || localizedProject.hero_image}
                        alt={activeImg?.alt || localizedProject.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                      />
                      <BeforeAfterBadge isBefore={activeImg?.is_before} t={t} />
                    </>
                  );
                })()}
                {localizedProject.badge && (
                  <span
                    className="absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    {localizedProject.badge}
                  </span>
                )}
              </div>
              {localizedProject.images.length > 1 && (() => {
                // Separate images: After first, then Before
                const afterImages = localizedProject.images
                  .map((img, i) => ({ ...img, originalIndex: i }))
                  .filter((img) => !img.is_before);
                const beforeImages = localizedProject.images
                  .map((img, i) => ({ ...img, originalIndex: i }))
                  .filter((img) => img.is_before);

                const renderRow = (images: typeof afterImages, label: string) => images.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: TEXT_MUTED }}>
                      {label}
                    </span>
                    <div className="flex gap-3 overflow-x-auto p-1">
                      {images.map((img) => (
                        <button
                          key={img.src}
                          onClick={() => setActiveImageIndex(img.originalIndex)}
                          className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0"
                          aria-label={`${t('projects.viewImage')} ${img.originalIndex + 1} / ${localizedProject.images.length}`}
                          aria-pressed={img.originalIndex === activeImageIndex}
                          style={{
                            outline: img.originalIndex === activeImageIndex ? `2px solid ${GOLD}` : 'none',
                            outlineOffset: '2px',
                          }}
                        >
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );

                return (
                  <>
                    {renderRow(afterImages, t('projects.afterLabel'))}
                    {renderRow(beforeImages, t('projects.beforeLabel'))}
                  </>
                );
              })()}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
                {localizedProject.title}
              </h1>
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {localizedProject.description}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                    <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                      {t('modal.location')}
                    </span>
                  </div>
                  <span className="text-base font-semibold" style={{ color: TEXT }}>
                    {localizedProject.location_city}
                  </span>
                </div>
                {localizedProject.duration && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.duration')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.duration}
                    </span>
                  </div>
                )}
                {localizedProject.budget_range && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.budget')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.budget_range}
                    </span>
                  </div>
                )}
                {localizedProject.space_type && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.spaceType')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.space_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Scope */}
              {localizedProject.service_scope && localizedProject.service_scope.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('modal.serviceScope')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {localizedProject.service_scope.map((scope) => (
                      <span
                        key={scope}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Products */}
              {localizedProject.external_products && localizedProject.external_products.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('projects.externalProducts')}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {localizedProject.external_products.map((ep) => (
                      <a
                        key={ep.url}
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:brightness-95"
                        style={{ boxShadow: neu(3), backgroundColor: CARD }}
                      >
                        {ep.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: SURFACE_ALT }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ep.image_url} alt={ep.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 text-sm font-medium" style={{ color: TEXT }}>
                          {ep.label}
                        </span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MUTED }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge & Solution */}
              {localizedProject.challenge && (
                <div className="mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.challenge')}
                  </h2>
                  <p className="text-base" style={{ color: TEXT_MID }}>
                    {localizedProject.challenge}
                  </p>
                </div>
              )}
              {localizedProject.solution && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.solution')}
                  </h2>
                  <p className="text-base" style={{ color: TEXT_MID }}>
                    {localizedProject.solution}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
                >
                  {t('cta.getFreeQuote')}
                </Link>
                <a
                  href={`tel:${company.phone}`}
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200"
                  style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
                >
                  {t('cta.callNow')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
              {t('projects.relatedProjects')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <ProjectCard key={rp.slug} project={rp} onClick={handleCardClick} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProjectModal
        project={selectedProject}
        onClose={handleModalClose}
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxDialog
          images={localizedProject.images}
          heroImage={localizedProject.hero_image}
          title={localizedProject.title}
          activeIndex={activeImageIndex}
          onClose={handleLightboxClose}
          onPrev={prevImage}
          onNext={nextImage}
          t={t}
        />
      )}
    </div>
  );
}

/** Accessible lightbox dialog with focus trap, keyboard nav, and scroll lock */
function LightboxDialog({
  images, heroImage, title, activeIndex, onClose, onPrev, onNext, t,
}: {
  images: { src: string; alt: string; is_before?: boolean }[];
  heroImage: string;
  title: string;
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const closeBtn = dialogRef.current?.querySelector<HTMLElement>('button');
    closeBtn?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label={t('projects.imageGallery')}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label={t('modal.close')}
      >
        <X className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <button
        className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label={t('projects.previousImage')}
      >
        <ChevronLeft className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <button
        className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label={t('projects.nextImage')}
      >
        <ChevronRight className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70" aria-live="polite">
        {activeIndex + 1} / {images.length}
      </span>
      {(() => {
        const currentImg = images[activeIndex];
        return (
          <div className="relative w-full max-w-4xl aspect-[4/3] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={currentImg?.src || heroImage}
              alt={currentImg?.alt || title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
            <BeforeAfterBadge isBefore={currentImg?.is_before} t={t} />
          </div>
        );
      })()}
    </div>
  );
}
