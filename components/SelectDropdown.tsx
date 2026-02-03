'use client';

import { ChevronDown } from 'lucide-react';
import { neu, SURFACE_ALT, TEXT, TEXT_MUTED } from '@/lib/theme';
import { CSSProperties } from 'react';

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  style?: CSSProperties;
  ariaLabel?: string;
}

export default function SelectDropdown({ value, onChange, options, style = {}, ariaLabel }: SelectDropdownProps) {
  // Use the first option's label as default aria-label if not provided
  const defaultAriaLabel = options[0]?.label || 'Select an option';

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2.5 text-xs font-medium rounded-lg cursor-pointer transition-all duration-200 outline-none"
        style={{ boxShadow: neu(3), backgroundColor: SURFACE_ALT, color: TEXT, border: 'none', ...style }}
        aria-label={ariaLabel || defaultAriaLabel}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: TEXT_MUTED }} aria-hidden="true" />
    </div>
  );
}
