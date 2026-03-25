import { Resend } from 'resend';

// Initialize Resend client (lazy - only when needed)
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/** Track whether email config warnings have been logged */
let emailConfigWarningsLogged = false;

/** Email configuration - logs warning once if using fallback values */
function getEmailConfig() {
  const from = process.env.EMAIL_FROM || 'Contact Form <onboarding@resend.dev>';
  const to = process.env.EMAIL_TO || 'info@reno-stars.com';

  // Warn once if using fallback values (the Resend test sender won't deliver in production)
  if (!emailConfigWarningsLogged) {
    emailConfigWarningsLogged = true;
    if (!process.env.EMAIL_FROM) {
      console.warn('EMAIL_FROM not set, using default: onboarding@resend.dev');
    }
    if (!process.env.EMAIL_TO) {
      console.warn('EMAIL_TO not set, using default: info@reno-stars.com');
    }
  }

  return { from, to };
}

/** Contact form submission data for email */
export interface ContactEmailData {
  name: string;
  email: string | null;
  phone: string;
  message: string;
}

/**
 * Send email notification for a new contact form submission.
 * Returns true if email was sent successfully, false otherwise.
 * Fails silently if Resend is not configured (no API key).
 */
export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  const resend = getResendClient();

  // Skip if Resend is not configured
  if (!resend) {
    return false;
  }

  try {
    const { name, email, phone, message } = data;

    // Build email content
    const subject = `New Contact Form Submission from ${name}`;

    const textContent = [
      `New contact form submission received:`,
      ``,
      `Name: ${name}`,
      `Email: ${email || 'Not provided'}`,
      `Phone: ${phone}`,
      ``,
      `Message:`,
      `${message}`,
      ``,
      `---`,
      `This email was sent from the Reno Stars website contact form.`,
    ].join('\n');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1B365D; border-bottom: 2px solid #C8922A; padding-bottom: 10px; margin-top: 0;">
          New Contact Form Submission
        </h2>

        <div style="background-color: #f0ede8; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C8922A;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">Email:</strong> ${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #C8922A;">${escapeHtml(email)}</a>` : '<em style="color: #888;">Not provided</em>'}</p>
          <p style="margin: 0;"><strong style="color: #1B365D;">Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color: #C8922A;">${escapeHtml(phone)}</a></p>
        </div>

        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #1B365D;">Message:</p>
          <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
          This email was sent from the Reno Stars website contact form.
        </p>
      </div>
    `;

    // Get email config (logs warning in dev if using defaults)
    const emailConfig = getEmailConfig();

    // Parse recipients (supports comma-separated list)
    const recipients = emailConfig.to.split(',').map((e) => e.trim()).filter(Boolean);

    const { error } = await resend.emails.send({
      from: emailConfig.from,
      to: recipients,
      subject,
      text: textContent,
      html: htmlContent,
      replyTo: email || undefined,
    });

    if (error) {
      console.error('Failed to send contact notification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    return false;
  }
}

/** Escape HTML special characters to prevent XSS in email content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
