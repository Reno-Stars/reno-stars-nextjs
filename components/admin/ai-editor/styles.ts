import { SURFACE } from '@/lib/theme';

/** Shared textarea style for excerpt and meta description fields */
export const excerptTextareaStyle = {
  width: '100%',
  padding: '0.75rem',
  border: `1px solid rgba(27,54,93,0.15)`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  minHeight: '60px',
  background: SURFACE,
};

/** Section header label style */
export const sectionLabelStyle = {
  color: '#1B365D',
  fontWeight: 600,
  fontSize: '0.8125rem',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
};

/** Field label style for EN/ZH sub-labels */
export const fieldLabelStyle = {
  fontSize: '0.6875rem',
  color: 'rgba(27,54,93,0.5)',
  marginBottom: '0.25rem',
  display: 'block',
};
