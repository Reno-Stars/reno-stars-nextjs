import { SURFACE, NAVY } from '@/lib/theme';

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
        <h1
          style={{
            color: NAVY,
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Reno Stars Admin
        </h1>
        {children}
      </div>
    </div>
  );
}
