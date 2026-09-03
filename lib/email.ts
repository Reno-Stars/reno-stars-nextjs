import { Resend } from 'resend';
import { getSecret } from '@/lib/secrets';

// Initialize Resend client (lazy - only when needed)
let resendClient: Resend | null = null;
let resendClientKey: string | null = null;

/**
 * Resolves the key through lib/secrets (process.env first, then Infisical), so
 * a key present in the vault reaches this code without also needing an
 * ExternalSecret entry. That two-system gap is what silently disabled email
 * from 2026-08-14 to 2026-09-03.
 *
 * The cached client is keyed on the resolved value so a rotated secret is
 * picked up when the vault cache refreshes, instead of pinning the old key for
 * the life of the process.
 */
async function getResendClient(): Promise<Resend | null> {
  const apiKey = await getSecret('RESEND_API_KEY');
  if (!apiKey) return null;
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }
  return resendClient;
}

/** Track whether email config warnings have been logged */
let emailConfigWarningsLogged = false;

/** Email configuration - logs warning once if using fallback values */
async function getEmailConfig() {
  const from = (await getSecret('EMAIL_FROM')) || 'Contact Form <onboarding@resend.dev>';
  const to = (await getSecret('EMAIL_TO')) || 'info@reno-stars.com';
  // CC Sylvia by default so she sees new leads alongside the main inbox.
  // Override with EMAIL_CC=email1,email2 (comma-separated) or set to empty
  // string to disable CC entirely.
  // EMAIL_CC has meaningful EMPTY semantics — "set to empty string to disable CC
  // entirely" — so it cannot go through getSecret(), which treats empty as
  // unset (correct for credentials: RESEND_API_KEY='' must fall through to the
  // vault, not disable email). Read the env var directly when it is DEFINED,
  // and only consult the vault when it is not.
  const ccEnv = process.env.EMAIL_CC;
  const cc =
    ccEnv !== undefined ? ccEnv : (await getSecret('EMAIL_CC')) ?? 'renostars.sylvia@gmail.com';

  // Warn once if using fallback values (the Resend test sender won't deliver in production)
  if (!emailConfigWarningsLogged) {
    emailConfigWarningsLogged = true;
    if (!from || from.includes('onboarding@resend.dev')) {
      console.warn('EMAIL_FROM not set, using default: onboarding@resend.dev');
    }
    if (to === 'info@reno-stars.com' && !process.env.EMAIL_TO) {
      console.warn('EMAIL_TO not set, using default: info@reno-stars.com');
    }
  }

  return { from, to, cc };
}

/** Contact form submission data for email */
export interface ContactEmailData {
  name: string;
  email: string | null;
  phone: string;
  message: string;
  /** Human-readable English city name (e.g. "Vancouver"). null if not provided. */
  city?: string | null;
  /** Human-readable English property type (e.g. "House"). null if not provided. */
  propertyType?: string | null;
}

/**
 * Send email notification for a new contact form submission.
 * Returns true if email was sent successfully, false otherwise.
 * Fails silently if Resend is not configured (no API key).
 */
export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  const resend = await getResendClient();

  // Skip if Resend is not configured
  if (!resend) {
    return false;
  }

  try {
    const { name, email, phone, message, city, propertyType } = data;

    // Build email content
    const subject = `New Contact Form Submission from ${name}`;

    const textLines = [
      `New contact form submission received:`,
      ``,
      `Name: ${name}`,
      `Email: ${email || 'Not provided'}`,
      `Phone: ${phone}`,
    ];
    if (city) textLines.push(`City: ${city}`);
    if (propertyType) textLines.push(`Property Type: ${propertyType}`);
    textLines.push(
      ``,
      `Message:`,
      `${message}`,
      ``,
      `---`,
      `This email was sent from the Reno Stars website contact form.`
    );
    const textContent = textLines.join('\n');

    const projectFieldsHtml = [
      city
        ? `<p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">City:</strong> ${escapeHtml(city)}</p>`
        : '',
      propertyType
        ? `<p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">Property Type:</strong> ${escapeHtml(propertyType)}</p>`
        : '',
    ].filter(Boolean).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1B365D; border-bottom: 2px solid #C8922A; padding-bottom: 10px; margin-top: 0;">
          New Contact Form Submission
        </h2>

        <div style="background-color: #f0ede8; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C8922A;">
          <p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 0 0 8px 0;"><strong style="color: #1B365D;">Email:</strong> ${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #C8922A;">${escapeHtml(email)}</a>` : '<em style="color: #888;">Not provided</em>'}</p>
          <p style="margin: 0${projectFieldsHtml ? ' 0 8px 0' : ''};"><strong style="color: #1B365D;">Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color: #C8922A;">${escapeHtml(phone)}</a></p>
          ${projectFieldsHtml}
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
    const emailConfig = await getEmailConfig();

    // Parse recipients (supports comma-separated list)
    const recipients = emailConfig.to.split(',').map((e) => e.trim()).filter(Boolean);
    const ccRecipients = emailConfig.cc.split(',').map((e) => e.trim()).filter(Boolean);

    const { error } = await resend.emails.send({
      from: emailConfig.from,
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
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
