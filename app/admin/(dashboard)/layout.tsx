import { requireAuth } from '@/lib/admin/auth';
import DashboardShell from '@/components/admin/DashboardShell';
import { ToastProvider } from '@/components/admin/ToastProvider';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <ToastProvider>
      <DashboardShell>{children}</DashboardShell>
    </ToastProvider>
  );
}
