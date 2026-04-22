import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice-template';
import type { InvoicePdfProps } from './invoice-template';

export type { InvoicePdfProps };

/**
 * Render an invoice PDF to a Node.js Buffer.
 * Runs server-side only — no browser dependency.
 *
 * TODO: Add Chinese font support (Noto Sans SC) for ZH invoices.
 */
export async function generateInvoicePdf(
  props: InvoicePdfProps
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePdf, props) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
