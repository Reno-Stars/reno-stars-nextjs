'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Tag, DollarSign, Home, Wrench, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Project } from '@/lib/projectsData';

interface ProjectModalProps {
  project: Project | null;
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
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  const [visible, setVisible] = useState(false);

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

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setVisible(true));
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, handleKeyDown]);

  useEffect(() => {
    setActiveImage(0);
  }, [project]);

  if (!project) return null;

  const gallery = project.gallery || [project.image];

  const sidebarItems = [
    { icon: MapPin, label: t('modal.location'), value: project.location },
    { icon: Tag, label: t('modal.category'), value: project.category },
    { icon: DollarSign, label: t('modal.budget'), value: project.budget },
    { icon: Home, label: t('modal.spaceType'), value: project.spaceType },
    { icon: Clock, label: t('modal.duration'), value: project.duration },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-opacity duration-200 ${overlay}`}
      style={{ opacity: visible ? 1 : 0 }}
      onClick={handleClose}
      role="presentation"
    >
      <div
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
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-4 bg-black/5">
              <img
                src={gallery[activeImage]}
                alt={`${project.title} - Image ${activeImage + 1} of ${gallery.length}`}
                className="w-full h-full object-contain"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 mb-8" role="group" aria-label="Image gallery thumbnails">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden transition-all cursor-pointer ${
                      i === activeImage ? thumbActive : thumbInactive
                    }`}
                    aria-label={`View image ${i + 1} of ${gallery.length}`}
                    aria-pressed={i === activeImage}
                  >
                    <img src={img} alt={`${project.title} - image ${i + 1}`} className="w-full h-full object-cover" />
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

              {project.serviceScope && project.serviceScope.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2 ${textSecondary}`}>
                    <Wrench className="w-4 h-4" />
                    {t('modal.serviceScope')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.serviceScope.map((s) => (
                      <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium ${accent}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
