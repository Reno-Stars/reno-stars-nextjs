import { describe, it, expect, vi, beforeEach } from 'vitest';

// Counter for unique IPs to avoid rate limiting between tests
let ipCounter = 0;

// Mock next/headers before importing the action
vi.mock('next/headers', () => ({
  headers: vi.fn().mockImplementation(async () => ({
    get: vi.fn().mockImplementation((name: string) => {
      if (name === 'x-forwarded-for') {
        ipCounter++;
        return `192.168.1.${ipCounter}`;
      }
      return null;
    }),
  })),
}));

// Mock the database module before importing the action. The action only
// queries `service_areas` and `property_types` for slug→id lookup; it does
// NOT write to Neon since the Phase B cleanup (2026-05-28) — Twenty CRM is
// the sole system of record. The mock returns empty result sets for both
// SELECTs, which is the common test case (no city/propertyType passed).
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  propertyTypes: {},
  serviceAreas: {},
}));

// Mock the email module
const mockSendContactNotification = vi.fn().mockResolvedValue(true);
vi.mock('@/lib/email', () => ({
  sendContactNotification: mockSendContactNotification,
}));

// Mock the Odoo lead client + deadletter — the action writes the lead to Odoo
// in the background. We just verify the form path itself; the Odoo integration
// is covered separately. Using an empty resolved promise avoids noisy stderr
// from the deadletter when the action runs in unit tests.
const mockCreateLeadInOdoo = vi
  .fn()
  .mockResolvedValue({ lead_id: 1, partner_id: 1, matched: false });
vi.mock('@/lib/clients/odoo-lead', () => ({
  createLeadInOdoo: mockCreateLeadInOdoo,
}));

const mockRecordCrmDeadLetter = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/crm-deadletter', () => ({
  recordCrmDeadLetter: mockRecordCrmDeadLetter,
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
    // Note: phoneCounter is NOT reset to ensure unique phones across all tests
    // This prevents rate limiting issues from the module-level rateLimitStore
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
    mockSendContactNotification.mockClear();
    const result = await submitContactForm({
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      phone: uniquePhone(),
      message: '<b>Bold</b> message',
    });
    expect(result.success).toBe(true);
    // Verify the sanitized values are forwarded to downstream consumers
    // (email notification + CRM). HTML *tags* must be stripped before they
    // reach an email body or CRM note (script-tag content itself is retained
    // as inert text — XSS is impossible once tags are gone).
    await new Promise((resolve) => setTimeout(resolve, 10));
    const callArg = mockSendContactNotification.mock.calls[0]?.[0] as {
      name: string;
      message: string;
    };
    expect(callArg.name).not.toContain('<');
    expect(callArg.name).not.toContain('>');
    expect(callArg.name).toContain('John');
    expect(callArg.message).toBe('Bold message');
  });

  it('should call email notification on successful submission', async () => {
    mockSendContactNotification.mockClear();
    const phone = uniquePhone();
    const result = await submitContactForm({
      name: 'Email Test',
      email: 'email@test.com',
      phone,
      message: 'Testing email notification.',
    });
    expect(result.success).toBe(true);
    // Allow async email call to complete
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockSendContactNotification).toHaveBeenCalledWith({
      name: 'Email Test',
      email: 'email@test.com',
      phone,
      message: 'Testing email notification.',
      city: null,
      propertyType: null,
    });
  });

  it('should call email notification with null email when not provided', async () => {
    mockSendContactNotification.mockClear();
    const phone = uniquePhone();
    const result = await submitContactForm({
      name: 'No Email User',
      email: '',
      phone,
      message: 'No email provided.',
    });
    expect(result.success).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockSendContactNotification).toHaveBeenCalledWith({
      name: 'No Email User',
      email: null,
      phone,
      message: 'No email provided.',
      city: null,
      propertyType: null,
    });
  });
});
