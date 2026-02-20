import { CARD, NAVY, neuIn } from '@/lib/theme';

export const inputStyle: React.CSSProperties = {
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

export const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  boxShadow: 'none',
  opacity: 0.7,
  cursor: 'default',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '100px',
};

export const readOnlyTextareaStyle: React.CSSProperties = {
  ...textareaStyle,
  boxShadow: 'none',
  opacity: 0.7,
  cursor: 'default',
  resize: 'none' as const,
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto' as const,
};
