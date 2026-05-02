/**
 * Server-side: parse the `localizations` hidden form field emitted by
 * `LocalizedFormProvider`. Validates that values are strings and within
 * `maxLength` (default 5000) so the jsonb stays a sane size.
 */
export function parseLocalizations(
  formData: FormData,
  maxLength = 5000,
): Record<string, string> {
  const raw = formData.get('localizations');
  if (typeof raw !== 'string' || raw.length === 0) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v !== 'string') continue;
    if (v.length === 0) continue;
    if (v.length > maxLength) continue;
    if (!/^[a-zA-Z][a-zA-Z0-9]+$/.test(k)) continue;
    out[k] = v;
  }
  return out;
}
