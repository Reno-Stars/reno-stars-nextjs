import 'server-only';

/**
 * Invoice service HTTP client.
 *
 * Talks to the standalone reno-stars-invoice-service over HTTPS using a
 * bearer token. Used when INVOICE_SOURCE=service is set; otherwise the
 * Next.js app falls back to its existing direct-DB code path.
 *
 * Phase A extraction — see docs/superpowers/plans/2026-05-27-phase-a-...
 *
 * Conventions:
 *  - Reads time out at 10s, writes (including PDFs) at 30s.
 *  - GET requests retry once on 5xx; mutating verbs never retry.
 *  - On non-2xx the client throws an `InvoiceServiceError` containing the
 *    HTTP status and the server's response body so callers can disambiguate
 *    4xx (validation) from 5xx (server failure) and 404 (not found).
 */

// ============================================================================
// CONFIG
// ============================================================================

const READ_TIMEOUT_MS = 10_000;
const WRITE_TIMEOUT_MS = 30_000;

function getBaseUrl(): string {
  const url = process.env.INVOICE_SERVICE_URL;
  if (!url) {
    throw new Error(
      'INVOICE_SERVICE_URL is not set. Required when INVOICE_SOURCE=service.'
    );
  }
  return url.replace(/\/+$/, '');
}

function getSecret(): string {
  const secret = process.env.INVOICE_API_SECRET;
  if (!secret) {
    throw new Error(
      'INVOICE_API_SECRET is not set. Required when INVOICE_SOURCE=service.'
    );
  }
  return secret;
}

// ============================================================================
// TYPES
// ============================================================================

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'void';

export type InvoiceType = 'estimate' | 'invoice';

export type PaymentMethod =
  | 'e_transfer'
  | 'cheque'
  | 'cash'
  | 'wire'
  | 'credit_card';

export interface ServiceInvoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  language: string;
  taxRate: number;
  gstNumber: string;
  paymentScheduleKey: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  shareToken: string;
  // Dates arrive as ISO strings on the wire
  invoiceDate: string;
  dueDate: string | null;
  approvedAt: string | null;
  viewedAt: string | null;
  siteId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLineItem {
  id: string;
  invoiceId: string;
  sectionType: string | null;
  label: string;
  description: string;
  steps: Array<{ text: string; remarks: string[] }> | null;
  rateCents: number;
  quantity: number;
  amountCents: number;
  footerLines: string[] | null;
  buildParams: Record<string, unknown> | null;
  displayOrder: number;
  createdAt: string;
}

export interface ServicePaymentMilestone {
  id: string;
  invoiceId: string;
  label: string;
  labelZh: string | null;
  percentage: number;
  amountCents: number;
  isPaid: boolean;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvoicesQuery {
  status?: InvoiceStatus;
  type?: InvoiceType;
  clientName?: string;
  page?: number;
  limit?: number;
}

export interface ListInvoicesResult {
  // NOTE: the service returns `data`, NOT `items` (verified against the
  // running service at https://invoice-api.reno-stars.com).
  data: ServiceInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceDetailResult {
  invoice: ServiceInvoice;
  lineItems: ServiceLineItem[];
  paymentMilestones: ServicePaymentMilestone[];
}

export interface CreateInvoiceBody {
  type?: InvoiceType;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  language?: string;
  taxRate?: number;
  gstNumber?: string;
  paymentScheduleKey?: string;
  notes?: string | null;
  siteId?: string | null;
  lineItems?: Array<{
    sectionType?: string | null;
    label: string;
    description: string;
    steps?: Array<{ text: string; remarks: string[] }> | null;
    rateCents?: number;
    quantity?: number;
    amountCents?: number;
    footerLines?: string[];
    buildParams?: Record<string, unknown> | null;
    displayOrder?: number;
  }>;
  paymentMilestones?: Array<{
    label: string;
    labelZh?: string | null;
    percentage: number;
    displayOrder?: number;
  }>;
}

export interface CreateInvoiceResult {
  id: string;
  invoiceNumber: string;
  shareToken: string;
}

export interface UpdateInvoiceBody {
  clientName?: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  language?: string;
  taxRate?: number;
  gstNumber?: string;
  paymentScheduleKey?: string;
  notes?: string | null;
  dueDate?: string | Date | null;
  siteId?: string | null;
  // type intentionally omitted — Next.js admin doesn't allow type changes.
  changedBy?: string;
}

export interface AddLineItemBody {
  sectionType?: string | null;
  label: string;
  description: string;
  steps?: Array<{ text: string; remarks: string[] }> | null;
  rateCents?: number;
  quantity?: number;
  amountCents?: number;
  footerLines?: string[];
  buildParams?: Record<string, unknown> | null;
  displayOrder?: number;
}

export interface UpdateLineItemBody {
  sectionType?: string | null;
  label?: string;
  description?: string;
  steps?: Array<{ text: string; remarks: string[] }> | null;
  rateCents?: number;
  quantity?: number;
  amountCents?: number;
  footerLines?: string[];
  buildParams?: Record<string, unknown> | null;
  displayOrder?: number;
}

export interface RecordPaymentBody {
  isPaid?: boolean;
  paymentMethod?: PaymentMethod | null;
  paymentReference?: string | null;
  paidAt?: string | Date | null;
  changedBy?: string;
}

// ============================================================================
// ERROR
// ============================================================================

export class InvoiceServiceError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'InvoiceServiceError';
    this.status = status;
    this.body = body;
  }
}

