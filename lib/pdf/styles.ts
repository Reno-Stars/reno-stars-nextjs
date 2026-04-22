import { StyleSheet } from '@react-pdf/renderer';

/**
 * Reno Stars brand colors — matching InvoiceSimple-style layout
 */
export const BRAND = {
  navy: '#1B365D',
  gold: '#C8922A',
  surface: '#E8E2DA',
  white: '#FFFFFF',
  black: '#111111',
  grey: '#666666',
  lightGrey: '#CCCCCC',
  headerBg: '#1B365D',
  headerText: '#FFFFFF',
  rowAlt: '#F7F5F2',
  stripeDark: '#2A4A73',
  stripeLight: '#3A5A83',
} as const;

export const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    color: BRAND.black,
    backgroundColor: BRAND.white,
  },

  // ── Top banner bar (diagonal stripes) ───────────────────────────────
  topBanner: {
    height: 14,
    backgroundColor: BRAND.navy,
    marginBottom: 0,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.lightGrey,
  },
  companyBlock: {
    flexDirection: 'column',
    maxWidth: '55%',
  },
  companyName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.black,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 8,
    color: BRAND.grey,
    marginBottom: 1,
  },
  docInfoBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  docTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    marginBottom: 4,
  },
  docInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'baseline',
  },
  docInfoLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.grey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  docInfoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.black,
  },

  // ── Client ──────────────────────────────────────────────────────────
  clientSection: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.lightGrey,
  },
  clientLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.grey,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 9,
    color: BRAND.grey,
    marginBottom: 1,
  },

  // ── Line items table ────────────────────────────────────────────────
  table: {
    paddingHorizontal: 40,
    marginTop: 4,
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND.headerBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    minHeight: 20,
  },
  tableRowAlt: {
    backgroundColor: BRAND.rowAlt,
  },
  tableCell: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Column widths — InvoiceSimple style (Description | Rate | Qty | Amount) ──
  colDescription: { width: '60%', paddingRight: 8, paddingLeft: 6 },
  colRate: { width: '14%', textAlign: 'right' as const },
  colQty: { width: '10%', textAlign: 'center' as const },
  colAmount: { width: '16%', textAlign: 'right' as const },

  // Section label (bold heading within description column)
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    marginBottom: 4,
  },
  // Description lines (step content)
  descLine: {
    fontSize: 7.5,
    color: BRAND.black,
    lineHeight: 1.5,
  },
  descRemark: {
    fontSize: 7,
    color: BRAND.grey,
    lineHeight: 1.4,
    paddingLeft: 4,
  },

  // ── Totals ──────────────────────────────────────────────────────────
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  totalsBox: {
    width: 200,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: BRAND.navy,
    marginTop: 2,
  },
  totalsLabel: {
    fontSize: 9,
    color: BRAND.grey,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  totalsLabelFinal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.white,
  },
  totalsValueFinal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.gold,
  },

  // ── Payment schedule ────────────────────────────────────────────────
  paymentSection: {
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.gold,
  },
  paymentHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND.surface,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  paymentHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    textTransform: 'uppercase',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  payColLabel: { width: '35%' },
  payColPercent: { width: '15%', textAlign: 'center' as const },
  payColAmount: { width: '25%', textAlign: 'right' as const },
  payColStatus: { width: '25%', textAlign: 'right' as const },
  paidBadge: {
    fontSize: 7,
    color: '#2E7D32',
    fontFamily: 'Helvetica-Bold',
  },
  unpaidBadge: {
    fontSize: 7,
    color: BRAND.grey,
  },

  // ── Notes ───────────────────────────────────────────────────────────
  notesSection: {
    paddingHorizontal: 40,
    marginBottom: 12,
    paddingVertical: 8,
  },
  notesText: {
    fontSize: 8,
    color: BRAND.black,
    lineHeight: 1.5,
  },

  // ── Terms ───────────────────────────────────────────────────────────
  termsSection: {
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 6.5,
    color: BRAND.grey,
    lineHeight: 1.4,
  },

  // ── Footer ──────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: BRAND.lightGrey,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: BRAND.grey,
  },
});
