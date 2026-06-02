// IRS Form SS-4 draft PDF for non-U.S. nationals.
// Pre-fills what we know from order data. Bridget completes + submits.
// Layout mirrors the actual SS-4 form field numbering for easy QC.

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: '36 40',
    color: '#111',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a2744',
    marginBottom: 2,
  },
  subtitle: { fontSize: 8, color: '#666', marginBottom: 12 },
  warningBox: {
    backgroundColor: '#fff8e1',
    borderWidth: 0.5,
    borderColor: '#f0c040',
    padding: 7,
    marginBottom: 10,
    borderRadius: 2,
  },
  warningText: { fontSize: 8, color: '#7a5c00' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  fieldBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#bbb',
    padding: '4 6',
    borderRadius: 2,
  },
  fieldNum: { fontSize: 7, color: '#888', marginBottom: 1 },
  fieldLabel: { fontSize: 7.5, color: '#444', marginBottom: 2 },
  fieldValue: { fontSize: 9, color: '#111', fontFamily: 'Helvetica-Bold' },
  sectionBreak: { borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginBottom: 8, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 6,
    fontSize: 7.5,
    color: '#999',
    textAlign: 'center',
  },
})

function F({
  num,
  label,
  value,
  flex,
}: {
  num: string
  label: string
  value: string
  flex?: number
}) {
  return (
    <View style={[s.fieldBox, flex !== undefined ? { flex } : {}]}>
      <Text style={s.fieldNum}>{num}</Text>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value || '—'}</Text>
    </View>
  )
}

export interface SS4Data {
  orderId: string
  generatedAt: string
  // Line 1
  legalName: string
  // Line 3 — executor / care of (blank for LLC)
  careOf?: string
  // Lines 4a/4b — mailing address
  mailingStreet: string
  mailingCityStateZip: string
  // Lines 5a/5b — street address (if different)
  streetAddress?: string
  streetCityStateZip?: string
  // Line 6 — county and state
  county: string
  state: string
  // Line 7a/7b — responsible party
  responsiblePartyName: string
  taxIdType: 'itin' | 'ssn'
  // We show the type but NOT the actual SSN/ITIN in this draft for security
  // Line 8a/8b/8c — entity
  memberCount: string
  isForeignLLC: boolean
  // Line 9a — entity type
  entityType: string
  // Line 10 — reason for applying
  reasonApplying: string
  // Line 11 — date business started
  dateStarted: string
  // Line 12 — closing month of accounting year
  closingMonth: string
  // Line 15 — first date wages paid
  firstWagesDate?: string
  // Line 16 — business activity
  businessPurpose: string
}

function SS4Document({ data }: { data: SS4Data }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <Text style={s.title}>IRS Form SS-4 — Application for Employer Identification Number</Text>
        <Text style={s.subtitle}>
          DRAFT — Order {data.orderId} — Prepared {data.generatedAt} — FOR BRIDGET TO COMPLETE AND SUBMIT
        </Text>

        <View style={s.warningBox}>
          <Text style={s.warningText}>
            DRAFT ONLY. SSN/ITIN not shown here for security — retrieve from encrypted order data.
            Verify all fields before submitting to IRS. Foreign applicants: fax to 1-855-215-1627.
          </Text>
        </View>

        {/* Lines 1–3 */}
        <View style={s.row}>
          <F num="1" label="Legal name of entity (as it appears on charter or other legal document)" value={data.legalName} flex={3} />
        </View>
        <View style={s.row}>
          <F num="3" label="Executor, administrator, trustee, 'care of' name" value={data.careOf ?? ''} flex={3} />
        </View>

        <View style={s.sectionBreak} />

        {/* Lines 4a/4b */}
        <View style={s.row}>
          <F num="4a" label="Mailing address (street, apt./suite no., or P.O. box)" value={data.mailingStreet} flex={3} />
        </View>
        <View style={s.row}>
          <F num="4b" label="City, state, and ZIP code (if foreign, enter province, postal code, and country)" value={data.mailingCityStateZip} flex={3} />
        </View>

        {/* Lines 5a/5b (if different) */}
        {data.streetAddress && (
          <>
            <View style={s.row}>
              <F num="5a" label="Street address (if different from line 4a)" value={data.streetAddress} flex={3} />
            </View>
            <View style={s.row}>
              <F num="5b" label="City, state, and ZIP code" value={data.streetCityStateZip ?? ''} flex={3} />
            </View>
          </>
        )}

        {/* Line 6 */}
        <View style={s.row}>
          <F num="6" label="County and state where principal business is located" value={`${data.county}, ${data.state}`} flex={3} />
        </View>

        <View style={s.sectionBreak} />

        {/* Lines 7a/7b */}
        <View style={s.row}>
          <F num="7a" label="Name of responsible party" value={data.responsiblePartyName} flex={2} />
          <F num="7b" label="SSN, ITIN, or EIN of responsible party" value={`[${data.taxIdType.toUpperCase()} — see encrypted order data]`} flex={1} />
        </View>

        <View style={s.sectionBreak} />

        {/* Lines 8a/8b/8c */}
        <View style={s.row}>
          <F num="8a" label="Is this application for a limited liability company (LLC)?" value="Yes" flex={1} />
          <F num="8b" label="If 8a is YES, enter number of LLC members" value={data.memberCount} flex={1} />
          <F num="8c" label="If 8a is YES, was LLC organized in U.S.?" value={data.isForeignLLC ? 'No (foreign)' : 'Yes'} flex={1} />
        </View>

        {/* Line 9a */}
        <View style={s.row}>
          <F num="9a" label="Type of entity" value={data.entityType} flex={3} />
        </View>

        <View style={s.sectionBreak} />

        {/* Lines 10–11 */}
        <View style={s.row}>
          <F num="10" label="Reason for applying" value={data.reasonApplying} flex={2} />
          <F num="11" label="Date business started or acquired (Mo./Day/Yr.)" value={data.dateStarted} flex={1} />
        </View>

        {/* Lines 12, 15, 16 */}
        <View style={s.row}>
          <F num="12" label="Closing month of accounting year" value={data.closingMonth} flex={1} />
          <F num="15" label="First date wages or annuities were paid (Mo./Day/Yr.)" value={data.firstWagesDate ?? 'N/A'} flex={1} />
        </View>
        <View style={s.row}>
          <F num="16" label="Check one box that best describes the principal activity of your business" value={data.businessPurpose} flex={3} />
        </View>

        <View style={s.sectionBreak} />

        {/* Signature placeholder */}
        <View style={s.row}>
          <View style={[s.fieldBox, { flex: 3 }]}>
            <Text style={s.fieldNum}>Signature / Third Party Designee</Text>
            <Text style={s.fieldLabel}>
              Bridget signs as authorized third-party designee on behalf of applicant.
            </Text>
            <Text style={[s.fieldValue, { marginTop: 20 }]}>_________________________ Date: _________</Text>
          </View>
        </View>

        <Text style={s.footer}>
          Compass Registered Agent — SS-4 Draft — Internal Use Only — Do not share with client
        </Text>
      </Page>
    </Document>
  )
}

export async function generateSS4(data: SS4Data): Promise<Buffer> {
  const instance = pdf(<SS4Document data={data} />)
  const blob = await instance.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

