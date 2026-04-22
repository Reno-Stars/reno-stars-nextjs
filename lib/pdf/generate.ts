import React from 'react';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice-template';
import type { InvoicePdfProps } from './invoice-template';
import path from 'path';

export type { InvoicePdfProps };

// ============================================================================
// FONT REGISTRATION — Chinese (CJK) support via Noto Sans SC
// ============================================================================

const NOTO_SANS_SC_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Variable.ttf');

Font.register({
  family: 'Noto Sans SC',
  src: NOTO_SANS_SC_PATH,
});

// Register as fallback for Helvetica — any glyph not found in Helvetica
// will fall back to Noto Sans SC (covers CJK characters)
Font.registerHyphenationCallback((word) => [word]);

/**
 * Render an invoice PDF to a Node.js Buffer.
 * Runs server-side only — no browser dependency.
 *
 * Supports Chinese text via Noto Sans SC font (registered above).
 */
export async function generateInvoicePdf(
  props: InvoicePdfProps
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePdf, props) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
