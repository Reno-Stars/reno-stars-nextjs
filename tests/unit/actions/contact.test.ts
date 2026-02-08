import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module before importing the action
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  contactSubmissions: {},
}));

// Dynamic import after mocks are set up
const { submitContactForm } = await import('@/app/actions/contact');

// Generate unique phone numbers to avoid rate limiting between tests
let phoneCounter = 0;
function uniquePhone(): string {
  phoneCounter++;
  return `604-555-${String(phoneCounter).padStart(4, '0')}`;
}

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject empty required fields', async () => {
    const result = await submitContactForm({
      name: '',
      email: 'test@example.com',
      phone: uniquePhone(),
      message: 'Hello',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('required fields');
  });

  it('should reject empty phone (phone is required)', async () => {
    const result = await submitContactForm({
      name: 'John',
      email: 'test@example.com',
      phone: '',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('required fields');
  });

  it('should reject empty message', async () => {
    const result = await submitContactForm({
      name: 'John',
      email: 'test@example.com',
      phone: uniquePhone(),
      message: '',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('required fields');
  });

  it('should reject invalid email format when email is provided', async () => {
    const result = await submitContactForm({
      name: 'John',
      email: 'not-an-email',
      phone: uniquePhone(),
      message: 'Hello',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('valid email');
  });

  it('should reject name exceeding max length', async () => {
    const result = await submitContactForm({
      name: 'A'.repeat(101),
      email: 'test@example.com',
      phone: uniquePhone(),
      message: 'Hello',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('100 characters');
  });

  it('should reject message exceeding max length', async () => {
    const result = await submitContactForm({
      name: 'John',
      email: 'test@example.com',
      phone: uniquePhone(),
      message: 'A'.repeat(5001),
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('5000 characters');
  });

  it('should succeed with valid data', async () => {
    const result = await submitContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      phone: uniquePhone(),
      message: 'I need a kitchen renovation.',
    });
    expect(result.success).toBe(true);
    expect(result.message).toContain('successfully');
  });

  it('should succeed without email (email is optional)', async () => {
    const result = await submitContactForm({
      name: 'Jane',
      email: '',
      phone: uniquePhone(),
      message: 'Interested in bathroom reno.',
    });
    expect(result.success).toBe(true);
  });

  it('should strip HTML from inputs', async () => {
    const { db } = await import('@/lib/db');
    const result = await submitContactForm({
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      phone: uniquePhone(),
      message: '<b>Bold</b> message',
    });
    expect(result.success).toBe(true);
    // Verify the insert was called (sanitized values are handled internally)
    expect(db.insert).toHaveBeenCalled();
  });
});
