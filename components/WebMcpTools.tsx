'use client';

import { useEffect } from 'react';
import { submitContactForm } from '@/app/actions/contact';

/**
 * WebMCP tool registration — exposes Reno Stars actions to AI browsing agents
 * (Claude-in-Chrome, ChatGPT/Gemini agents, etc.) so they can operate the site
 * reliably instead of guessing at the DOM. See https://webmachinelearning.github.io/webmcp/
 *
 * The main tool is `request_renovation_quote`, wired to the SAME server action
 * the contact form uses (`submitContactForm` → Resend email + Odoo CRM lead), so
 * there is no duplicate submit path. Registered site-wide (mounted in the locale
 * layout) so an agent on any page can request a quote.
 *
 * API note: `navigator.modelContext` was deprecated in Chrome 150 in favour of
 * `document.modelContext`; we prefer the new location and fall back to the old
 * one.
 *
 * Runtime: browsers don't ship the API natively yet, so we lazy-load
 * `@mcp-b/webmcp-polyfill` (the WebMCP community's strict core runtime) before
 * registering. Its initializer defers to a native `document.modelContext` when
 * one exists (native always wins) and installs the standard surface otherwise —
 * this is what makes the tool actually discoverable by agents/extensions and by
 * Lighthouse's Agentic Browsing "WebMCP tools registered" audit today. The
 * dynamic import keeps the polyfill out of the critical-path bundle (loads
 * post-hydration; zero TBT cost). The declarative counterpart (form
 * `toolname`/`tooldescription` attributes) lives on ContactForm's <form>.
 */

interface WebMcpToolResult {
  content: { type: 'text'; text: string }[];
}
interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<WebMcpToolResult>;
}
interface ModelContext {
  registerTool: (tool: WebMcpTool) => void;
}

function getModelContext(): ModelContext | null {
  if (typeof document !== 'undefined') {
    const dmc = (document as unknown as { modelContext?: ModelContext }).modelContext;
    if (dmc && typeof dmc.registerTool === 'function') return dmc;
  }
  if (typeof navigator !== 'undefined') {
    const nmc = (navigator as unknown as { modelContext?: ModelContext }).modelContext;
    if (nmc && typeof nmc.registerTool === 'function') return nmc;
  }
  return null;
}

// Module-level guard: within a single document lifetime the tool is registered
// once. SPA navigations keep document.modelContext alive, so this prevents the
// duplicate-name InvalidStateError on remount; a full reload resets the module.
let registered = false;

const str = (v: unknown) => (v == null ? '' : String(v));

export default function WebMcpTools() {
  useEffect(() => {
    if (registered) return;
    let cancelled = false;

    (async () => {
      // Ensure the WebMCP surface exists: the polyfill auto-initializes on
      // import and defers to a native document.modelContext when present.
      // If the chunk fails to load (offline, blocked), fall through — a native
      // API may still be there.
      try {
        await import('@mcp-b/webmcp-polyfill');
      } catch {
        /* fall through to a possible native API */
      }
      if (cancelled || registered) return;

      const mc = getModelContext();
      if (!mc) return;

      register(mc);
    })();

    return () => { cancelled = true; };
  }, []);

  return null;
}

function register(mc: ModelContext) {
  try {
    mc.registerTool({
        name: 'request_renovation_quote',
        description:
          'Submit a free renovation quote request to Reno Stars, a Vancouver home & commercial renovation company (kitchens, bathrooms, whole-house, basements, commercial). The enquiry is emailed to the Reno Stars team, who reply within 24 hours. Use this when the user wants a quote, estimate, consultation, or to contact Reno Stars about a renovation project in Metro Vancouver.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: "The person's full name." },
            phone: { type: 'string', description: 'A contact phone number the team can reach them at.' },
            message: {
              type: 'string',
              description:
                'Details of the renovation project: rooms/scope, approximate budget, timeline, and the property address or city.',
            },
            email: { type: 'string', description: 'A contact email address (optional but recommended).' },
            city: {
              type: 'string',
              description: 'Metro Vancouver city, e.g. Vancouver, Richmond, Burnaby, Surrey, Coquitlam (optional).',
            },
            propertyType: {
              type: 'string',
              description: 'Property type, e.g. house, condo, townhouse, commercial (optional).',
            },
          },
          required: ['name', 'phone', 'message'],
        },
        execute: async (args): Promise<WebMcpToolResult> => {
          const result = await submitContactForm({
            name: str(args.name),
            phone: str(args.phone),
            message: str(args.message),
            email: str(args.email),
            city: args.city ? str(args.city) : undefined,
            propertyType: args.propertyType ? str(args.propertyType) : undefined,
          });
          return { content: [{ type: 'text', text: result.message }] };
        },
      });
    registered = true;
  } catch {
    // registerTool throws InvalidStateError on duplicate name / invalid schema.
    // Either is safe to ignore — the tool is already available.
  }
}
