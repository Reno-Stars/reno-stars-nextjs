import {
  NAVY,
  STEP_TEAL, STEP_ORANGE, STEP_GREEN, STEP_RED,
  ILLUS_SKIN, ILLUS_SKIN_DARK, ILLUS_SKY, ILLUS_WOOD, ILLUS_YELLOW,
  ILLUS_GRAY_DARK, ILLUS_GRAY_MID, ILLUS_GRAY_LIGHT, ILLUS_GRAY_PALE,
} from '@/lib/theme';

export function PhoneIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Person with phone */}
      <circle cx="60" cy="30" r="18" fill={ILLUS_SKIN} />
      <path d="M42 55 Q60 45 78 55 L78 85 Q60 95 42 85 Z" fill={STEP_TEAL} />
      {/* Phone */}
      <rect x="72" y="35" width="18" height="30" rx="3" fill={ILLUS_GRAY_DARK} />
      <rect x="74" y="38" width="14" height="22" rx="1" fill={ILLUS_SKY} />
      {/* Chat bubbles */}
      <rect x="20" y="20" width="22" height="14" rx="4" fill={STEP_ORANGE} />
      <polygon points="30,34 35,34 32,40" fill={STEP_ORANGE} />
      <circle cx="26" cy="27" r="2" fill="white" />
      <circle cx="31" cy="27" r="2" fill="white" />
      <circle cx="36" cy="27" r="2" fill="white" />
      {/* Computer */}
      <rect x="8" y="60" width="28" height="20" rx="2" fill={ILLUS_GRAY_DARK} />
      <rect x="10" y="62" width="24" height="14" fill={ILLUS_SKY} />
      <rect x="16" y="80" width="16" height="3" fill={ILLUS_GRAY_MID} />
      <rect x="12" y="83" width="24" height="2" fill={ILLUS_GRAY_LIGHT} />
    </svg>
  );
}

export function MeasureIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* House outline with measurements */}
      <path d="M60 15 L100 45 L100 95 L20 95 L20 45 Z" fill="none" stroke={STEP_ORANGE} strokeWidth="2" strokeDasharray="4,2" />
      <path d="M60 15 L20 45" fill="none" stroke={STEP_ORANGE} strokeWidth="2" />
      <path d="M60 15 L100 45" fill="none" stroke={STEP_ORANGE} strokeWidth="2" />
      {/* Measurement lines */}
      <line x1="15" y1="45" x2="15" y2="95" stroke={STEP_TEAL} strokeWidth="2" />
      <line x1="10" y1="45" x2="20" y2="45" stroke={STEP_TEAL} strokeWidth="2" />
      <line x1="10" y1="95" x2="20" y2="95" stroke={STEP_TEAL} strokeWidth="2" />
      <text x="8" y="72" fill={STEP_TEAL} fontSize="8" fontWeight="bold">3.5m</text>
      {/* Ruler */}
      <rect x="70" y="70" width="40" height="8" fill={ILLUS_YELLOW} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="75" y1="70" x2="75" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="80" y1="70" x2="80" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="85" y1="70" x2="85" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="90" y1="70" x2="90" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="95" y1="70" x2="95" y2="78" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Clipboard */}
      <rect x="30" y="55" width="25" height="35" rx="2" fill={ILLUS_WOOD} />
      <rect x="33" y="60" width="19" height="27" fill="white" />
      <rect x="38" y="50" width="9" height="8" rx="1" fill={ILLUS_GRAY_MID} />
      <line x1="36" y1="67" x2="49" y2="67" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="36" y1="73" x2="49" y2="73" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="36" y1="79" x2="45" y2="79" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Person */}
      <circle cx="85" cy="45" r="10" fill={ILLUS_SKIN} />
      <path d="M75 58 Q85 52 95 58 L95 70 L75 70 Z" fill={STEP_ORANGE} />
    </svg>
  );
}

export function ContractIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Contract document */}
      <rect x="35" y="20" width="50" height="65" rx="3" fill="white" stroke={ILLUS_GRAY_DARK} strokeWidth="2" />
      <text x="60" y="35" textAnchor="middle" fill={ILLUS_GRAY_DARK} fontSize="7" fontWeight="bold">CONTRACT</text>
      <line x1="42" y1="45" x2="78" y2="45" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="52" x2="78" y2="52" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="59" x2="78" y2="59" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      <line x1="42" y1="66" x2="65" y2="66" stroke={ILLUS_GRAY_PALE} strokeWidth="1" />
      {/* Signature */}
      <path d="M50 73 Q55 68 60 73 Q65 78 70 73" fill="none" stroke={NAVY} strokeWidth="2" />
      {/* Handshake */}
      <ellipse cx="60" cy="100" rx="25" ry="12" fill={STEP_GREEN} opacity="0.3" />
      <path d="M40 95 L50 90 L55 95 L50 100 Z" fill={ILLUS_SKIN} />
      <path d="M80 95 L70 90 L65 95 L70 100 Z" fill={ILLUS_SKIN_DARK} />
      <path d="M50 95 L70 95" stroke={ILLUS_GRAY_DARK} strokeWidth="2" />
      {/* Checkmark */}
      <circle cx="90" cy="35" r="12" fill={STEP_GREEN} />
      <path d="M84 35 L88 39 L96 31" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pen */}
      <rect x="15" y="50" width="6" height="35" rx="1" fill={NAVY} transform="rotate(-30 18 67)" />
      <polygon points="15,82 18,90 21,82" fill={ILLUS_YELLOW} transform="rotate(-30 18 86)" />
    </svg>
  );
}

