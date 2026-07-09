/**
 * Phone-number formatting helpers — single source so schema.org `telephone`
 * and every `tel:` link agree (NAP consistency is a local-SEO signal the owner
 * actively manages). Previously `+1${phone.replace(/\D/g,'')}` was inlined at
 * ~8 sites and a couple pages hardcoded the literal number.
 */

/** E.164 form for schema.org telephone, e.g. "778-960-7999" → "+17789607999". */
export function e164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Assume North American (+1) when the country code is absent.
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}

/** `tel:` href for click-to-call links. */
export function telHref(phone: string): string {
  return `tel:${e164(phone)}`;
}
