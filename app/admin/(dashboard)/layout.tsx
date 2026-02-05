import { requireAuth } from '@/lib/admin/auth';
import Sidebar from '@/components/admin/Sidebar';
import TopBar from '@/components/admin/TopBar';
import { ToastProvider } from '@/components/admin/ToastProvider';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';
import { SURFACE } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <AdminLocaleProvider>
      <ToastProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TopBar />
            <main
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
      </ToastProvider>
    </AdminLocaleProvider>
  );
}
