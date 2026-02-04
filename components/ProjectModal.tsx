'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, MapPin, Tag, DollarSign, Home, Wrench, Clock, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { LocalizedProject } from '@/lib/types';

interface ProjectModalProps {
  project: LocalizedProject | null;
  onClose: () => void;
  theme?: {
    overlay?: string;
    modal?: string;
    text?: string;
    textSecondary?: string;
    accent?: string;
    border?: string;
    sidebarBg?: string;
    closeBtn?: string;
    thumbActive?: string;
    thumbInactive?: string;
  };
}

export default function ProjectModal({ project, onClose, theme = {} }: ProjectModalProps) {
  const t = useTranslations();
  const [activeImage, setActiveImage] = useState(0);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    overlay = 'bg-black/60 backdrop-blur-sm',
    modal = 'bg-white',
    text = 'text-gray-900',
    textSecondary = 'text-gray-600',
    accent = 'bg-gray-900 text-white',
    border = 'border-gray-200',
    sidebarBg = 'bg-gray-50',
    closeBtn = 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    thumbActive = 'ring-2 ring-gray-900',
    thumbInactive = 'ring-1 ring-gray-300 opacity-70 hover:opacity-100',
  } = theme;

  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleClose = useCallback(() => {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
    // Focus trap: cycle through focusable elements within the modal
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
    // Focus the close button when modal opens
    const closeButton = modalRef.current?.querySelector<HTMLElement>('button');
    closeButton?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [project, handleKeyDown]);

  useEffect(() => {
    setActiveImage(0);
  }, [project]);

  if (!project) return null;

  const gallery = project.images.length > 0
    ? project.images.map(img => img.src)
    : [project.hero_image];

  const sidebarItems = [
    { icon: MapPin, label: t('modal.location'), value: project.location_city },
    { icon: Tag, label: t('modal.category'), value: project.category },
    { icon: DollarSign, label: t('modal.budget'), value: project.budget_range },
    { icon: Home, label: t('modal.spaceType'), value: project.space_type },
    { icon: Clock, label: t('modal.duration'), value: project.duration },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-opacity duration-200 ${overlay}`}
      style={{ opacity: visible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-200 ${modal} ${text}`}
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.97)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${border} ${modal}`}>
          <h2 id="modal-title" className="text-xl md:text-2xl font-bold truncate pr-4">{project.title}</h2>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${closeBtn}`}
            aria-label={t('modal.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-4 bg-black/5">
              <Image
                src={gallery[activeImage]}
                alt={`${project.title} - Image ${activeImage + 1} of ${gallery.length}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 mb-8" role="group" aria-label="Image gallery thumbnails">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden transition-all cursor-pointer ${
                      i === activeImage ? thumbActive : thumbInactive
                    }`}
                    aria-label={`View image ${i + 1} of ${gallery.length}`}
                    aria-pressed={i === activeImage}
                  >
                    <Image src={img} alt={`${project.title} - image ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <p className={`text-base leading-relaxed mb-8 ${textSecondary}`}>{project.description}</p>

            {project.challenge && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('modal.challenge')}</h3>
                  <p className={`leading-relaxed ${textSecondary}`}>{project.challenge}</p>
                </div>
                {project.solution && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('modal.solution')}</h3>
                    <p className={`leading-relaxed ${textSecondary}`}>{project.solution}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`w-full lg:w-72 flex-shrink-0 p-6 lg:border-l ${border} ${sidebarBg}`}>
            <div className="space-y-5">
              {sidebarItems.map(({ icon: Icon, label, value }) =>
                value ? (
                  <div key={label}>
                    <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-1 ${textSecondary}`}>
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    <div className="font-medium">{value}</div>
                  </div>
                ) : null
              )}

              {project.service_scope && project.service_scope.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2 ${textSecondary}`}>
                    <Wrench className="w-4 h-4" />
                    {t('modal.serviceScope')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.service_scope.map((s) => (
                      <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium ${accent}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/projects/${project.slug}`}
                className={`mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${accent}`}
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
