import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// `lib/clients/crm.ts` imports 'server-only', which is a runtime no-op marker
// shipped inside Next.js's bundle. Vitest aliases it to tests/shims/server-only.ts
// (see vitest.config.ts) so the import resolves cleanly in Node tests.

// Required at module-load time.
process.env.CRM_REST_URL = 'https://crm.test.local';
process.env.CRM_API_KEY = 'test-api-key';

const { crmClient, CrmServiceError } = await import('@/lib/clients/crm');

interface MockResponseInit {
  status?: number;
  body?: string;
  contentType?: string;
}

function makeResponse({ status = 200, body = '', contentType = 'application/json' }: MockResponseInit): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': contentType },
  });
}

const PERSON_OK_BODY = JSON.stringify({
  data: { createPerson: { id: 'person-123' } },
});

// Twenty error payloads — these match the real shape (verified via curl
// against crm.reno-stars.com on 2026-05-28):
//   {"statusCode":400,"error":"Error","messages":["Provided phone number is invalid call me"],"code":"INVALID_PHONE_NUMBER"}
//   {"statusCode":400,"error":"Error","messages":["Provided and inferred country code are conflicting"],"code":"CONFLICTING_PHONE_COUNTRY_CODE"}
const INVALID_PHONE_BODY = JSON.stringify({
  statusCode: 400,
  error: 'Error',
  messages: ['Provided phone number is invalid call me'],
  code: 'INVALID_PHONE_NUMBER',
});
const CONFLICTING_PHONE_BODY = JSON.stringify({
  statusCode: 400,
  error: 'Error',
  messages: ['Provided and inferred country code are conflicting'],
  code: 'CONFLICTING_PHONE_COUNTRY_CODE',
});

