import 'server-only';

/**
 * Twenty CRM HTTP client.
 *
 * Talks to the self-hosted Twenty CRM REST API at https://crm.reno-stars.com
 * using a workspace-scoped bearer API key. Used by the contact form server
 * action (and future call sites) to dual-write leads to CRM after the
 * Neon `contact_submissions` insert. The Neon table remains the primary
 * source of truth until Phase B T11 drops it.
 *
 * Phase B T5 — see docs/superpowers/plans/2026-05-27-phase-b-crm-twenty-rollout.md
 *
 * Conventions (mirrors lib/clients/invoice.ts):
 *  - Reads time out at 10s, writes at 30s.
 *  - GET requests retry once on 5xx; mutating verbs never retry (no idempotency
 *    keys are available in Twenty v2.8.3).
 *  - On non-2xx the client throws a `CrmServiceError` containing the HTTP
 *    status and the server's response body so callers can disambiguate
 *    4xx (validation) from 5xx (server failure) and 404 (not found).
 *  - Env vars are read lazily — importing this module is safe at build time.
 *
 * Twenty REST shape notes (verified against the live CRM 2026-05-27):
 *  - All POSTs return `{ data: { create<Entity>: { id, ... } } }`.
 *  - All GETs on collection routes return `{ data: { <plural>: [...] }, pageInfo, totalCount }`.
 *  - Person uses composite fields: `name: {firstName,lastName}`, `emails:
 *    {primaryEmail,...}`, `phones: {primaryPhoneNumber,primaryPhoneCountryCode,
 *    primaryPhoneCallingCode,...}`.
 *  - Note has `bodyV2: {markdown?, blocknote?}` — submitting `markdown` only
 *    is fine; Twenty auto-generates the blocknote.
 *  - Tasks REQUIRE `status` (enum: TODO | IN_PROGRESS | DONE).
 *  - Linking a Note/Task to a Person is a separate POST to /noteTargets or
 *    /taskTargets with `{ <note|task>Id, targetPersonId }`.
 *  - Filter syntax: `?filter=field[op]:value` — e.g. `emails.primaryEmail[eq]:"x@y.com"`.
 *  - Enum custom fields (leadSource, propertyType): values are UPPERCASE; see
 *    typed unions below.
 */

// ============================================================================
// CONFIG
// ============================================================================

const READ_TIMEOUT_MS = 10_000;
const WRITE_TIMEOUT_MS = 30_000;

function getBaseUrl(): string {
  const url = process.env.CRM_REST_URL;
  if (!url) {
    throw new Error('CRM_REST_URL is not set. Required for Twenty CRM calls.');
  }
  return url.replace(/\/+$/, '');
}

function getApiKey(): string {
  const key = process.env.CRM_API_KEY;
  if (!key) {
    throw new Error('CRM_API_KEY is not set. Required for Twenty CRM calls.');
  }
  return key;
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * Allowed values for the Person.leadSource enum custom field.
 * Server rejects any other value with a 400 BadRequestException.
 */
export type CrmLeadSource =
  | 'GOOGLE_SEARCH'
  | 'GOOGLE_ADS'
  | 'REFERRAL'
  | 'YELP'
  | 'HOUZZ'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'REPEAT_CUSTOMER'
  | 'OTHER';

/**
 * Allowed values for the Person.propertyType enum custom field.
 * Server rejects any other value with a 400 BadRequestException.
 */
export type CrmPropertyType =
  | 'SINGLE_FAMILY'
  | 'CONDO'
  | 'TOWNHOUSE'
  | 'COMMERCIAL'
  | 'OTHER';

export type CrmTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface CreatePersonInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** ISO 3166-1 alpha-2 country code — defaults to 'CA' if `phone` is set. */
  phoneCountryCode?: string;
  /** International dialing code — defaults to '+1' if `phone` is set. */
  phoneCallingCode?: string;
  leadSource?: CrmLeadSource;
  /** Free-form area name OR a UUID from Next.js service_areas table. */
  preferredAreaId?: string;
  /** Service slug from the Next.js form (free-form string). */
  preferredService?: string;
  propertyType?: CrmPropertyType;
  /** Initial contact form message (mirrored to a Note as well). */
  notesFromForm?: string;
}

// ============================================================================
// ERROR
// ============================================================================

export class CrmServiceError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'CrmServiceError';
    this.status = status;
    this.body = body;
  }
}

/** True for status 404 — useful for callers that want to no-op on missing. */
export function isCrmNotFoundError(err: unknown): boolean {
  return err instanceof CrmServiceError && err.status === 404;
}

// ============================================================================
// INTERNAL FETCH
// ============================================================================

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: Method;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = getBaseUrl();
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

