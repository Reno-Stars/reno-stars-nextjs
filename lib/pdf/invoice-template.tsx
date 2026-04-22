import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import path from 'path';
import { styles, BRAND } from './styles';
import { formatCurrency, formatDate } from './format';

// ============================================================================
// TYPES
// ============================================================================

interface StepData {
  text: string;
  remarks: string[];
}

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
    steps?: StepData[] | null;
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
  address: 'Unit 188-21300 Gordon Way',
  city: 'Richmond, BC V6W 1M2',
  phone: '778-960-7999',
  email: 'renostars604@gmail.com',
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/** Parse description text into steps (fallback when steps JSONB is null) */
function parseDescriptionToSteps(text: string): StepData[] {
  const steps: StepData[] = [];
  let current: StepData | null = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch) {
      if (current) steps.push(current);
      current = { text: stepMatch[2], remarks: [] };
      continue;
    }

    const remarkMatch = line.match(/^[-*]\s*(.+)$/);
    if (remarkMatch && current) {
      current.remarks.push(remarkMatch[1]);
      continue;
    }

    if (current) {
      current.remarks.push(line);
    } else {
      current = { text: line, remarks: [] };
    }
  }
  if (current) steps.push(current);
  return steps;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TopBanner() {
  return <View style={styles.topBanner} fixed />;
}

function Header({ invoice }: { invoice: InvoicePdfProps['invoice'] }) {
  const docType = invoice.type === 'estimate' ? 'ESTIMATE' : 'INVOICE';
  const isEstimate = invoice.type === 'estimate';

  return (
    <View style={styles.header}>
      <View style={styles.companyBlock}>
        <Image
          src={path.join(process.cwd(), 'public', 'logo.png')}
          style={{ width: 160, marginBottom: 6 }}
        />
        <Text style={styles.companyName}>{COMPANY.name}</Text>
        <Text style={styles.companyDetail}>{COMPANY.address}</Text>
        <Text style={styles.companyDetail}>{COMPANY.city}</Text>
        <Text style={styles.companyDetail}>{COMPANY.phone}</Text>
        <Text style={styles.companyDetail}>{COMPANY.email}</Text>
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
        <View style={styles.docInfoRow}>
          <Text style={styles.docInfoLabel}>Total</Text>
          <Text style={styles.docInfoValue}>
            CAD {formatCurrency(isEstimate ? invoice.subtotalCents : invoice.totalCents)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ClientBlock({ invoice }: { invoice: InvoicePdfProps['invoice'] }) {
  return (
    <View style={styles.clientSection}>
      <Text style={styles.clientLabel}>To</Text>
      <Text style={styles.clientName}>{invoice.clientName}</Text>
      {invoice.clientAddress && (
        <Text style={styles.clientDetail}>{invoice.clientAddress}</Text>
      )}
      {invoice.clientPhone && (
        <Text style={styles.clientDetail}>{invoice.clientPhone}</Text>
      )}
      {invoice.clientEmail && (
        <Text style={styles.clientDetail}>{invoice.clientEmail}</Text>
      )}
    </View>
  );
}

/** Render a single step with number, text, and indented remarks */
function StepView({ step, num }: { step: StepData; num: number }) {
  return (
    <View style={{ marginBottom: 4 }}>
      {/* Step line: "1. Step text" — bold black for readability */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Text style={{
          fontSize: 8,
          fontWeight: 700,
          color: BRAND.black,
          width: 16,
          textAlign: 'right',
          marginRight: 4,
        }}>
          {num}.
        </Text>
        <Text style={{
          fontSize: 8,
          fontWeight: 700,
          color: BRAND.black,
          flex: 1,
          lineHeight: 1.4,
        }}>
          {step.text}
        </Text>
      </View>
      {/* Remarks: indented with * prefix */}
      {step.remarks.map((remark, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 20 }}>
          <Text style={{
            fontSize: 7,
            color: '#888888',
            marginRight: 3,
            marginTop: 0.5,
          }}>
            *
          </Text>
          <Text style={{
            fontSize: 7,
            color: '#555555',
            flex: 1,
            lineHeight: 1.35,
          }}>
            {remark}
          </Text>
        </View>
      ))}
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
      <View style={styles.tableHeaderRow} fixed>
        <Text style={[styles.tableHeaderCell, styles.colDescription]}>
          Description
        </Text>
        <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
        <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
      </View>

      {/* Data rows */}
      {lineItems.map((item, idx) => {
        const steps = item.steps && item.steps.length > 0
          ? item.steps
          : parseDescriptionToSteps(item.description);
        const isAlt = idx % 2 === 1;

        return (
          <View
            key={idx}
            style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}
          >
            {/* Description column — section label + structured steps */}
            <View style={styles.colDescription}>
              <Text style={styles.sectionLabel}>{item.label}</Text>
              {steps.map((step, i) => (
                <StepView key={i} step={step} num={i + 1} />
              ))}
              {/* Footer lines (client-provides, notes) */}
              {item.footerLines && item.footerLines.length > 0 && (
                <View style={{
                  marginTop: 5,
                  paddingTop: 4,
                  borderTopWidth: 0.5,
                  borderTopColor: '#D0D0D0',
                }}>
                  <Text style={{
                    fontSize: 6.5,
                    fontWeight: 700,
                    color: BRAND.navy,
                    marginBottom: 2,
                  }}>
                    Note:
                  </Text>
                  {item.footerLines.map((fl, flIdx) => (
                    <View key={flIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 2 }}>
                      <Text style={{ fontSize: 6.5, color: BRAND.grey, marginRight: 3 }}>*</Text>
                      <Text style={{ fontSize: 6.5, color: BRAND.grey, flex: 1, lineHeight: 1.3 }}>
                        {fl}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Rate */}
            <Text style={[styles.tableCellBold, styles.colRate]}>
              {formatCurrency(item.rateCents)}
            </Text>

            {/* Qty */}
            <Text style={[styles.tableCell, styles.colQty]}>
              {item.quantity}
            </Text>

            {/* Amount */}
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
  const isEstimate = invoice.type === 'estimate';

  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>
            {formatCurrency(invoice.subtotalCents)}
          </Text>
        </View>
        {!isEstimate && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>GST ({invoice.taxRate}%)</Text>
            <Text style={styles.totalsValue}>
              {formatCurrency(invoice.taxCents)}
            </Text>
          </View>
        )}
        <View style={styles.totalsRowFinal}>
          <Text style={styles.totalsLabelFinal}>Total</Text>
          <Text style={styles.totalsValueFinal}>
            {formatCurrency(isEstimate ? invoice.subtotalCents : invoice.totalCents)}
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
    <View style={styles.termsSection} break>
      <Text style={styles.sectionTitle}>Terms & Conditions</Text>
      <Text style={styles.termsText}>{terms}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Reno Stars Construction Inc | 778-960-7999 | renostars604@gmail.com
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
        <TopBanner />
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
