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
 * one. The whole thing no-ops in browsers/agents without WebMCP support.
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
    const mc = getModelContext();
    if (!mc) return;

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
  }, []);

  return null;
}
