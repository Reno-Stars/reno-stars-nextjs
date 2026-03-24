import { describe, it, expect } from 'vitest';
import {
  getBaseUrl,
  formatSlug,
  ensureUniqueSlug,
  truncate,
  capitalize,
  formatCurrency,
  clamp,
  chunk,
  unique,
  shuffle,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  formatDate,
  getRelativeTime,
  buildAlternates,
  buildUrl,
  cleanObject,
  deepClone,
} from '@/lib/utils';

describe('Environment Utilities', () => {
  describe('getBaseUrl', () => {
    const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_BASE_URL;
      }
    });

    it('should return env variable when set', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
      expect(getBaseUrl()).toBe('https://example.com');
    });

    it('should return fallback when env is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      expect(getBaseUrl()).toBe('https://www.reno-stars.com');
    });
  });
});

describe('String Utilities', () => {
  describe('formatSlug', () => {
    it('should convert text to lowercase hyphenated slug', () => {
      expect(formatSlug('Hello World')).toBe('hello-world');
      expect(formatSlug('Kitchen Renovation')).toBe('kitchen-renovation');
    });

    it('should handle multiple spaces', () => {
      expect(formatSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should remove special characters', () => {
      expect(formatSlug("Hello! World?")).toBe('hello-world');
      expect(formatSlug('Test@#$%String')).toBe('test-string');
    });

    it('should handle empty string', () => {
      expect(formatSlug('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should truncate long text with ellipsis', () => {
      expect(truncate('This is a long text', 10)).toBe('This is a ...');
    });

    it('should handle exact length', () => {
      expect(truncate('Exact', 5)).toBe('Exact');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });
});

describe('Number Utilities', () => {
  describe('formatCurrency', () => {
    it('should format numbers as Canadian currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
      expect(result).toContain('$');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(15000)).toContain('15,000');
    });

    it('should handle decimals', () => {
      expect(formatCurrency(1234.56)).toContain('1,234.56');
    });
  });

  describe('clamp', () => {
    it('should return number within range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('should clamp to minimum', () => {
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(-5, 1, 10)).toBe(1);
    });

    it('should clamp to maximum', () => {
      expect(clamp(15, 1, 10)).toBe(10);
      expect(clamp(100, 1, 10)).toBe(10);
    });
  });
});

describe('Array Utilities', () => {
  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle exact division', () => {
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    it('should handle size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('unique', () => {
    it('should remove duplicate numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should remove duplicate strings', () => {
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    it('should handle already unique array', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('should return array of same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(arr.length);
    });

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(isValidPhone('(604) 555-0123')).toBe(true);
      expect(isValidPhone('+1 604 555 0123')).toBe(true);
      expect(isValidPhone('604-555-0123')).toBe(true);
      expect(isValidPhone('6045550123')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidPostalCode', () => {
    it('should validate correct Canadian postal codes', () => {
      expect(isValidPostalCode('V6W 1M2')).toBe(true);
      expect(isValidPostalCode('V6W1M2')).toBe(true);
      expect(isValidPostalCode('v6w 1m2')).toBe(true);
      expect(isValidPostalCode('A1A-1A1')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(isValidPostalCode('12345')).toBe(false);
      expect(isValidPostalCode('AAAAAA')).toBe(false);
      expect(isValidPostalCode('')).toBe(false);
    });
  });
});

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date object', () => {
      const date = new Date('2024-06-15');
      const formatted = formatDate(date, 'en-CA');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('June');
    });

    it('should format date string', () => {
      const formatted = formatDate('2024-06-15', 'en-CA');
      expect(formatted).toContain('2024');
    });

    it('should return Invalid Date for bad input', () => {
      expect(formatDate('not-a-date')).toBe('Invalid Date');
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time for recent dates', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = getRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    it('should return relative time for hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = getRelativeTime(twoHoursAgo);
      expect(result).toContain('hour');
    });

    it('should return relative time for days ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const result = getRelativeTime(threeDaysAgo);
      expect(result).toContain('day');
    });

    it('should return Invalid Date for bad input', () => {
      expect(getRelativeTime('garbage')).toBe('Invalid Date');
    });

    it('should accept string dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = getRelativeTime(yesterday);
      expect(result).toBeTruthy();
      expect(result).not.toBe('Invalid Date');
    });
  });
});