/** True for status 404 — useful for callers that want to convert to notFound(). */
export function isNotFoundError(err: unknown): boolean {
  return err instanceof InvoiceServiceError && err.status === 404;
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
  /** Accept header. Defaults to application/json. */
  accept?: string;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = getBaseUrl();
  const url = new URL(`${base}${path}`);
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
    Authorization: `Bearer ${getSecret()}`,
    Accept: opts.accept ?? 'application/json',
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
        // Force always-fresh — the upstream service is the source of truth.
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
        `Invoice service request failed (${opts.method} ${opts.path}): ${
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

  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {
      // ignore
    }
    throw new InvoiceServiceError(
      `Invoice service ${opts.method} ${opts.path} failed: ${res.status} ${res.statusText} ${bodyText}`.trim(),
      res.status,
      bodyText
    );
  }

  if (opts.accept === 'application/pdf' || contentType.startsWith('application/pdf')) {
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf) as unknown as T;
  }

  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

// ============================================================================
// CLIENT
// ============================================================================

export const invoiceClient = {
  list(query: ListInvoicesQuery = {}): Promise<ListInvoicesResult> {
    return request<ListInvoicesResult>({
      method: 'GET',
      path: '/api/invoices',
      query: {
        status: query.status,
        type: query.type,
        clientName: query.clientName,
        page: query.page,
        limit: query.limit,
      },
    });
  },

  get(id: string): Promise<InvoiceDetailResult> {
    return request<InvoiceDetailResult>({
      method: 'GET',
      path: `/api/invoices/${encodeURIComponent(id)}`,
    });
  },

  create(body: CreateInvoiceBody): Promise<CreateInvoiceResult> {
    return request<CreateInvoiceResult>({
      method: 'POST',
      path: '/api/invoices',
      body,
    });
  },

  update(
    id: string,
    body: UpdateInvoiceBody
  ): Promise<{ invoice: ServiceInvoice }> {
    return request<{ invoice: ServiceInvoice }>({
      method: 'PATCH',
      path: `/api/invoices/${encodeURIComponent(id)}`,
      body,
    });
  },

  delete(id: string): Promise<void> {
    return request<void>({
      method: 'DELETE',
      path: `/api/invoices/${encodeURIComponent(id)}`,
    });
  },

  addLineItem(
    id: string,
    body: AddLineItemBody
  ): Promise<{ lineItem: ServiceLineItem }> {
    return request<{ lineItem: ServiceLineItem }>({
      method: 'POST',
      path: `/api/invoices/${encodeURIComponent(id)}/line-items`,
      body,
    });
  },

  updateLineItem(
    id: string,
    itemId: string,
    body: UpdateLineItemBody
  ): Promise<{ lineItem: ServiceLineItem }> {
    return request<{ lineItem: ServiceLineItem }>({
      method: 'PATCH',
      path: `/api/invoices/${encodeURIComponent(id)}/line-items/${encodeURIComponent(itemId)}`,
      body,
    });
  },

  removeLineItem(id: string, itemId: string): Promise<void> {
    return request<void>({
      method: 'DELETE',
      path: `/api/invoices/${encodeURIComponent(id)}/line-items/${encodeURIComponent(itemId)}`,
    });
  },

  setStatus(
    id: string,
    status: InvoiceStatus,
    changedBy?: string
  ): Promise<{ invoice: ServiceInvoice }> {
    return request<{ invoice: ServiceInvoice }>({
      method: 'PATCH',
      path: `/api/invoices/${encodeURIComponent(id)}/status`,
      body: { status, changedBy },
    });
  },

  recordPayment(
    id: string,
    milestoneId: string,
    body: RecordPaymentBody
  ): Promise<{ milestone: ServicePaymentMilestone }> {
    return request<{ milestone: ServicePaymentMilestone }>({
      method: 'PATCH',
      path: `/api/invoices/${encodeURIComponent(id)}/payments/${encodeURIComponent(milestoneId)}`,
      body,
    });
  },

  getPdf(id: string): Promise<Buffer> {
    return request<Buffer>({
      method: 'GET',
      path: `/api/invoices/${encodeURIComponent(id)}/pdf`,
      accept: 'application/pdf',
    });
  },

  getShare(token: string): Promise<InvoiceDetailResult> {
    // Public share endpoint — mounted at /api/share/:token, no auth required
    // on the service side, but bearer token is harmless to send.
    return request<InvoiceDetailResult>({
      method: 'GET',
      path: `/api/share/${encodeURIComponent(token)}`,
    });
  },
};

export type InvoiceClient = typeof invoiceClient;
