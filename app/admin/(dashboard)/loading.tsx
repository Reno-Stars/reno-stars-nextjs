import { NAVY } from '@/lib/theme';

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
        color: NAVY,
        fontSize: '0.875rem',
      }}
    >
      Loading...
    </div>
  );
}