describe('Metadata Utilities', () => {
  describe('buildAlternates', () => {
    const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://www.reno-stars.com';
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_BASE_URL;
      }
    });

    it('should build canonical and hreflang alternates', () => {
      const result = buildAlternates('/projects/', 'en');
      expect(result.canonical).toBe('https://www.reno-stars.com/en/projects/');
      expect(result.languages.en).toBe('https://www.reno-stars.com/en/projects/');
      expect(result.languages.zh).toBe('https://www.reno-stars.com/zh/projects/');
      expect(result.languages['x-default']).toBe('https://www.reno-stars.com/en/projects/');
    });

    it('should use current locale for canonical', () => {
      const result = buildAlternates('/contact/', 'zh');
      expect(result.canonical).toBe('https://www.reno-stars.com/zh/contact/');
    });

    it('should handle root path', () => {
      const result = buildAlternates('/', 'en');
      expect(result.canonical).toBe('https://www.reno-stars.com/en/');
      expect(result.languages.zh).toBe('https://www.reno-stars.com/zh/');
    });
  });
});

describe('URL Utilities', () => {
  describe('buildUrl', () => {
    it('should build URL with query parameters', () => {
      const url = buildUrl('https://example.com/search', {
        q: 'test',
        page: 1,
      });
      expect(url).toBe('https://example.com/search?q=test&page=1');
    });

    it('should skip undefined values', () => {
      const url = buildUrl('https://example.com/search', {
        q: 'test',
        filter: undefined,
      });
      expect(url).toBe('https://example.com/search?q=test');
    });
  });
});

describe('Object Utilities', () => {
  describe('cleanObject', () => {
    it('should remove null and undefined values', () => {
      const obj = { a: 1, b: null, c: undefined, d: 'test' };
      expect(cleanObject(obj)).toEqual({ a: 1, d: 'test' });
    });

    it('should keep falsy values like 0 and empty string', () => {
      const obj = { a: 0, b: '', c: false };
      expect(cleanObject(obj)).toEqual({ a: 0, b: '', c: false });
    });
  });

  describe('deepClone', () => {
    it('should create a deep copy', () => {
      const original = { a: { b: { c: 1 } } };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.a).not.toBe(original.a);
    });

    it('should handle arrays', () => {
      const original = { arr: [1, 2, { nested: true }] };
      const clone = deepClone(original);

      expect(clone.arr).toEqual(original.arr);
      expect(clone.arr).not.toBe(original.arr);
    });
  });
});

describe('Slug Utilities', () => {
  describe('ensureUniqueSlug', () => {
    it('should return slug unchanged when no collision', () => {
      const existingSlugs = ['kitchen-renovation', 'bathroom-remodel'];
      expect(ensureUniqueSlug('new-project', existingSlugs)).toBe('new-project');
    });

    it('should append -2 on first collision', () => {
      const existingSlugs = ['kitchen-renovation', 'bathroom-remodel'];
      expect(ensureUniqueSlug('kitchen-renovation', existingSlugs)).toBe('kitchen-renovation-2');
    });

    it('should append -3 when -2 is also taken', () => {
      const existingSlugs = ['kitchen-renovation', 'kitchen-renovation-2'];
      expect(ensureUniqueSlug('kitchen-renovation', existingSlugs)).toBe('kitchen-renovation-3');
    });

    it('should find next available suffix with multiple collisions', () => {
      const existingSlugs = [
        'project',
        'project-2',
        'project-3',
        'project-4',
      ];
      expect(ensureUniqueSlug('project', existingSlugs)).toBe('project-5');
    });

    it('should handle empty existing slugs array', () => {
      expect(ensureUniqueSlug('any-slug', [])).toBe('any-slug');
    });

    it('should exclude specified slug (for updates)', () => {
      const existingSlugs = ['kitchen-renovation', 'bathroom-remodel'];
      // When updating, the project's own slug should not count as a collision
      expect(ensureUniqueSlug('kitchen-renovation', existingSlugs, 'kitchen-renovation')).toBe('kitchen-renovation');
    });

    it('should still deduplicate when excludeSlug is different', () => {
      const existingSlugs = ['kitchen-renovation', 'bathroom-remodel'];
      // Updating bathroom-remodel but trying to change slug to kitchen-renovation
      expect(ensureUniqueSlug('kitchen-renovation', existingSlugs, 'bathroom-remodel')).toBe('kitchen-renovation-2');
    });

    it('should handle excludeSlug with suffix collisions', () => {
      const existingSlugs = ['project', 'project-2', 'project-3'];
      // Updating project-2, trying to change to just 'project'
      // Since project-2 is excluded, it becomes available as the first suffix
      expect(ensureUniqueSlug('project', existingSlugs, 'project-2')).toBe('project-2');
    });
  });
});