describe('crmClient.createPerson', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
  });

  afterEach(() => {
    fetchSpy.mockReset();
  });

  it('happy path: phone with CA/+1 succeeds on first POST', async () => {
    fetchSpy.mockResolvedValueOnce(
      makeResponse({ status: 201, body: PERSON_OK_BODY })
    );

    const result = await crmClient.createPerson({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: '604-555-1234',
      leadSource: 'GOOGLE_SEARCH',
      notesFromForm: 'Wants a kitchen reno.',
    });

    expect(result).toEqual({ id: 'person-123' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? '{}');
    expect(body.phones).toEqual({
      primaryPhoneNumber: '604-555-1234',
      primaryPhoneCountryCode: 'CA',
      primaryPhoneCallingCode: '+1',
    });
    expect(body.notesFromForm).toBe('Wants a kitchen reno.');
  });

  it('no phone in input: single POST, no fallback chain', async () => {
    fetchSpy.mockResolvedValueOnce(
      makeResponse({ status: 201, body: PERSON_OK_BODY })
    );

    const result = await crmClient.createPerson({
      firstName: 'Bob',
      email: 'bob@example.com',
      notesFromForm: 'No phone given.',
    });

    expect(result).toEqual({ id: 'person-123' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, init] = fetchSpy.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? '{}');
    expect(body.phones).toBeUndefined();
  });

  it('fallback chain: country-code conflict → infer succeeds (2 POSTs)', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: CONFLICTING_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 201, body: PERSON_OK_BODY })
      );

    const result = await crmClient.createPerson({
      firstName: 'Carol',
      phone: '+44 20 7946 0958',
      notesFromForm: 'UK number.',
    });

    expect(result).toEqual({ id: 'person-123' });
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const [, init1] = fetchSpy.mock.calls[0]!;
    const body1 = JSON.parse((init1?.body as string) ?? '{}');
    expect(body1.phones).toEqual({
      primaryPhoneNumber: '+44 20 7946 0958',
      primaryPhoneCountryCode: 'CA',
      primaryPhoneCallingCode: '+1',
    });

    // Second POST drops country/calling code → Twenty infers.
    const [, init2] = fetchSpy.mock.calls[1]!;
    const body2 = JSON.parse((init2?.body as string) ?? '{}');
    expect(body2.phones).toEqual({ primaryPhoneNumber: '+44 20 7946 0958' });
    // Notes should be unchanged on attempt 2.
    expect(body2.notesFromForm).toBe('UK number.');
  });

  it('fallback chain: full path — both phone attempts fail, no-phone + stashed notes succeeds (3 POSTs)', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: INVALID_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: INVALID_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 201, body: PERSON_OK_BODY })
      );

    const result = await crmClient.createPerson({
      firstName: 'Dave',
      lastName: 'Jones',
      email: 'dave@example.com',
      phone: 'Question about your website',
      leadSource: 'OTHER',
      notesFromForm: 'Original message body.',
    });

    expect(result).toEqual({ id: 'person-123' });
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // Third POST: no phones, notes prepended with stash marker.
    const [, init3] = fetchSpy.mock.calls[2]!;
    const body3 = JSON.parse((init3?.body as string) ?? '{}');
    expect(body3.phones).toBeUndefined();
    expect(body3.notesFromForm).toBe(
      'Original phone (rejected by Twenty validator): Question about your website\n\nOriginal message body.'
    );
    // Other fields preserved.
    expect(body3.name).toEqual({ firstName: 'Dave', lastName: 'Jones' });
    expect(body3.emails).toEqual({ primaryEmail: 'dave@example.com' });
    expect(body3.leadSource).toBe('OTHER');
  });

  it('fallback chain: stash marker is the only notes line when input notesFromForm is empty', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: INVALID_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: INVALID_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 201, body: PERSON_OK_BODY })
      );

    await crmClient.createPerson({
      firstName: 'Eve',
      phone: 'not-a-phone',
      // no notesFromForm
    });

    const [, init3] = fetchSpy.mock.calls[2]!;
    const body3 = JSON.parse((init3?.body as string) ?? '{}');
    expect(body3.notesFromForm).toBe(
      'Original phone (rejected by Twenty validator): not-a-phone'
    );
  });

  it('non-phone 400 errors throw immediately, no fallback retries', async () => {
    const NON_PHONE_ERR = JSON.stringify({
      statusCode: 400,
      error: 'Error',
      messages: ['Email is invalid'],
      code: 'INVALID_EMAIL',
    });
    fetchSpy.mockResolvedValueOnce(
      makeResponse({ status: 400, body: NON_PHONE_ERR })
    );

    await expect(
      crmClient.createPerson({
        firstName: 'Frank',
        email: 'not-an-email',
        phone: '604-555-1234',
      })
    ).rejects.toBeInstanceOf(CrmServiceError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('5xx errors throw immediately, no phone fallback', async () => {
    fetchSpy.mockResolvedValueOnce(
      makeResponse({
        status: 500,
        body: JSON.stringify({ error: 'internal' }),
      })
    );

    await expect(
      crmClient.createPerson({
        firstName: 'Grace',
        phone: '604-555-1234',
      })
    ).rejects.toBeInstanceOf(CrmServiceError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('non-phone 400 after a successful infer attempt is not caught', async () => {
    // Attempt 1 → phone validation fails (triggers infer fallback)
    // Attempt 2 → non-phone 400 (e.g. unrelated validation) → should throw,
    // NOT fall through to attempt 3.
    fetchSpy
      .mockResolvedValueOnce(
        makeResponse({ status: 400, body: CONFLICTING_PHONE_BODY })
      )
      .mockResolvedValueOnce(
        makeResponse({
          status: 400,
          body: JSON.stringify({
            statusCode: 400,
            error: 'Error',
            messages: ['Lead source not allowed'],
            code: 'INVALID_LEAD_SOURCE',
          }),
        })
      );

    await expect(
      crmClient.createPerson({
        firstName: 'Heidi',
        phone: '+44 20 7946 0958',
      })
    ).rejects.toBeInstanceOf(CrmServiceError);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
