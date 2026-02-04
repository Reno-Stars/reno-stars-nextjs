import { CARD, NAVY, neuIn } from '@/lib/theme';

export const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: 'none',
  boxShadow: neuIn(3),
  backgroundColor: CARD,
  color: NAVY,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};
