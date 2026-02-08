'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAdminLocale } from './AdminLocaleProvider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SURFACE } from '@/lib/theme';

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAdminLocale();
  const isMobile = useIsMobile();
  const prevMobileRef = useRef(isMobile);

  const closeSidebar = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, setSidebarOpen]);

  // Close sidebar only when transitioning from mobile to desktop
  useEffect(() => {
    if (prevMobileRef.current && !isMobile) {
      setSidebarOpen(false);
    }
    prevMobileRef.current = isMobile;
  }, [isMobile, setSidebarOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <Sidebar onNavigate={closeSidebar} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main
          className="admin-main-content"
          style={{
            flex: 1,
            backgroundColor: SURFACE,
            padding: '1.5rem',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
