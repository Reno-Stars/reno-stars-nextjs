import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import { formatCurrency, formatDate } from './format';

// ============================================================================
// TYPES
// ============================================================================

export interface InvoicePdfProps {
  invoice: {
    invoiceNumber: string;
    type: 'estimate' | 'invoice';
    invoiceDate: string;
    dueDate?: string;
    clientName: string;
    clientAddress?: string;
    clientPhone?: string;
    clientEmail?: string;
    language: string;
    taxRate: number;
    gstNumber: string;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    notes?: string;
  };
  lineItems: Array<{
    label: string;
    description: string;
    rateCents: number;
    quantity: number;
    amountCents: number;
    footerLines?: string[];
  }>;
  milestones: Array<{
    label: string;
    percentage: number;
    amountCents: number;
    isPaid: boolean;
    paidAt?: string;
  }>;
  terms: string;
}

// ============================================================================
// COMPANY INFO
// ============================================================================

const COMPANY = {
  name: 'Reno Stars Construction Inc',
  address: 'Unit 188-21300 Gordon Way, Richmond, BC, V6W 1M2',
  phone: '7789607999',
  email: 'renostars604@gmail.com',
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert markdown-ish description text to plain text lines.
 * Turns `* item` into `  - item`, keeps numbered lists, strips other markdown.
 */
function descriptionToLines(text: string): string[] {
  return text.split('\n').map((line) => {
    // Convert * bullets to dashes
    const trimmed = line.replace(/^\s*\*\s+/, '  - ');
    // Strip bold/italic markdown
    return trimmed.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
  });
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function Header({ invoice }: { invoice: InvoicePdfProps['invoice'] }) {
  const docType = invoice.type === 'estimate' ? 'ESTIMATE' : 'INVOICE';

  return (
    <View style={styles.header}>
      <View style={styles.companyBlock}>
        <Text style={styles.companyName}>{COMPANY.name}</Text>
        <Text style={styles.companyDetail}>{COMPANY.address}</Text>
        <Text style={styles.companyDetail}>Phone: {COMPANY.phone}</Text>
        <Text style={styles.companyDetail}>Email: {COMPANY.email}</Text>
        <Text style={styles.companyDetail}>
          GST#: {invoice.gstNumber}
        </Text>
      </View>

      <View style={styles.docInfoBlock}>
        <Text style={styles.docTitle}>{docType}</Text>
        <View style={styles.docInfoRow}>
          <Text style={styles.docInfoLabel}>{docType} #</Text>
          <Text style={styles.docInfoValue}>{invoice.invoiceNumber}</Text>
        </View>
        <View style={styles.docInfoRow}>
          <Text style={styles.docInfoLabel}>Date</Text>
          <Text style={styles.docInfoValue}>
            {formatDate(invoice.invoiceDate)}
          </Text>
        </View>
        {invoice.dueDate && (
          <View style={styles.docInfoRow}>
            <Text style={styles.docInfoLabel}>Due Date</Text>
            <Text style={styles.docInfoValue}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ClientBlock({ invoice }: { invoice: InvoicePdfProps['invoice'] }) {
  return (
    <View style={styles.clientSection}>
      <Text style={styles.clientLabel}>Bill To</Text>
      <Text style={styles.clientName}>{invoice.clientName}</Text>
      {invoice.clientAddress && (
        <Text style={styles.clientDetail}>{invoice.clientAddress}</Text>
      )}
      {invoice.clientPhone && (
        <Text style={styles.clientDetail}>Phone: {invoice.clientPhone}</Text>
      )}
      {invoice.clientEmail && (
        <Text style={styles.clientDetail}>Email: {invoice.clientEmail}</Text>
      )}
    </View>
  );
}

function LineItemsTable({
  lineItems,
}: {
  lineItems: InvoicePdfProps['lineItems'];
}) {
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
        <Text style={[styles.tableHeaderCell, styles.colSection]}>Section</Text>
        <Text style={[styles.tableHeaderCell, styles.colDetails]}>Details</Text>
        <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
      </View>

      {/* Data rows */}
      {lineItems.map((item, idx) => {
        const lines = descriptionToLines(item.description);
        const isAlt = idx % 2 === 1;

        return (
          <View
            key={idx}
            style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.tableCell, styles.colNum]}>{idx + 1}</Text>
            <Text style={[styles.tableCellBold, styles.colSection]}>
              {item.label}
            </Text>
            <View style={styles.colDetails}>
              {lines.map((line, lineIdx) => (
                <Text key={lineIdx} style={styles.tableCell}>
                  {line}
                </Text>
              ))}
              {item.footerLines && item.footerLines.length > 0 && (
                <View style={{ marginTop: 3 }}>
                  {item.footerLines.map((fl, flIdx) => (
                    <Text
                      key={flIdx}
                      style={[styles.tableCell, { color: '#888888' }]}
                    >
                      {fl}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <Text style={[styles.tableCellBold, styles.colAmount]}>
              {formatCurrency(item.amountCents)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function TotalsBox({ invoice }: { invoice: InvoicePdfProps['invoice'] }) {
  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(invoice.subtotalCents)}
          </Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>GST ({invoice.taxRate}%)</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(invoice.taxCents)}
          </Text>
        </View>
        <View style={styles.totalsRowFinal}>
          <Text style={styles.totalsLabelFinal}>Total</Text>
          <Text style={styles.totalsValueFinal}>
            {formatCurrency(invoice.totalCents)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PaymentSchedule({
  milestones,
}: {
  milestones: InvoicePdfProps['milestones'];
}) {
  if (milestones.length === 0) return null;

  return (
    <View style={styles.paymentSection}>
      <Text style={styles.sectionTitle}>Payment Schedule</Text>

      {/* Header */}
      <View style={styles.paymentHeaderRow}>
        <Text style={[styles.paymentHeaderCell, styles.payColLabel]}>
          Milestone
        </Text>
        <Text style={[styles.paymentHeaderCell, styles.payColPercent]}>%</Text>
        <Text style={[styles.paymentHeaderCell, styles.payColAmount]}>
          Amount
        </Text>
        <Text style={[styles.paymentHeaderCell, styles.payColStatus]}>
          Status
        </Text>
      </View>

      {/* Rows */}
      {milestones.map((ms, idx) => (
        <View key={idx} style={styles.paymentRow}>
          <Text style={[styles.tableCell, styles.payColLabel]}>{ms.label}</Text>
          <Text style={[styles.tableCell, styles.payColPercent]}>
            {ms.percentage}%
          </Text>
          <Text style={[styles.tableCellBold, styles.payColAmount]}>
            {formatCurrency(ms.amountCents)}
          </Text>
          <View style={styles.payColStatus}>
            {ms.isPaid ? (
              <Text style={styles.paidBadge}>
                PAID{ms.paidAt ? ` (${formatDate(ms.paidAt)})` : ''}
              </Text>
            ) : (
              <Text style={styles.unpaidBadge}>Pending</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function NotesSection({ notes }: { notes?: string }) {
  if (!notes) return null;

  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Notes</Text>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  );
}

function TermsSection({ terms }: { terms: string }) {
  if (!terms) return null;

  return (
    <View style={styles.termsSection}>
      <Text style={styles.sectionTitle}>Terms & Conditions</Text>
      <Text style={styles.termsText}>{terms}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        This document was generated by Reno Stars Construction Inc.
      </Text>
    </View>
  );
}

// ============================================================================
// MAIN PDF DOCUMENT
// ============================================================================

export function InvoicePdf({
  invoice,
  lineItems,
  milestones,
  terms,
}: InvoicePdfProps) {
  return (
    <Document
      title={`${invoice.type === 'estimate' ? 'Estimate' : 'Invoice'} ${invoice.invoiceNumber}`}
      author={COMPANY.name}
    >
      <Page size="LETTER" style={styles.page}>
        <Header invoice={invoice} />
        <ClientBlock invoice={invoice} />
        <LineItemsTable lineItems={lineItems} />
        <TotalsBox invoice={invoice} />
        <PaymentSchedule milestones={milestones} />
        <NotesSection notes={invoice.notes} />
        <TermsSection terms={terms} />
        <Footer />
      </Page>
    </Document>
  );
}
