'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';
import { GOLD, SURFACE, TEXT, TEXT_MUTED, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neuIn } from '@/lib/theme';

interface ContactFormProps {
  /** Called after a successful submission */
  onSuccess?: () => void;
  /** Override the submit button label */
  submitLabel?: string;
}

export default function ContactForm({ onSuccess, submitLabel }: ContactFormProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'idle', message: '' });

    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setFormStatus({ type: 'success', message: t('form.success') });
        setFormData({ name: '', email: '', phone: '', message: '' });
        onSuccess?.();
      } else {
        setFormStatus({ type: 'error', message: t('form.error') });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formStatus.type !== 'idle' && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
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
        { id: 'email', type: 'email', label: t('form.email'), ph: t('form.emailPlaceholder'), required: true },
        { id: 'phone', type: 'tel', label: t('form.phone'), ph: t('form.phonePlaceholder2'), required: false },
      ].map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className="block text-sm font-semibold uppercase tracking-wider mb-1.5" style={{ color: TEXT_MUTED }}>
            {f.label}{f.required ? ' *' : ''}
          </label>
          <input
            type={f.type}
            id={f.id}
            name={f.id}
            value={formData[f.id as keyof typeof formData]}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border-none outline-none text-base transition-all duration-200 focus:ring-2 focus:ring-offset-1"
            style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT, '--tw-ring-color': GOLD } as React.CSSProperties}
            placeholder={f.ph}
            required={f.required}
            disabled={isPending}
          />
        </div>
      ))}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold uppercase tracking-wider mb-1.5" style={{ color: TEXT_MUTED }}>
          {t('form.message')} *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border-none outline-none text-base resize-none transition-all duration-200 focus:ring-2 focus:ring-offset-1"
          style={{ boxShadow: neuIn(3), backgroundColor: SURFACE, color: TEXT, '--tw-ring-color': GOLD } as React.CSSProperties}
          placeholder={t('form.messagePlaceholder')}
          required
          disabled={isPending}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? t('form.sending') : (submitLabel || t('cta.sendMessage'))}
      </button>
    </form>
  );
}
