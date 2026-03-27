import { describe, it, expect } from 'vitest';
import { parseTimeToSeconds, formatBytes, getExtension } from '@/lib/admin/video-compress';

describe('parseTimeToSeconds', () => {
  it('parses standard HH:MM:SS.xx format', () => {
    expect(parseTimeToSeconds('00:01:23.45')).toBeCloseTo(83.45);
  });

  it('parses zero duration', () => {
    expect(parseTimeToSeconds('00:00:00.00')).toBe(0);
  });

  it('parses hours correctly', () => {
    expect(parseTimeToSeconds('02:30:15.50')).toBeCloseTo(2 * 3600 + 30 * 60 + 15.50);
  });

  it('returns 0 for invalid format (too few parts)', () => {
    expect(parseTimeToSeconds('01:23')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(parseTimeToSeconds('')).toBe(0);
  });

  it('returns 0 for single value', () => {
    expect(parseTimeToSeconds('123')).toBe(0);
  });

  it('handles fractional seconds', () => {
    expect(parseTimeToSeconds('00:00:01.99')).toBeCloseTo(1.99);
  });
});

describe('formatBytes', () => {
  it('formats bytes under 1 MB as KB', () => {
    expect(formatBytes(512 * 1024)).toBe('512 KB');
  });

  it('formats small byte values as KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats bytes at 1 MB boundary as MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats large values as MB with one decimal', () => {
    expect(formatBytes(150 * 1024 * 1024)).toBe('150.0 MB');
  });

  it('formats fractional MB', () => {
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 KB');
  });
});

describe('getExtension', () => {
  it('extracts .mp4 extension', () => {
    expect(getExtension('video.mp4')).toBe('.mp4');
  });

  it('extracts .mov extension', () => {
    expect(getExtension('recording.mov')).toBe('.mov');
  });

  it('handles multiple dots', () => {
    expect(getExtension('my.video.file.webm')).toBe('.webm');
  });

  it('returns empty string for no extension', () => {
    expect(getExtension('noextension')).toBe('');
  });

  it('returns empty string for empty filename', () => {
    expect(getExtension('')).toBe('');
  });

  it('handles dotfiles', () => {
    expect(getExtension('.hidden')).toBe('.hidden');
  });
});
