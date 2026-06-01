import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'

const RA_NAME = 'Compass Registered Agent LLC'
const RA_ADDRESS = '123 Business Ave, Tallahassee, FL 32301'

interface FilingSheetData {
  orderId: string
  generatedAt: string
  businessName: string
  serviceType: string
  state: string
  principalAddress?: string
  mailingAddress?: string
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string
  addOns: string[]
  internalNotes?: string
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 12,
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1a2744',
  },
  headerMeta: {
    fontSize: 8,
    color: '#666',
    textAlign: 'right',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a2744',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
    color: '#666',
    fontSize: 9,
  },
  value: {
    flex: 1,
    color: '#222',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 8,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#fff8e1',
    borderWidth: 0.5,
    borderColor: '#f0c040',
    padding: 8,
    marginBottom: 14,
    borderRadius: 2,
  },
  warningText: {
    fontSize: 9,
    color: '#7a5c00',
  },
})

function FilingSheetDocument({ data }: { data: FilingSheetData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Compass</Text>
          <View>
            <Text style={styles.headerMeta}>Order ID: {data.orderId}</Text>
            <Text style={styles.headerMeta}>Generated: {data.generatedAt}</Text>
            <Text style={styles.headerMeta}>INTERNAL USE ONLY</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            QC before filing. Verify all details on Sunbiz after submission.
          </Text>
        </View>

        {/* Business Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>LLC Name</Text>
            <Text style={styles.value}>{data.businessName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Service Type</Text>
            <Text style={styles.value}>{data.serviceType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>State</Text>
            <Text style={styles.value}>{data.state}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Principal Address</Text>
            <Text style={styles.value}>{data.principalAddress ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mailing Address</Text>
            <Text style={styles.value}>{data.mailingAddress ?? 'Same as principal'}</Text>
          </View>
        </View>

        {/* Registered Agent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registered Agent</Text>
          <View style={styles.row}>
            <Text style={styles.label}>RA Name</Text>
            <Text style={styles.value}>{RA_NAME}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RA Address</Text>
            <Text style={styles.value}>{RA_ADDRESS}</Text>
          </View>
        </View>

        {/* Organizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizer / Authorized Signer</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{data.organizerName ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{data.organizerEmail ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{data.organizerPhone ?? '—'}</Text>
          </View>
        </View>

        {/* Add-ons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add-ons Ordered</Text>
          <View style={styles.row}>
            <Text style={styles.value}>
              {data.addOns.length > 0 ? data.addOns.join(', ') : 'None'}
            </Text>
          </View>
        </View>

        {/* Internal Notes */}
        {data.internalNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Internal Notes</Text>
            <View style={styles.row}>
              <Text style={styles.value}>{data.internalNotes}</Text>
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.footer}>
          Compass Registered Agent — Filed. Done. Active. | QC before filing. Verify on Sunbiz after submission.
        </Text>
      </Page>
    </Document>
  )
}

export async function generateFilingSheet(data: FilingSheetData): Promise<Buffer> {
  const instance = pdf(<FilingSheetDocument data={data} />)
  const blob = await instance.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export type { FilingSheetData }
