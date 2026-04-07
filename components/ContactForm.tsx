'use client';

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, X } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';
import { trackFormSubmission } from '@/lib/analytics';
import { GOLD, SURFACE, TEXT, SUCCESS, ERROR, ERROR_BG, neuIn, neu, CARD } from '@/lib/theme';

interface ContactFormProps {
  /** Called after a successful submission */
  onSuccess?: () => void;
  /** Override the submit button label */
  submitLabel?: string;
  /** Larger text and inputs for better readability */
  large?: boolean;
}

/** Field configuration for the contact form - defined outside component to avoid recreation */
const FORM_FIELDS = [
  { id: 'name', type: 'text', labelKey: 'form.name', placeholderKey: 'form.namePlaceholder', required: true },
  { id: 'email', type: 'email', labelKey: 'form.email', placeholderKey: 'form.emailPlaceholder', required: false },
  { id: 'phone', type: 'tel', labelKey: 'form.phone', placeholderKey: 'form.phonePlaceholder2', required: true },
] as const;

export default function ContactForm({ onSuccess, submitLabel, large }: ContactFormProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const closeModalAndCallback = useCallback(() => {
    setShowSuccessModal(false);
    if (onSuccess) onSuccess();
  }, [onSuccess]);

  const handleCloseModal = useCallback(() => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    closeModalAndCallback();
  }, [closeModalAndCallback]);

  // Close modal on Escape key
  useEffect(() => {
    if (!showSuccessModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuccessModal, handleCloseModal]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        trackFormSubmission('contact');
        setShowSuccessModal(true);
        // Auto-close modal after 4 seconds
        successTimerRef.current = setTimeout(closeModalAndCallback, 4000);
      } else {
        setErrorMessage(result.message || t('form.error'));
      }
    });
  }, [formData, t, closeModalAndCallback]);

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <div
            className="relative w-full max-w-md p-8 rounded-2xl text-center"
            style={{
              backgroundColor: CARD,
              boxShadow: neu(12),
              animation: 'modalFadeIn 0.3s ease-out',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label={t('modal.close')}
            >
              <X className="w-5 h-5" style={{ color: TEXT }} />
            </button>
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${SUCCESS}15` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: SUCCESS }} />
            </div>
            <h2 id="success-modal-title" className="text-xl font-bold mb-2" style={{ color: TEXT }}>
              {t('form.successTitle')}
            </h2>
            <p className="text-base" style={{ color: TEXT, opacity: 0.8 }}>
              {t('form.success')}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={large ? 'space-y-6' : 'space-y-5'}>
        {/* Error alert - inline */}
        {errorMessage && (
          <div
            id="form-error"
            className={`p-4 rounded-xl font-medium ${large ? 'text-base' : 'text-sm'}`}
            style={{ backgroundColor: ERROR_BG, color: ERROR }}
            role="alert"
          >
            {errorMessage}
          </div>
        )}
        {FORM_FIELDS.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className={`block font-bold uppercase tracking-wider ${large ? 'text-base mb-2' : 'text-sm mb-1.5'}`} style={{ color: TEXT }}>
              {t(f.labelKey)}{f.required ? ' *' : ''}
            </label>
            <input
              type={f.type}
              id={f.id}
              name={f.id}
              value={formData[f.id as keyof typeof formData]}
              onChange={handleInputChange}
              className={`w-full rounded-xl border-none transition-all duration-200 outline-0 focus:outline-2 focus:outline-offset-1 ${large ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'}`}
              style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT, outlineColor: GOLD } as React.CSSProperties}
              placeholder={t(f.placeholderKey)}
              required={f.required}
              disabled={isPending}
            />
          </div>
        ))}
      <div>
        <label htmlFor="message" className={`block font-bold uppercase tracking-wider ${large ? 'text-base mb-2' : 'text-sm mb-1.5'}`} style={{ color: TEXT }}>
          {t('form.message')} *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={5}
          className={`w-full rounded-xl border-none resize-none transition-all duration-200 outline-0 focus:outline-2 focus:outline-offset-1 ${large ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'}`}
          style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT, outlineColor: GOLD } as React.CSSProperties}
          placeholder={t('form.messagePlaceholder')}
          required
          disabled={isPending}
        />
      </div>
      <button
        type="submit"
        className={`w-full rounded-xl font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${large ? 'py-4 text-lg' : 'py-3.5 text-base'}`}
        style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending && <Loader2 className={large ? 'w-5 h-5 animate-spin' : 'w-4 h-4 animate-spin'} />}
        {isPending ? t('form.sending') : (submitLabel || t('cta.sendMessage'))}
      </button>
      </form>
    </>
  );
}
