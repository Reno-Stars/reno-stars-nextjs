'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const t = useAdminTranslations();

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Catch unhandled server action / network errors globally
  useEffect(() => {
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason ?? '');
      if (msg.includes('Body exceeded')) {
        e.preventDefault();
        toast(t.common.uploadTooLarge, 'error');
      } else if (msg.includes('Failed to fetch') || msg.includes('Server Action')) {
        e.preventDefault();
        toast(t.common.unexpectedError, 'error');
      }
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', onUnhandledRejection);
  }, [toast, t]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            style={{
              backgroundColor: item.type === 'success' ? SUCCESS_BG : ERROR_BG,
              color: item.type === 'success' ? SUCCESS : ERROR,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              boxShadow: neu(4),
              maxWidth: '350px',
              border: `1px solid ${item.type === 'success' ? SUCCESS : ERROR}`,
            }}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
