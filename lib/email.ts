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

  // Warn once in development if using fallback values
  if (process.env.NODE_ENV === 'development' && !emailConfigWarningsLogged) {
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Email notification skipped: RESEND_API_KEY not configured');
    }
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B365D; border-bottom: 2px solid #C8922A; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1B365D; width: 100px;">Name:</td>
            <td style="padding: 8px 0;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1B365D;">Email:</td>
            <td style="padding: 8px 0;">
              ${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #C8922A;">${escapeHtml(email)}</a>` : '<em style="color: #888;">Not provided</em>'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1B365D;">Phone:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${escapeHtml(phone)}" style="color: #C8922A;">${escapeHtml(phone)}</a>
            </td>
          </tr>
        </table>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1B365D; margin-top: 0;">Message:</h3>
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

    if (process.env.NODE_ENV === 'development') {
      console.log('Contact notification email sent successfully');
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
