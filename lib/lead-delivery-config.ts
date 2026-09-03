/**
 * Startup/first-use assertion for the contact form's delivery configuration.
 *
 * WHY THIS EXISTS
 * ---------------
 * Between 2026-08-14 and 2026-09-03 the production deployment carried none of
 * the env vars the lead path needs. `deploy/reno-stars-web.yaml` gave the
 * container only HOSTNAME, PORT, NODE_ENV, NEXT_TELEMETRY_DISABLED,
 * GOOGLE_PLACE_ID, DATABASE_URL and GOOGLE_PLACES_API_KEY, with `envFrom: null`.
 *
 * Every consequence was silent:
 *   - `getResendClient()` returns null without a key, so email returned false
 *   - `createLeadInOdoo()` threw, was caught, and dead-lettered to stderr
 *   - the dead-letter's Telegram alert no-opped, because TELEGRAM_BOT_TOKEN
 *     was ALSO missing
 *   - the action returned `success: true` regardless
 *
 * The form told 7 visitors their message had been sent. Nothing errored,
 * nothing alerted, and the pod was Ready the whole time. Unit tests passed —
 * one of them (`should return false when RESEND_API_KEY is not set`) asserts
 * exactly the production condition as correct behaviour.
 *
 * A missing env var fails at FIRST USE, not at boot, so the ordinary signals
 * (pod Ready, health checks, green CI) cannot see it. This module makes the
 * gap loud instead: one structured ERROR naming precisely which variables are
 * absent, emitted the first time a lead is handled.
 *
 * It deliberately does NOT throw. Email being misconfigured must not take the
 * whole website down — the caller decides what to tell the visitor.
 */

/** Env vars each delivery channel needs to function at all. */
const CHANNEL_ENV = {
  email: ['RESEND_API_KEY', 'EMAIL_FROM'],
  crm: ['ODOO_BASE_URL', 'ODOO_API_KEY', 'ODOO_DB'],
  alerting: ['TELEGRAM_BOT_TOKEN'],
} as const;

export type LeadChannel = keyof typeof CHANNEL_ENV;

/** Which of a channel's env vars are absent or empty. */
export function missingEnvFor(channel: LeadChannel): string[] {
  return CHANNEL_ENV[channel].filter((name) => !process.env[name]);
}

/** True when every env var the channel needs is present. */
export function isChannelConfigured(channel: LeadChannel): boolean {
  return missingEnvFor(channel).length === 0;
}

/** Every missing variable across all channels, keyed by channel. */
export function missingLeadEnv(): Record<LeadChannel, string[]> {
  return {
    email: missingEnvFor('email'),
    crm: missingEnvFor('crm'),
    alerting: missingEnvFor('alerting'),
  };
}

let warned = false;

/**
 * Log one loud, structured error naming the missing variables. Safe to call on
 * every submission — it only emits once per process, so a misconfigured deploy
 * is impossible to miss in the logs without drowning them.
 *
 * Returns true when every channel is configured.
 */
export function reportLeadDeliveryConfig(): boolean {
  const missing = missingLeadEnv();
  const anyMissing = Object.values(missing).some((names) => names.length > 0);

  if (anyMissing && !warned) {
    warned = true;
    console.error(
      JSON.stringify({
        event: 'lead.config.incomplete',
        message:
          'Contact-form delivery is misconfigured. Submissions may be accepted and then lost. ' +
          'These env vars are absent from the running container.',
        missing,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  return !anyMissing;
}

/** Test seam — the once-only latch would otherwise leak between test cases. */
export function resetLeadConfigWarningForTests(): void {
  warned = false;
}
