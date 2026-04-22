import { StyleSheet } from '@react-pdf/renderer';

/**
 * Reno Stars brand colors
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
} as const;

export const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 35,
    color: BRAND.black,
    backgroundColor: BRAND.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.gold,
  },
  companyBlock: {
    flexDirection: 'column',
    maxWidth: '55%',
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    marginBottom: 4,
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
    marginBottom: 6,
  },
  docInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  docInfoLabel: {
    fontSize: 8,
    color: BRAND.grey,
    width: 60,
    textAlign: 'right',
    marginRight: 6,
  },
  docInfoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.black,
  },

  // Client
  clientSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: BRAND.rowAlt,
    borderRadius: 4,
  },
  clientLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 8,
    color: BRAND.grey,
    marginBottom: 1,
  },

  // Line items table
  table: {
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND.headerBg,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.lightGrey,
  },
  tableRowAlt: {
    backgroundColor: BRAND.rowAlt,
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Column widths for line items
  colNum: { width: '6%' },
  colSection: { width: '20%' },
  colDetails: { width: '58%' },
  colAmount: { width: '16%', textAlign: 'right' as const },

  // Totals
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  totalsBox: {
    width: 200,
    borderWidth: 1,
    borderColor: BRAND.navy,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.lightGrey,
  },
  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: BRAND.navy,
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

  // Payment schedule
  paymentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
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
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  paymentHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.navy,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.lightGrey,
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

  // Notes
  notesSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: BRAND.rowAlt,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 8,
    color: BRAND.black,
    lineHeight: 1.5,
  },

  // Terms
  termsSection: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 7,
    color: BRAND.grey,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 35,
    right: 35,
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
