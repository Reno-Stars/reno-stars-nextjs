'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CARD, NAVY, GOLD, TEXT_MUTED, neu } from '@/lib/theme';
import { inputStyle, readOnlyStyle } from './shared-styles';

export interface SearchableSelectOption {
  id: string;
  label: string;
}

/** Get background color for dropdown option based on state */
function getOptionBackground(isHighlighted: boolean, isSelected: boolean): string {
  if (isHighlighted) return 'rgba(200, 146, 42, 0.15)';
  if (isSelected) return 'rgba(200, 146, 42, 0.08)';
  return 'transparent';
}

/** Sanitize ID for use in HTML attributes (remove special chars, ensure valid ID) */
function sanitizeHtmlId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-_]/g, '_');
}

// Static styles extracted to avoid re-creation on each render
const dropdownListStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '4px',
  padding: '0.25rem 0',
  backgroundColor: CARD,
  borderRadius: '8px',
  boxShadow: neu(8),
  maxHeight: '240px',
  overflowY: 'auto',
  zIndex: 100,
  listStyle: 'none',
};

const noResultsStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  color: TEXT_MUTED,
  fontSize: '0.875rem',
};

const clearButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: '0.25rem',
  cursor: 'pointer',
  color: TEXT_MUTED,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

interface SearchableSelectProps {
  name: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  noResultsText?: string;
  clearText?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  name,
  options,
  value,
  onChange,
  placeholder = 'Search...',
  noResultsText = 'No results found',
  clearText = 'Clear selection',
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find selected option label
  const selectedOption = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const searchLower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(searchLower));
  }, [options, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].id);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearch('');
        }
        break;
    }
  }, [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) setIsOpen(true);
  }, [isOpen]);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const listboxId = `${name}-listbox`;
  const activeDescendantId = highlightedIndex >= 0 && filteredOptions[highlightedIndex]
    ? `${name}-option-${sanitizeHtmlId(filteredOptions[highlightedIndex].id)}`
    : undefined;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Visible search input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : (selectedOption?.label ?? '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          disabled={disabled}
          style={{
            ...(disabled ? readOnlyStyle : inputStyle),
            paddingRight: value ? '3.5rem' : '2rem',
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        {/* Dropdown arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            position: 'absolute',
            right: value ? '2rem' : '0.75rem',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            transition: 'transform 0.2s',
            pointerEvents: 'none',
            color: TEXT_MUTED,
          }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={clearText}
            style={clearButtonStyle}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          style={dropdownListStyle}
        >
          {filteredOptions.length === 0 ? (
            <li style={noResultsStyle}>
              {noResultsText}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.id}
                id={`${name}-option-${sanitizeHtmlId(option.id)}`}
                role="option"
                aria-selected={option.id === value}
                onClick={() => handleSelect(option.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '0.625rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: NAVY,
                  backgroundColor: getOptionBackground(index === highlightedIndex, option.id === value),
                  fontWeight: option.id === value ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {option.id === value && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ marginLeft: option.id === value ? 0 : '22px' }}>
                  {option.label}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
