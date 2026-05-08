import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Resend before importing the module
const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

describe('sendContactNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to pick up new env vars
    vi.resetModules();
  });

  it('should return false when RESEND_API_KEY is not set', async () => {
    // Ensure API key is not set
    delete process.env.RESEND_API_KEY;

    const { sendContactNotification } = await import('@/lib/email');

    const result = await sendContactNotification({
      name: 'Test User',
      email: 'test@example.com',
      phone: '604-555-1234',
      message: 'Hello world',
    });

    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should send email when RESEND_API_KEY is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_FROM = 'test@example.com';
    process.env.EMAIL_TO = 'recipient@example.com';

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    const result = await sendContactNotification({
      name: 'Test User',
      email: 'user@example.com',
      phone: '604-555-1234',
      message: 'Test message',
    });

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'New Contact Form Submission from Test User',
        replyTo: 'user@example.com',
      })
    );

    // Clean up
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.EMAIL_TO;
  });

  it('should return false when Resend returns an error', async () => {
    process.env.RESEND_API_KEY = 're_test_key';

    mockSend.mockResolvedValue({ error: { message: 'Send failed' } });

    const { sendContactNotification } = await import('@/lib/email');

    const result = await sendContactNotification({
      name: 'Test User',
      email: 'user@example.com',
      phone: '604-555-1234',
      message: 'Test message',
    });

    expect(result).toBe(false);

    delete process.env.RESEND_API_KEY;
  });

  it('should handle null email (replyTo should be undefined)', async () => {
    process.env.RESEND_API_KEY = 're_test_key';

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    await sendContactNotification({
      name: 'No Email User',
      email: null,
      phone: '604-555-1234',
      message: 'No email provided',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: undefined,
      })
    );

    delete process.env.RESEND_API_KEY;
  });

  it('should support multiple recipients in EMAIL_TO', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_TO = 'one@example.com, two@example.com';

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    await sendContactNotification({
      name: 'Test',
      email: null,
      phone: '604-555-1234',
      message: 'Test',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['one@example.com', 'two@example.com'],
      })
    );

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_TO;
  });

  it('should default CC to renostars.sylvia@gmail.com when EMAIL_CC is unset', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    delete process.env.EMAIL_CC;

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    await sendContactNotification({
      name: 'Test',
      email: null,
      phone: '604-555-1234',
      message: 'Test',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: ['renostars.sylvia@gmail.com'],
      })
    );

    delete process.env.RESEND_API_KEY;
  });

  it('should support comma-separated EMAIL_CC override', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_CC = 'a@example.com, b@example.com';

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    await sendContactNotification({
      name: 'Test',
      email: null,
      phone: '604-555-1234',
      message: 'Test',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: ['a@example.com', 'b@example.com'],
      })
    );

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_CC;
  });

  it('should omit cc field when EMAIL_CC is empty string', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_CC = '';

    mockSend.mockResolvedValue({ error: null });

    const { sendContactNotification } = await import('@/lib/email');

    await sendContactNotification({
      name: 'Test',
      email: null,
      phone: '604-555-1234',
      message: 'Test',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: undefined,
      })
    );

    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_CC;
  });
});
