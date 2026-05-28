import 'server-only';

/**
 * CRM dead-letter handler.
 *
 * Called when a server action's write to Twenty CRM fails. Since the Phase B
 * cleanup (2026-05-28) Twenty CRM is the SOLE system of record for leads —
 * the legacy Neon `contact_submissions` table was dropped, so a failed CRM
 * write means the lead is NOT yet stored anywhere durable. The Telegram
 * alert includes the full sanitized payload so the lead can be recreated
 * manually from the message.
 *
 * On failure, this:
 *  1. Logs a structured JSON event to stderr (visible in Vercel runtime logs)
 *     — the payload is included so the lead is recoverable from log search.
 *  2. Posts a Telegram alert to the Reno Stars work group, if the
 *     `TELEGRAM_BOT_TOKEN` env var is set. If it's not set, this is a no-op
 *     (graceful degradation — the stderr log still fires).
 *
 * The Telegram message is best-effort: if `sendMessage` itself fails, we log
 * and swallow. We do NOT want a failing telegram call to crash the form action.
 *
 * Phase B T6 — see docs/superpowers/plans/2026-05-27-phase-b-crm-twenty-rollout.md
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const DEFAULT_ALERT_CHAT_ID = '-5219630660'; // Reno Stars work group
const TELEGRAM_SEND_TIMEOUT_MS = 5_000;

/**
 * Records a dual-write failure: logs to stderr and (best-effort) alerts
 * Telegram. Never throws — always returns void.
 */
export async function recordCrmDeadLetter(
  payload: unknown,
  err: unknown
): Promise<void> {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorName = err instanceof Error ? err.name : 'UnknownError';

  // 1. Structured log to stderr — picked up by Vercel runtime logs / Datadog.
  console.error(
    JSON.stringify({
      event: 'crm.deadletter',
      errorName,
      error: errorMessage,
      payload,
      timestamp: new Date().toISOString(),
    })
  );

  // 2. Telegram alert — graceful no-op when bot token missing.
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID ?? DEFAULT_ALERT_CHAT_ID;

  // Truncate to fit Telegram's 4096-char message limit.
  const payloadJson = safeStringify(payload).slice(0, 1500);
  const errorTruncated = errorMessage.slice(0, 500);

  const text = [
    '⚠️ *Contact form CRM-write failed*',
    'Lead is NOT in CRM — manual recovery needed from the payload below.',
    '',
    `*Error (${errorName}):*`,
    '```',
    errorTruncated,
    '```',
    '',
    '*Payload:*',
    '```json',
    payloadJson,
    '```',
  ].join('\n');

  try {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      TELEGRAM_SEND_TIMEOUT_MS
    );
    try {
      await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (telegramErr) {
    console.error(
      'crm.deadletter: telegram send failed:',
      telegramErr instanceof Error ? telegramErr.message : String(telegramErr)
    );
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
