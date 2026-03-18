'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { GOLD, SURFACE_ALT, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  translations: {
    title: string;
    subtitle?: string;
  };
}

export default function FaqSection({ faqs, translations: t }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 id="faq-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          {t.subtitle && <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>}
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="text-base font-semibold pr-4" style={{ color: TEXT }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                    style={{ color: GOLD, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                <div
                  id={`faq-answer-${faq.id}`}
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-base leading-relaxed" style={{ color: TEXT_MID }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
