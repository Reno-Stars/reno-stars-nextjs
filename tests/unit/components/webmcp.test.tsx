/**
 * WebMCP regression guards (CI-enforced via ci.yml's test job).
 *
 * Two integration surfaces expose Reno Stars to AI browsing agents:
 *  1. IMPERATIVE — components/WebMcpTools.tsx lazy-loads @mcp-b/webmcp-polyfill
 *     and registers `request_renovation_quote` on document.modelContext.
 *  2. DECLARATIVE — ContactForm's <form> carries toolname/tooldescription
 *     attributes (static HTML; what Lighthouse's Agentic Browsing
 *     "form coverage" audit reads).
 *
 * If either surface regresses (polyfill import dropped, tool renamed, form
 * attributes lost, required fields drifting from submitContactForm's
 * validation), these tests fail.
 *
 * Notes: next-intl is globally mocked in tests/setup.ts (useTranslations
 * echoes keys), so ContactForm renders without a provider. The polyfill's
 * getTools() mirrors Chromium's producer-preview API: inputSchema comes back
 * as a JSON *string*.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import WebMcpTools from '@/components/WebMcpTools';
import ContactForm from '@/components/ContactForm';

// The tool's execute() calls the contact server action; the component test only
// exercises registration, so stub the action module (its real behavior is
// covered by tests/unit/actions/contact.test.ts).
vi.mock('@/app/actions/contact', () => ({
  submitContactForm: vi.fn(async () => ({ success: true, message: 'ok' })),
}));

interface RegisteredToolInfo {
  name: string;
  description: string;
  /** JSON-serialized schema, per the Chromium producer-preview getTools() shape. */
  inputSchema?: string;
}
interface ModelContextWithDiscovery {
  registerTool: (tool: unknown) => void;
  getTools?: () => Promise<RegisteredToolInfo[]>;
}

const getMc = () =>
  (document as unknown as { modelContext?: ModelContextWithDiscovery }).modelContext;

describe('WebMcpTools (imperative registration)', () => {
  beforeAll(() => {
    render(<WebMcpTools />);
  });

  it('installs the WebMCP surface and registers request_renovation_quote', async () => {
    await waitFor(() => {
      const mc = getMc();
      expect(mc, 'document.modelContext should exist after the polyfill loads').toBeTruthy();
      expect(typeof mc!.registerTool).toBe('function');
    });

    const mc = getMc()!;
    // Discovery API (polyfill implements the Chromium producer-preview getTools()).
    expect(typeof mc.getTools, 'polyfill should expose getTools() for discovery').toBe('function');
    const tools = await mc.getTools!();
    const quote = tools.find((t) => t.name === 'request_renovation_quote');
    expect(quote, 'request_renovation_quote must be registered').toBeTruthy();
    expect(quote!.description).toMatch(/renovation/i);
  });

  it('declares the same required fields submitContactForm validates (name, phone, message)', async () => {
    const tools = await getMc()!.getTools!();
    const quote = tools.find((t) => t.name === 'request_renovation_quote')!;
    const schema = JSON.parse(quote.inputSchema ?? '{}') as {
      required?: string[];
      properties?: Record<string, unknown>;
    };
    // app/actions/contact.ts rejects when name/phone/message are missing — the
    // schema must tell agents that up front.
    expect(schema.required).toEqual(expect.arrayContaining(['name', 'phone', 'message']));
    // Optional slugs the action accepts (silently dropped when unknown).
    expect(Object.keys(schema.properties ?? {})).toEqual(
      expect.arrayContaining(['name', 'phone', 'message', 'email', 'city', 'propertyType']),
    );
  });
});

describe('ContactForm (declarative WebMCP annotation)', () => {
  it('carries toolname + tooldescription on the <form> (Lighthouse form-coverage)', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form');
    expect(form, '<form> should render').toBeTruthy();
    expect(form!.getAttribute('toolname')).toBe('submit_renovation_quote_form');
    const desc = form!.getAttribute('tooldescription') ?? '';
    expect(desc).toMatch(/renovation/i);
    expect(desc.length).toBeGreaterThan(40);
  });

  it('names its fields so the declarative schema derives correctly', () => {
    const { container } = render(<ContactForm />);
    for (const field of ['name', 'phone', 'message']) {
      expect(
        container.querySelector(`[name="${field}"]`),
        `field "${field}" must exist with a name attribute`,
      ).toBeTruthy();
    }
  });
});