export function ConstructionIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* House under construction */}
      <path d="M60 20 L95 45 L95 90 L25 90 L25 45 Z" fill="#FFF3E0" stroke={ILLUS_WOOD} strokeWidth="2" />
      <path d="M60 20 L25 45" fill="none" stroke={ILLUS_WOOD} strokeWidth="3" />
      <path d="M60 20 L95 45" fill="none" stroke={ILLUS_WOOD} strokeWidth="3" />
      {/* Scaffolding */}
      <line x1="100" y1="40" x2="100" y2="90" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="110" y1="40" x2="110" y2="90" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="50" x2="110" y2="50" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="65" x2="110" y2="65" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      <line x1="100" y1="80" x2="110" y2="80" stroke={ILLUS_GRAY_MID} strokeWidth="2" />
      {/* Window */}
      <rect x="40" y="55" width="15" height="20" fill={ILLUS_SKY} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="47.5" y1="55" x2="47.5" y2="75" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <line x1="40" y1="65" x2="55" y2="65" stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      {/* Door */}
      <rect x="62" y="60" width="18" height="30" fill={ILLUS_WOOD} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <circle cx="76" cy="75" r="2" fill={ILLUS_YELLOW} />
      {/* Worker with hardhat */}
      <circle cx="20" cy="60" r="8" fill={ILLUS_SKIN} />
      <ellipse cx="20" cy="55" rx="10" ry="5" fill={ILLUS_YELLOW} />
      <rect x="15" y="68" width="10" height="20" fill={STEP_ORANGE} />
      {/* Tools */}
      <rect x="8" y="75" width="4" height="18" fill={ILLUS_WOOD} />
      <rect x="5" y="72" width="10" height="5" fill={ILLUS_GRAY_MID} />
      {/* Bricks */}
      <rect x="70" y="45" width="8" height="4" fill={STEP_RED} />
      <rect x="79" y="45" width="8" height="4" fill={STEP_RED} />
      <rect x="74" y="50" width="8" height="4" fill={STEP_RED} />
    </svg>
  );
}

export function KeyIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      {/* Completed house */}
      <path d="M60 25 L95 50 L95 90 L25 90 L25 50 Z" fill="#E8F5E9" stroke={STEP_GREEN} strokeWidth="2" />
      <path d="M60 25 L25 50" fill="none" stroke={STEP_GREEN} strokeWidth="3" />
      <path d="M60 25 L95 50" fill="none" stroke={STEP_GREEN} strokeWidth="3" />
      {/* Chimney */}
      <rect x="75" y="30" width="10" height="15" fill={ILLUS_WOOD} />
      {/* Window with curtains */}
      <rect x="35" y="55" width="18" height="20" fill={ILLUS_SKY} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <path d="M35 55 Q39 65 35 75" fill={STEP_ORANGE} opacity="0.5" />
      <path d="M53 55 Q49 65 53 75" fill={STEP_ORANGE} opacity="0.5" />
      {/* Door */}
      <rect x="62" y="60" width="18" height="30" fill={ILLUS_WOOD} stroke={ILLUS_GRAY_DARK} strokeWidth="1" />
      <circle cx="76" cy="75" r="2" fill={ILLUS_YELLOW} />
      {/* Welcome mat */}
      <rect x="60" y="88" width="22" height="4" fill={STEP_GREEN} />
      {/* Large key */}
      <g transform="translate(10, 40) rotate(-30)">
        <circle cx="15" cy="15" r="12" fill="none" stroke={ILLUS_YELLOW} strokeWidth="4" />
        <rect x="23" y="12" width="35" height="6" fill={ILLUS_YELLOW} />
        <rect x="45" y="18" width="3" height="8" fill={ILLUS_YELLOW} />
        <rect x="52" y="18" width="3" height="6" fill={ILLUS_YELLOW} />
      </g>
      {/* Sparkles */}
      <g fill={ILLUS_YELLOW}>
        <polygon points="100,30 102,35 107,35 103,38 105,43 100,40 95,43 97,38 93,35 98,35" />
        <polygon points="15,80 16,83 19,83 17,85 18,88 15,86 12,88 13,85 11,83 14,83" transform="scale(0.7) translate(10,20)" />
      </g>
      {/* Checkmark badge */}
      <circle cx="95" cy="25" r="10" fill={STEP_GREEN} />
      <path d="M90 25 L93 28 L100 21" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TreeSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden="true">
      <polygon points="20,5 35,25 28,25 38,40 25,40 25,55 15,55 15,40 2,40 12,25 5,25" fill={STEP_TEAL} />
      <rect x="15" y="48" width="10" height="12" fill={ILLUS_WOOD} />
    </svg>
  );
}

export function HouseSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" className={className} aria-hidden="true">
      <path d="M25 5 L45 22 L45 45 L5 45 L5 22 Z" fill="#FFE4C4" stroke={ILLUS_WOOD} strokeWidth="1.5" />
      <path d="M25 5 L5 22" stroke={ILLUS_WOOD} strokeWidth="2" />
      <path d="M25 5 L45 22" stroke={ILLUS_WOOD} strokeWidth="2" />
      <rect x="20" y="28" width="10" height="17" fill={ILLUS_WOOD} />
      <rect x="10" y="25" width="8" height="8" fill={ILLUS_SKY} />
      <rect x="32" y="25" width="8" height="8" fill={ILLUS_SKY} />
    </svg>
  );
}

export const stepIllustrations = [
  PhoneIllustration,
  MeasureIllustration,
  ContractIllustration,
  ConstructionIllustration,
  KeyIllustration,
];
