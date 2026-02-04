'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';

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

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

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
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            style={{
              backgroundColor: t.type === 'success' ? SUCCESS_BG : ERROR_BG,
              color: t.type === 'success' ? SUCCESS : ERROR,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              boxShadow: neu(4),
              maxWidth: '350px',
              border: `1px solid ${t.type === 'success' ? SUCCESS : ERROR}`,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
