import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'

// Compass RA details — confirmed via SunBiz (Document # L25000307072)
const RA_NAME = 'Compass Registered Agent, LLC'
const RA_ADDRESS = '625 Court St Ste 100, Clearwater, FL 33756'
const RA_COUNTY = 'Pinellas'

// ─── Shared styles ────────────────────────────────────────────────────────────

const base = StyleSheet.create({
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
  headerMeta: { fontSize: 8, color: '#666', textAlign: 'right' },
  section: { marginBottom: 14 },
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
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, color: '#666', fontSize: 9 },
  value: { flex: 1, color: '#222', fontSize: 9 },
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
  warningText: { fontSize: 9, color: '#7a5c00' },
  fieldBox: {
    borderWidth: 0.5,
    borderColor: '#bbb',
    padding: '6 8',
    marginBottom: 8,
    borderRadius: 2,
  },
  fieldLabel: { fontSize: 8, color: '#666', marginBottom: 2 },
  fieldValue: { fontSize: 10, color: '#111' },
  articleTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a2744',
    marginBottom: 4,
  },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#ddd', marginBottom: 10 },
})

// ─── INTERNAL FILING SHEET ────────────────────────────────────────────────────

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

function FilingSheetDocument({ data }: { data: FilingSheetData }) {
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <View style={base.header}>
          <Text style={base.logoText}>Compass</Text>
          <View>
            <Text style={base.headerMeta}>Order ID: {data.orderId}</Text>
            <Text style={base.headerMeta}>Generated: {data.generatedAt}</Text>
            <Text style={base.headerMeta}>INTERNAL USE ONLY</Text>
          </View>
        </View>

        <View style={base.warningBox}>
          <Text style={base.warningText}>
            QC before filing. Verify all details on Sunbiz after submission.
          </Text>
        </View>

        <View style={base.section}>
          <Text style={base.sectionTitle}>Business Information</Text>
          <Row label="LLC Name" value={data.businessName} />
          <Row label="Service Type" value={data.serviceType} />
          <Row label="State" value={data.state} />
        </View>

        <View style={base.section}>
          <Text style={base.sectionTitle}>Addresses</Text>
          <Row label="Principal Address" value={data.principalAddress ?? '—'} />
          <Row label="Mailing Address" value={data.mailingAddress ?? 'Same as principal'} />
        </View>

        <View style={base.section}>
          <Text style={base.sectionTitle}>Registered Agent</Text>
          <Row label="RA Name" value={RA_NAME} />
          <Row label="RA Address" value={RA_ADDRESS} />
        </View>

        <View style={base.section}>
          <Text style={base.sectionTitle}>Organizer / Authorized Signer</Text>
          <Row label="Name" value={data.organizerName ?? '—'} />
          <Row label="Email" value={data.organizerEmail ?? '—'} />
          <Row label="Phone" value={data.organizerPhone ?? '—'} />
        </View>

        <View style={base.section}>
          <Text style={base.sectionTitle}>Add-ons Ordered</Text>
          <View style={base.row}>
            <Text style={base.value}>
              {data.addOns.length > 0 ? data.addOns.join(', ') : 'None'}
            </Text>
          </View>
        </View>

        {data.internalNotes ? (
          <View style={base.section}>
            <Text style={base.sectionTitle}>Internal Notes</Text>
            <View style={base.row}>
              <Text style={base.value}>{data.internalNotes}</Text>
            </View>
          </View>
        ) : null}

        <Text style={base.footer}>
          Compass Registered Agent — Filed. Done. Active. | QC before filing. Verify on Sunbiz after submission.
        </Text>
      </Page>
    </Document>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={base.row}>
      <Text style={base.label}>{label}</Text>
      <Text style={base.value}>{value}</Text>
    </View>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={base.fieldBox}>
      <Text style={base.fieldLabel}>{label}</Text>
      <Text style={base.fieldValue}>{value || '—'}</Text>
    </View>
  )
}

