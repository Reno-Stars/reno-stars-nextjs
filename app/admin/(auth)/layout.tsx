import { SURFACE } from '@/lib/theme';
import AuthTitle from '@/components/admin/AuthTitle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: SURFACE,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <AuthTitle />
        {children}
      </div>
    </div>
  );
}
