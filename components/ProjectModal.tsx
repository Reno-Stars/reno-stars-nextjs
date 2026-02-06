'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, MapPin, Tag, DollarSign, Home, Wrench, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { LocalizedProject } from '@/lib/types';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import {
  GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, SH_DARK,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu, neuIn,
} from '@/lib/theme';

interface ProjectModalProps {
  project: LocalizedProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const t = useTranslations();
  const [activeImage, setActiveImage] = useState(0);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleClose = useCallback(() => {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
  }, [handleClose]);

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setVisible(true));
    const closeButton = modalRef.current?.querySelector<HTMLElement>('button');
    closeButton?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [project, handleKeyDown]);

  useEffect(() => {
    if (!project) return;
    // Find first "after" image index (default to 0 if none found)
    const gallery = project.images.length > 0 ? project.images : [];
    const firstAfterIdx = gallery.findIndex((img) => !img.is_before);
    setActiveImage(firstAfterIdx >= 0 ? firstAfterIdx : 0);
  }, [project]);

  if (!project) return null;

  const gallery = project.images.length > 0
    ? project.images
    : [{ src: project.hero_image, alt: project.title }];

  const sidebarItems = [
    { icon: MapPin, label: t('modal.location'), value: project.location_city },
    { icon: Tag, label: t('modal.category'), value: project.category },
    { icon: DollarSign, label: t('modal.budget'), value: project.budget_range },
    { icon: Home, label: t('modal.spaceType'), value: project.space_type },
    { icon: Clock, label: t('modal.duration'), value: project.duration },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
        backgroundColor: 'rgba(27,54,93,0.45)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl transition-all duration-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.97)',
          backgroundColor: SURFACE,
          boxShadow: `0 25px 50px rgba(27,54,93,0.25)`,
          color: TEXT,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: SURFACE,
            boxShadow: `0 1px 3px ${SH_DARK}`,
          }}
        >
          <h2 id="modal-title" className="text-xl md:text-2xl font-bold truncate pr-4" style={{ color: TEXT }}>
            {project.title}
          </h2>
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{
              boxShadow: neu(3),
              backgroundColor: CARD,
              color: TEXT_MID,
            }}
            aria-label={t('modal.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Gallery + description */}
          <div className="flex-1 p-6">
            <div
              className="relative overflow-hidden rounded-xl aspect-[16/10] mb-4"
              style={{ boxShadow: neuIn(4), backgroundColor: SURFACE_ALT }}
            >
              <Image
                src={gallery[activeImage].src}
                alt={gallery[activeImage].alt || `${project.title} - Image ${activeImage + 1} of ${gallery.length}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
              />
              <BeforeAfterBadge isBefore={gallery[activeImage].is_before} t={t} />
            </div>

            {gallery.length > 1 && (() => {
              // Separate images: After first, then Before
              const afterImages = gallery
                .map((img, i) => ({ ...img, originalIndex: i }))
                .filter((img) => !img.is_before);
              const beforeImages = gallery
                .map((img, i) => ({ ...img, originalIndex: i }))
                .filter((img) => img.is_before);

              const renderRow = (images: typeof afterImages, label: string) => images.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: TEXT_MUTED }}>
                    {label}
                  </span>
                  <div className="flex gap-3" role="group" aria-label={`${label} thumbnails`}>
                    {images.map((img) => (
                      <button
                        key={img.src}
                        onClick={() => setActiveImage(img.originalIndex)}
                        className="relative w-20 h-16 rounded-lg overflow-hidden transition-all cursor-pointer"
                        style={{
                          boxShadow: img.originalIndex === activeImage ? `0 0 0 2px ${GOLD}` : neu(2),
                          opacity: img.originalIndex === activeImage ? 1 : 0.7,
                        }}
                        aria-label={`View image ${img.originalIndex + 1} of ${gallery.length}`}
                        aria-pressed={img.originalIndex === activeImage}
                      >
                        <Image src={img.src} alt={img.alt || `${project.title} - image ${img.originalIndex + 1}`} fill sizes="80px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              );

              return (
                <div className="mb-4">
                  {renderRow(afterImages, t('projects.afterLabel'))}
                  {renderRow(beforeImages, t('projects.beforeLabel'))}
                </div>
              );
            })()}

            <p className="text-base leading-relaxed mb-8" style={{ color: TEXT_MID }}>
              {project.description}
            </p>

            {project.challenge && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT }}>{t('modal.challenge')}</h3>
                  <p className="leading-relaxed" style={{ color: TEXT_MID }}>{project.challenge}</p>
                </div>
                {project.solution && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT }}>{t('modal.solution')}</h3>
                    <p className="leading-relaxed" style={{ color: TEXT_MID }}>{project.solution}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div
            className="w-full lg:w-72 flex-shrink-0 p-6"
            style={{
              backgroundColor: SURFACE_ALT,
              boxShadow: `inset 2px 0 4px -2px ${SH_DARK}`,
            }}
          >
            <div className="space-y-5">
              {sidebarItems.map(({ icon: Icon, label, value }) =>
                value ? (
                  <div key={label}>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-1" style={{ color: TEXT_MUTED }}>
                      <Icon className="w-4 h-4" style={{ color: GOLD }} />
                      {label}
                    </div>
                    <div className="font-medium" style={{ color: TEXT }}>{value}</div>
                  </div>
                ) : null
              )}

              {project.service_scope && project.service_scope.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TEXT_MUTED }}>
                    <Wrench className="w-4 h-4" style={{ color: GOLD }} />
                    {t('modal.serviceScope')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.service_scope.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.external_products && project.external_products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TEXT_MUTED }}>
                    <ExternalLink className="w-4 h-4" style={{ color: GOLD }} />
                    {t('projects.externalProducts')}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {project.external_products.map((ep) => (
                      <a
                        key={ep.url}
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:brightness-95"
                        style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                      >
                        {ep.image_url && (
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ep.image_url} alt={ep.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 truncate">{ep.label}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/projects/${project.slug}`}
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: GOLD,
                  boxShadow: `0 4px 20px ${GOLD}44`,
                }}
                onClick={handleClose}
              >
                {t('modal.viewDetails')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