export async function generateFilingSheet(data: FilingSheetData): Promise<Buffer> {
  const instance = pdf(<FilingSheetDocument data={data} />)
  const blob = await instance.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export type { FilingSheetData }

// ─── ARTICLES OF ORGANIZATION — mirrors actual FL SunBiz form ────────────────
// Layout follows the official DR-621 field order so Bridget can QC field-by-field.

export interface ArticlesOfOrgData {
  orderId: string
  generatedAt: string
  // Article I
  llcName: string
  // Article II
  principalStreet: string
  principalCity: string
  principalState: string
  principalZip: string
  mailingStreet?: string
  mailingCity?: string
  mailingState?: string
  mailingZip?: string
  // Article III — RA
  raName: string
  raStreet: string
  raCity: string
  raCounty: string
  raState: string
  raZip: string
  // Article IV — Management
  managementType: 'member-managed' | 'manager-managed'
  members: Array<{ name: string; title: string; address: string; ownershipPct?: string }>
  // Article V — Effective date (blank = immediate)
  effectiveDate?: string
  // Signature block
  organizerName: string
  organizerDate: string
}

function ArticlesOfOrgDocument({ data }: { data: ArticlesOfOrgData }) {
  return (
    <Document>
      <Page size="LETTER" style={base.page}>
        {/* Header */}
        <View style={base.header}>
          <View>
            <Text style={base.logoText}>Articles of Organization</Text>
            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
              Florida Limited Liability Company — State of Florida
            </Text>
          </View>
          <View>
            <Text style={base.headerMeta}>Order ID: {data.orderId}</Text>
            <Text style={base.headerMeta}>Prepared: {data.generatedAt}</Text>
          </View>
        </View>

        <View style={base.warningBox}>
          <Text style={base.warningText}>
            QC DRAFT — verify each field against client submission before filing on SunBiz.
          </Text>
        </View>

        {/* Article I — Name */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Article I — Name of Limited Liability Company</Text>
          <Field label="LLC Name (must end in LLC, L.L.C., or Limited Liability Company)" value={data.llcName} />
        </View>

        <View style={base.divider} />

        {/* Article II — Principal Office */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Article II — Principal Office Address</Text>
          <Field label="Street Address (no P.O. Box)" value={data.principalStreet} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 2 }}>
              <Field label="City" value={data.principalCity} />
            </View>
            <View style={{ width: 40 }}>
              <Field label="State" value={data.principalState} />
            </View>
            <View style={{ width: 70 }}>
              <Field label="ZIP" value={data.principalZip} />
            </View>
          </View>
          {data.mailingStreet && data.mailingStreet !== data.principalStreet && (
            <>
              <Text style={{ fontSize: 9, color: '#666', marginTop: 6, marginBottom: 4 }}>
                Mailing Address (if different):
              </Text>
              <Field label="Mailing Street" value={data.mailingStreet} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 2 }}>
                  <Field label="City" value={data.mailingCity ?? ''} />
                </View>
                <View style={{ width: 40 }}>
                  <Field label="State" value={data.mailingState ?? ''} />
                </View>
                <View style={{ width: 70 }}>
                  <Field label="ZIP" value={data.mailingZip ?? ''} />
                </View>
              </View>
            </>
          )}
        </View>

        <View style={base.divider} />

        {/* Article III — Registered Agent */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Article III — Registered Agent and Registered Office</Text>
          <Field label="Name of Registered Agent" value={data.raName} />
          <Field label="Street Address of Registered Office (no P.O. Box)" value={data.raStreet} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 2 }}>
              <Field label="City" value={data.raCity} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="County" value={data.raCounty} />
            </View>
            <View style={{ width: 40 }}>
              <Field label="State" value={data.raState} />
            </View>
            <View style={{ width: 70 }}>
              <Field label="ZIP" value={data.raZip} />
            </View>
          </View>
        </View>

        <View style={base.divider} />

        {/* Article IV — Management */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Article IV — Management</Text>
          <Field
            label="Management Type"
            value={
              data.managementType === 'member-managed'
                ? 'Member-Managed (managed by members)'
                : 'Manager-Managed (managed by one or more managers)'
            }
          />
          {data.members.map((m, i) => (
            <View key={i} style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>
                {data.managementType === 'member-managed' ? `Member ${i + 1}` : `Manager ${i + 1}`}
                {m.ownershipPct ? ` — ${m.ownershipPct}% ownership` : ''}
              </Text>
              <Field label="Name" value={m.name} />
              <Field label="Address" value={m.address} />
            </View>
          ))}
        </View>

        <View style={base.divider} />

        {/* Article V — Effective Date */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Article V — Effective Date</Text>
          <Field
            label="Effective Date (leave blank for immediate effectiveness upon filing)"
            value={data.effectiveDate ?? 'Immediate — upon filing'}
          />
        </View>

        <View style={base.divider} />

        {/* Signature */}
        <View style={base.section}>
          <Text style={base.articleTitle}>Signature of Organizer / Authorized Representative</Text>
          <Field label="Name of Organizer" value={data.organizerName} />
          <Field label="Date" value={data.organizerDate} />
          <View style={{ marginTop: 24, borderBottomWidth: 0.5, borderBottomColor: '#555', width: 240 }} />
          <Text style={{ fontSize: 8, color: '#888', marginTop: 4 }}>
            Authorized Signature — {data.organizerName}
          </Text>
        </View>

        <Text style={base.footer}>
          Compass Registered Agent — Draft for QC only. Do not distribute to client.
        </Text>
      </Page>
    </Document>
  )
}

export async function generateArticlesOfOrg(data: ArticlesOfOrgData): Promise<Buffer> {
  const instance = pdf(<ArticlesOfOrgDocument data={data} />)
  const blob = await instance.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
