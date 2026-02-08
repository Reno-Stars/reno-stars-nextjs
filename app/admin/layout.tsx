import type { Metadata } from 'next';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';
import './admin-responsive.css';

export const metadata: Metadata = {
  title: 'Admin | Reno Stars',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminLocaleProvider>{children}</AdminLocaleProvider>
      </body>
    </html>
  );
}
