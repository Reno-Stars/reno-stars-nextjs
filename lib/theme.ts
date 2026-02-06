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
export const INFO = '#3b82f6';
export const INFO_BG = 'rgba(59, 130, 246, 0.1)';

// Process page step colors
export const STEP_TEAL = '#00A99D';
export const STEP_TEAL_LIGHT = '#E6F7F6';
export const STEP_ORANGE = '#F7931E';
export const STEP_ORANGE_LIGHT = '#FEF3E6';
export const STEP_GREEN = '#8DC63F';
export const STEP_GREEN_LIGHT = '#F3FAE9';
export const STEP_RED = '#ED1C24';
export const STEP_RED_LIGHT = '#FDE8E9';

// Illustration palette
export const ILLUS_SKIN = '#FFD5C8';
export const ILLUS_SKIN_DARK = '#D4A574';
export const ILLUS_SKY = '#4FC3F7';
export const ILLUS_WOOD = '#8B4513';
export const ILLUS_YELLOW = '#FFD700';
export const ILLUS_GRAY_DARK = '#333';
export const ILLUS_GRAY_MID = '#666';
export const ILLUS_GRAY_LIGHT = '#888';
export const ILLUS_GRAY_PALE = '#ccc';

export const neu = (s = 6): string => `${s}px ${s}px ${s*2}px ${SH_DARK}, -${s}px -${s}px ${s*2}px ${SH_LIGHT}`;
export const neuIn = (s = 6): string => `inset ${s}px ${s}px ${s*2}px ${SH_DARK}, inset -${s}px -${s}px ${s*2}px ${SH_LIGHT}`;