async function request<T>(opts: RequestOptions): Promise<T> {
  const isWrite = opts.method !== 'GET';
  const timeoutMs = isWrite ? WRITE_TIMEOUT_MS : READ_TIMEOUT_MS;
  const url = buildUrl(opts.path, opts.query);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    Accept: 'application/json',
  };
  if (opts.body !== undefined && opts.body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        method: opts.method,
        headers,
        body:
          opts.body !== undefined && opts.body !== null
            ? JSON.stringify(opts.body)
            : undefined,
        signal: controller.signal,
        // Force always-fresh — CRM is the source of truth.
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await doFetch();
  } catch (err) {
    // Network or abort. For GET, retry once.
    if (opts.method === 'GET') {
      res = await doFetch();
    } else {
      throw new Error(
        `CRM request failed (${opts.method} ${opts.path}): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  // 5xx retry on GET only.
  if (opts.method === 'GET' && res.status >= 500 && res.status < 600) {
    res = await doFetch();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {
      // ignore — body unreadable, surface status only
    }
    throw new CrmServiceError(
      `CRM ${opts.method} ${opts.path} failed: ${res.status} ${res.statusText} ${bodyText}`.trim(),
      res.status,
      bodyText
    );
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

// ============================================================================
// CLIENT
// ============================================================================

/**
 * Builds the Twenty Person request body from our flat input shape.
 * Composite fields (name, emails, phones) get wrapped here.
 */
function buildPersonBody(input: CreatePersonInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: { firstName: input.firstName, lastName: input.lastName ?? '' },
  };
  if (input.email) {
    body.emails = { primaryEmail: input.email };
  }
  if (input.phone) {
    body.phones = {
      primaryPhoneNumber: input.phone,
      primaryPhoneCountryCode: input.phoneCountryCode ?? 'CA',
      primaryPhoneCallingCode: input.phoneCallingCode ?? '+1',
    };
  }
  if (input.leadSource) body.leadSource = input.leadSource;
  if (input.preferredAreaId) body.preferredAreaId = input.preferredAreaId;
  if (input.preferredService) body.preferredService = input.preferredService;
  if (input.propertyType) body.propertyType = input.propertyType;
  if (input.notesFromForm) body.notesFromForm = input.notesFromForm;
  return body;
}

export const crmClient = {
  /**
   * Creates a new Person record. Returns just `{ id }` since callers typically
   * only need the id to chain a Note/Task linkage.
   */
  async createPerson(input: CreatePersonInput): Promise<{ id: string }> {
    const res = await request<{ data: { createPerson: { id: string } } }>({
      method: 'POST',
      path: '/people',
      body: buildPersonBody(input),
    });
    return { id: res.data.createPerson.id };
  },

  /**
   * Finds a Person by primary email. Returns `null` when no match — does NOT
   * throw 404 (the endpoint returns 200 + empty array for misses).
   */
  async findPersonByEmail(email: string): Promise<{ id: string } | null> {
    const res = await request<{ data: { people: Array<{ id: string }> } }>({
      method: 'GET',
      path: '/people',
      query: {
        filter: `emails.primaryEmail[eq]:"${email}"`,
        limit: 1,
      },
    });
    const first = res.data.people[0];
    return first ? { id: first.id } : null;
  },

  /**
   * Creates a Note and links it to the given Person via a NoteTarget record.
   * Two HTTP calls — Twenty does not support nested-create on Notes via REST.
   *
   * If the noteTargets link fails after the note is created, the note remains
   * orphaned (no person linkage). We surface the error so the caller can log
   * to the deadletter; recovery is manual via the CRM UI for now.
   */
  async createNoteOnPerson(
    personId: string,
    body: string,
    title = 'Contact form message'
  ): Promise<{ id: string }> {
    const noteRes = await request<{
      data: { createNote: { id: string } };
    }>({
      method: 'POST',
      path: '/notes',
      body: { title, bodyV2: { markdown: body } },
    });
    const noteId = noteRes.data.createNote.id;

    await request<{ data: { createNoteTarget: { id: string } } }>({
      method: 'POST',
      path: '/noteTargets',
      body: { noteId, targetPersonId: personId },
    });

    return { id: noteId };
  },

  /**
   * Creates a Task and links it to the given Person via a TaskTarget record.
   * `status` defaults to `TODO`. If `dueAt` is provided, it must be an ISO
   * timestamp string.
   */
  async createTaskForPerson(
    personId: string,
    title: string,
    dueAt?: string,
    status: CrmTaskStatus = 'TODO'
  ): Promise<{ id: string }> {
    const taskBody: Record<string, unknown> = { title, status };
    if (dueAt) taskBody.dueAt = dueAt;

    const taskRes = await request<{
      data: { createTask: { id: string } };
    }>({
      method: 'POST',
      path: '/tasks',
      body: taskBody,
    });
    const taskId = taskRes.data.createTask.id;

    await request<{ data: { createTaskTarget: { id: string } } }>({
      method: 'POST',
      path: '/taskTargets',
      body: { taskId, targetPersonId: personId },
    });

    return { id: taskId };
  },
};

export type CrmClient = typeof crmClient;
