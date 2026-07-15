'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { CARD, NAVY, TEXT_MID, neu } from '@/lib/theme';

interface WeChatQrModalProps {
  /** The page URL to encode — already UTM-tagged as utm_source=wechat. */
  url: string;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * WeChat's share QR.
 *
 * WeChat exposes no web share URL — scanning is the only real mechanism — so
 * this is a modal rather than a link. Distinct from the Footer's WeChat modal,
 * which shows a static company-contact QR ("add us"); this encodes the page
 * being shared.
 *
 * Rendered via next/dynamic from ShareBar, so `qrcode` (~20KB) stays out of the
 * main bundle and off every locale that never shows a WeChat button.
 */
export default function WeChatQrModal({ url, onClose }: WeChatQrModalProps) {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((mod) => mod.toDataURL(url, { width: 320, margin: 1, color: { dark: NAVY, light: CARD } }))
      .then((encoded) => { if (!cancelled) setDataUrl(encoded); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    modalRef.current?.querySelector<HTMLElement>('button')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: without it, Tab walks out of the dialog into the page
      // behind, which is still fully rendered.
      const focusable = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(27,54,93,0.6)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-qr-title"
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-2xl p-6 text-center max-w-xs w-full"
        style={{
          backgroundColor: CARD,
          boxShadow: neu(8),
          animation: reduceMotion ? undefined : 'fadeIn 0.2s ease-out',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('share.closeQr')}
          className="absolute top-3 end-3 w-8 h-8 inline-flex items-center justify-center rounded-lg cursor-pointer"
          style={{ color: TEXT_MID }}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <h3 id="share-qr-title" className="text-lg font-semibold mb-1" style={{ color: NAVY }}>
          {t('share.wechat')}
        </h3>
        <p className="text-sm mb-4" style={{ color: TEXT_MID }}>{t('share.qrHint')}</p>

        <div className="flex items-center justify-center min-h-[240px]">
          {dataUrl ? (
            // A locally-generated data: URI — there is no remote asset for
            // next/image or OptimizedImage to fetch or optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={t('share.qrAlt')} width={240} height={240} className="rounded-lg" />
          ) : failed ? (
            <p className="text-sm break-all" style={{ color: TEXT_MID }}>{url}</p>
          ) : (
            <span className="text-sm" style={{ color: TEXT_MID }}>{t('share.qrLoading')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
