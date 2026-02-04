// Light-only neumorphic theme. The shadow utilities (neu, neuIn) rely on the
// warm surface palette and will not render correctly on dark backgrounds.
export const NAVY = '#1B365D';
export const NAVY_MID = '#243f6c';
export const NAVY_LIGHT = '#2d4f7e';
export const GOLD = '#C8922A';
export const GOLD_HOVER = '#b3811f';
export const GOLD_PALE = 'rgba(200,146,42,0.12)';
export const SURFACE = '#E8E2DA';
export const SURFACE_ALT = '#DED6CC';
export const CARD = '#EDE8E1';
export const SH_DARK = '#c4bbb0';
export const SH_LIGHT = '#faf5ee';
export const TEXT = '#1B365D';
export const TEXT_MID = 'rgba(27,54,93,0.7)';
export const TEXT_MUTED = 'rgba(27,54,93,0.5)';

export const SUCCESS = '#16a34a';
export const SUCCESS_BG = 'rgba(34, 197, 94, 0.1)';
export const ERROR = '#dc2626';
export const ERROR_BG = 'rgba(239, 68, 68, 0.1)';

export const neu = (s = 6): string => `${s}px ${s}px ${s*2}px ${SH_DARK}, -${s}px -${s}px ${s*2}px ${SH_LIGHT}`;
export const neuIn = (s = 6): string => `inset ${s}px ${s}px ${s*2}px ${SH_DARK}, inset -${s}px -${s}px ${s*2}px ${SH_LIGHT}`;
