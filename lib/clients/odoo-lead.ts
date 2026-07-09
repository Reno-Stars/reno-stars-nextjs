import 'server-only';

/**
 * Odoo lead-ingest client.
 *
 * Since the Twenty CRM decommission (2026-06-23) Odoo is the sole system of
 * record for website leads. The contact-form server action posts a single
 * `crm.lead/ingest_web_lead` JSON-2 call which dedupes email → phone → name,
 * creates/updates a `res.partner`, and creates a `crm.lead` in the Sales
 * pipeline.
 *
 * Env vars are read lazily — importing this module is safe at build time.
 */

// ============================================================================
// CONFIG
// ============================================================================

const WRITE_TIMEOUT_MS = 30_000;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Property-type values understood by the contact-form slug mapper. Historically
 * these were the Twenty `Person.propertyType` enum values; Odoo's selection
 * uses the lowercase equivalents (see `PROPERTY_TYPE_TO_ODOO` below).
 */
export type CrmPropertyType =
  | 'SINGLE_FAMILY'
  | 'CONDO'
  | 'TOWNHOUSE'
  | 'COMMERCIAL'
  | 'OTHER';

// ============================================================================
// ODOO LEAD INGEST
// ============================================================================

/**
 * Odoo property type values (lowercase, matching Odoo x_property_type selection).
 * The contact-form slug mapper emits the uppercase `CrmPropertyType` keys; this
 * mapping converts them to Odoo's lowercase selection keys.
 */
const PROPERTY_TYPE_TO_ODOO: Record<string, string> = {
  SINGLE_FAMILY: 'single_family',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  COMMERCIAL: 'commercial',
  OTHER: 'other',
};

/**
 * Sends a new website lead to Odoo via the `crm.lead/ingest_web_lead` JSON-2
 * endpoint. The method dedupes by email → phone → name, creates/updates a
 * `res.partner`, and creates a `crm.lead` in the Sales pipeline.
 *
 * Reads env: ODOO_BASE_URL, ODOO_API_KEY, ODOO_DB.
 *
 * The `preferredAreaId` passed from the contact form is the Next.js
 * `service_areas.id` UUID (or an area name string). We pass it as
 * `preferredArea` to Odoo (the field is a free-form char in `x_preferred_area`).
 *
 * `propertyType` may be an uppercase CrmPropertyType from the slug mapper —
 * we downcase it here because Odoo's selection expects lowercase keys.
 */
export async function createLeadInOdoo(lead: {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  leadSource?: string;
  preferredAreaId?: string;
  preferredService?: string;
  propertyType?: string;
  notesFromForm?: string;
}): Promise<{ lead_id: number; partner_id: number; matched: boolean }> {
  const base = process.env.ODOO_BASE_URL;
  const key = process.env.ODOO_API_KEY;
  const db = process.env.ODOO_DB;
  if (!base || !key || !db) {
    throw new Error('ODOO_BASE_URL, ODOO_API_KEY, and ODOO_DB must all be set');
  }

  // Normalize propertyType to Odoo's lowercase selection keys.
  const propertyTypeOdoo = lead.propertyType
    ? (PROPERTY_TYPE_TO_ODOO[lead.propertyType.toUpperCase()] ?? lead.propertyType.toLowerCase())
    : undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WRITE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${base}/json/2/crm.lead/ingest_web_lead`, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${key}`,
        'X-Odoo-Database': db,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        lead: {
          firstName: lead.firstName,
          ...(lead.lastName ? { lastName: lead.lastName } : {}),
          ...(lead.email ? { email: lead.email } : {}),
          ...(lead.phone ? { phone: lead.phone } : {}),
          ...(lead.leadSource ? { leadSource: lead.leadSource } : {}),
          // Odoo uses `preferredArea` (free-form char), not `preferredAreaId`
          ...(lead.preferredAreaId ? { preferredArea: lead.preferredAreaId } : {}),
          ...(lead.preferredService ? { preferredService: lead.preferredService } : {}),
          ...(propertyTypeOdoo ? { propertyType: propertyTypeOdoo } : {}),
          ...(lead.notesFromForm ? { notesFromForm: lead.notesFromForm } : {}),
        },
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {
      // ignore unreadable body
    }
    throw new Error(
      `Odoo ingest_web_lead failed: ${res.status} ${res.statusText} ${bodyText}`.trim()
    );
  }

  return res.json() as Promise<{ lead_id: number; partner_id: number; matched: boolean }>;
}
