import { describe, it, expect } from 'vitest';
import { e164, telHref } from '@/lib/phone';

describe('phone helpers', () => {
  it('e164 strips punctuation and prefixes +1', () => {
    expect(e164('778-960-7999')).toBe('+17789607999');
    expect(e164('(778) 960-7999')).toBe('+17789607999');
    expect(e164('+1 778 960 7999')).toBe('+17789607999');
    expect(e164('17789607999')).toBe('+17789607999');
  });
  it('telHref wraps e164', () => {
    expect(telHref('778-960-7999')).toBe('tel:+17789607999');
  });
});
