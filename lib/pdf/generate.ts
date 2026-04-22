import React from 'react';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice-template';
import type { InvoicePdfProps } from './invoice-template';
import path from 'path';

export type { InvoicePdfProps };

// ============================================================================
// FONT REGISTRATION — Chinese (CJK) support via Noto Sans SC
// ============================================================================

const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Variable.ttf');

// Register with explicit weight variants so @react-pdf/renderer
// can distinguish normal vs bold rendering
Font.register({
  family: 'Noto Sans SC',
  fonts: [
    { src: FONT_PATH, fontWeight: 400 },
    { src: FONT_PATH, fontWeight: 700 },
  ],
});

// Disable hyphenation for CJK
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
