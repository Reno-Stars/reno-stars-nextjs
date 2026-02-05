'use client';

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';
import { GOLD, SURFACE, TEXT, TEXT_MUTED, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neuIn } from '@/lib/theme';

interface ContactFormProps {
  /** Called after a successful submission */
  onSuccess?: () => void;
  /** Override the submit button label */
  submitLabel?: string;
  /** Larger text and inputs for better readability */
  large?: boolean;
}

export default function ContactForm({ onSuccess, submitLabel, large }: ContactFormProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [isPending, startTransition] = useTransition();
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'idle', message: '' });

    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setFormStatus({ type: 'success', message: t('form.success') });
        setFormData({ name: '', email: '', phone: '', message: '' });
        if (onSuccess) {
          successTimerRef.current = setTimeout(onSuccess, 1500);
        }
      } else {
        setFormStatus({ type: 'error', message: result.message || t('form.error') });
      }
    });
  }, [formData, t, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className={large ? 'space-y-6' : 'space-y-5'}>
      {formStatus.type !== 'idle' && (
        <div
          className={`p-4 rounded-xl font-medium ${large ? 'text-base' : 'text-sm'}`}
          style={{
            backgroundColor: formStatus.type === 'success' ? SUCCESS_BG : ERROR_BG,
            color: formStatus.type === 'success' ? SUCCESS : ERROR,
          }}
          role="alert"
        >
          {formStatus.message}
        </div>
      )}
      {[
        { id: 'name', type: 'text', label: t('form.name'), ph: t('form.namePlaceholder'), required: true },
        { id: 'email', type: 'email', label: t('form.email'), ph: t('form.emailPlaceholder'), required: false },
        { id: 'phone', type: 'tel', label: t('form.phone'), ph: t('form.phonePlaceholder2'), required: true },
      ].map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className={`block font-bold uppercase tracking-wider ${large ? 'text-base mb-2' : 'text-sm mb-1.5'}`} style={{ color: TEXT }}>
            {f.label}{f.required ? ' *' : ''}
          </label>
          <input
            type={f.type}
            id={f.id}
            name={f.id}
            value={formData[f.id as keyof typeof formData]}
            onChange={handleInputChange}
            className={`w-full rounded-xl border-none transition-all duration-200 outline-0 focus:outline-2 focus:outline-offset-1 ${large ? 'px-5 py-4 text-lg' : 'px-4 py-3 text-base'}`}
            style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT, outlineColor: GOLD } as React.CSSProperties}
            placeholder={f.ph}
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
  );
}
