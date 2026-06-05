#!/usr/bin/env node
// Test GHL push with mock order data — no database required.
// Verifies contact creation, opportunity creation, and note creation
// against the real GHL API using your test credentials from .env.local.
//
// Usage: node scripts/test-ghl-push.js
// To clean up: delete the test contact/opportunity from GHL after verifying.

require('dotenv').config({ path: '.env.local' })

const GHL_BASE    = 'https://services.leadconnectorhq.com'
const API_KEY     = process.env.GHL_API_KEY
const LOCATION_ID = process.env.GHL_LOCATION_ID
const PIPELINE_ID = process.env.GHL_PIPELINE_ID
const USER_ID     = process.env.GHL_USER_ID   // set once from GHL → Settings → My Profile
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// GHL_STAGE_MAP: {"INTAKE":"stageId",...}
function getStageId(status) {
  try {
    const map = JSON.parse(process.env.GHL_STAGE_MAP ?? '{}')
    return map[status] ?? null
  } catch { return null }
}

if (!API_KEY || !LOCATION_ID || !PIPELINE_ID) {
  console.error('Missing GHL_API_KEY, GHL_LOCATION_ID, or GHL_PIPELINE_ID in .env.local')
  process.exit(1)
}

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
}

async function ghlFetch(path, options = {}) {
  const url = `${GHL_BASE}${path}`
  const res = await fetch(url, { ...options, headers: { ...HEADERS, ...(options.headers ?? {}) } })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, ok: res.ok, data }
}

// ── Mock order data ────────────────────────────────────────────────────────────
// Simulates a standard LLC Formation + EIN order.

const MOCK = {
  shortId:      'TEST0001',
  orderId:      'cm_test_mock_order_id_001',
  serviceLabel: 'LLC Formation',
  tierLabel:    'Standard',
  businessName: 'TEST Ventures LLC',
  state:        'FL',
  principalAddress: '123 Main St, Miami, FL 33101',
  mailingAddress:   '123 Main St, Miami, FL 33101',
  managementType:   'member-managed',
  members: [
    { name: 'Jane Smith', ownershipPct: '60' },
    { name: 'John Doe',   ownershipPct: '40' },
  ],
  effectiveDate: '2026-06-05',
  organizerName:  'Jane Smith',
  organizerEmail: 'jane.test@example.com',
  organizerPhone: '+15551234567',
  addOns: ['EIN'],
  serviceFee: '125.00',
  stateFee:   '138.75',
  totalAmount: 263.75,
  einResponsibleParty: 'Jane Smith',
  einTaxIdType:        'ssn',
  einBusinessPurpose:  'Retail sale of clothing',
  einDateStarted:      '2026-06-01',
  einReasonApplying:   'new-business',
  einIsUSCitizen:      'true',
  einMemberCount:      '2',
  einCounty:           'Miami-Dade',
  compassPortalUrl: `${APP_URL}/ops/orders/cm_test_mock_order_id_001`,
}

// Customer for GHL contact
const MOCK_CUSTOMER = {
  firstName: 'Jane',
  lastName:  'Smith',
  email:     'jane.compasstest@example.com',   // use a unique test email
  phone:     '+15551234567',
}

// ── Note builder (mirrors services/ghl.ts buildOrderNote) ───────────────────

function buildNote(d) {
  const lines = []
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`COMPASS ORDER — ${d.serviceLabel}`)
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`Ref:   #${d.shortId}`)
  lines.push(`Tier:  ${d.tierLabel}`)
  lines.push('')
  lines.push('BUSINESS')
  lines.push(`  Name:    ${d.businessName}`)
  lines.push(`  State:   ${d.state}`)
  lines.push(`  Mgmt:    ${d.managementType}`)
  lines.push(`  Effective: ${d.effectiveDate}`)
  lines.push('  Members:')
  for (const m of d.members) lines.push(`    • ${m.name} — ${m.ownershipPct}%`)
  lines.push('')
  lines.push('ORGANIZER')
  lines.push(`  Name:  ${d.organizerName}`)
  lines.push(`  Email: ${d.organizerEmail}`)
  lines.push(`  Phone: ${d.organizerPhone}`)
  lines.push('')
  lines.push('ADDRESS')
  lines.push(`  Principal: ${d.principalAddress}`)
  lines.push('')
  lines.push('PAYMENT')
  lines.push(`  Service fee:    $${d.serviceFee}`)
  lines.push(`  State fee:      $${d.stateFee}`)
  for (const a of d.addOns) lines.push(`  ${a} add-on:    included`)
  lines.push(`  TOTAL:          $${d.totalAmount.toFixed(2)}`)
  lines.push('')
  lines.push(`ADD-ONS: ${d.addOns.join(', ')}`)
  lines.push('')
  lines.push('EIN DETAILS')
  lines.push(`  Responsible party: ${d.einResponsibleParty}`)
  lines.push(`  Tax ID type: ${d.einTaxIdType.toUpperCase()} (value encrypted — see Compass)`)
  lines.push(`  Member count: ${d.einMemberCount}`)
  lines.push(`  Business purpose: ${d.einBusinessPurpose}`)
  lines.push(`  Date started: ${d.einDateStarted}`)
  lines.push(`  County: ${d.einCounty}`)
  lines.push('')
  lines.push('COMPASS PORTAL')
  lines.push(`  ${d.compassPortalUrl}`)
  if (d.filingSheetUrl) {
    lines.push('')
    lines.push('FILING SHEET PDF')
    lines.push(`  ${d.filingSheetUrl}`)
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  return lines.join('\n')
}

// ── Run ────────────────────────────────────────────────────────────────────────

// Minimal valid PDF — one empty page, no content. Used only for the upload test.
function makeMinimalPDF(label) {
  const now = new Date().toISOString()
  const content = `Compass Test Filing Sheet\nOrder: ${label}\nGenerated: ${now}`
  // A real PDF structure — simple but parseable by GHL
  const body = [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`,
    `4 0 obj<</Length ${content.length + 30}>>stream\nBT /F1 12 Tf 72 700 Td (${content}) Tj ET\nendstream\nendobj`,
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000400 00000 n \n',
    `trailer<</Size 6/Root 1 0 R>>\nstartxref\n460\n%%EOF`,
  ].join('\n')
  return Buffer.from(body, 'ascii')
}

async function run() {
  console.log('\n🧪 GHL Push Test — Mock LLC Formation + EIN Order\n')
  console.log(`   Location:  ${LOCATION_ID}`)
  console.log(`   Pipeline:  ${PIPELINE_ID}`)
  console.log(`   User ID:   ${USER_ID ?? '⚠️  GHL_USER_ID not set — notes will be skipped'}`)
  console.log(`   API key:   ${API_KEY.slice(0, 12)}...`)
  console.log('')

  const userId = USER_ID ?? null

  // ── Step 2: Create contact ───────────────────────────────────────────────────
  console.log('\n2. Creating GHL contact...')
  const contactBody = {
    firstName: MOCK_CUSTOMER.firstName,
    lastName:  MOCK_CUSTOMER.lastName,
    email:     MOCK_CUSTOMER.email,
    phone:     MOCK_CUSTOMER.phone,
    locationId: LOCATION_ID,
    tags: ['compass-client', 'llc-formation', 'standard', 'has-addons', 'fl', 'COMPASS-TEST'],
  }
  console.log('   Payload:', JSON.stringify(contactBody, null, 2).split('\n').map(l => '   ' + l).join('\n').slice(3))

  const contactRes = await ghlFetch('/contacts/', { method: 'POST', body: JSON.stringify(contactBody) })
  if (!contactRes.ok) {
    console.log(`   ❌ Failed (${contactRes.status}):`, JSON.stringify(contactRes.data))
    process.exit(1)
  }
  const contactId = contactRes.data?.contact?.id
  console.log(`   ✅ Contact created — ID: ${contactId}`)

  // ── Step 3: Create opportunity ───────────────────────────────────────────────
  console.log('\n3. Creating GHL opportunity...')
  const intakeStageId = getStageId('INTAKE')
  if (!intakeStageId) {
    console.log('   ❌ GHL_STAGE_MAP missing INTAKE entry')
    process.exit(1)
  }

  const addOnSuffix = MOCK.addOns.length > 0 ? ` + ${MOCK.addOns.join(', ')}` : ''
  const oppName = `${MOCK.businessName} — ${MOCK.serviceLabel}${addOnSuffix} [${MOCK.tierLabel}] · #${MOCK.shortId}`
  const oppBody = {
    name:             oppName,
    pipelineId:       PIPELINE_ID,
    pipelineStageId:  intakeStageId,
    contactId,
    locationId:       LOCATION_ID,
    status:           'open',
    monetaryValue:    MOCK.totalAmount,
  }
  console.log('   Payload:', JSON.stringify(oppBody, null, 2).split('\n').map(l => '   ' + l).join('\n').slice(3))

  const oppRes = await ghlFetch('/opportunities/', { method: 'POST', body: JSON.stringify(oppBody) })
  if (!oppRes.ok) {
    console.log(`   ❌ Failed (${oppRes.status}):`, JSON.stringify(oppRes.data))
    process.exit(1)
  }
  const opportunityId = oppRes.data?.opportunity?.id
  console.log(`   ✅ Opportunity created — ID: ${opportunityId}`)
  console.log(`   Name: "${oppName}"`)

  // ── Step 4: Upload filing sheet PDF to GHL media ────────────────────────────
  console.log('\n4. Uploading test filing sheet PDF to GHL media library...')
  let filingSheetUrl = null
  try {
    const testPdf = makeMinimalPDF(MOCK.shortId)
    const form = new FormData()
    form.append('file', new Blob([testPdf], { type: 'application/pdf' }), `filing-sheet-${MOCK.shortId}.pdf`)
    form.append('fileName', `filing-sheet-${MOCK.shortId}.pdf`)

    const uploadRes = await fetch(`${GHL_BASE}/medias/upload-file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Version: '2021-07-28',
        'Location-Id': LOCATION_ID,
        // DO NOT set Content-Type — fetch sets it with boundary automatically
      },
      body: form,
    })

    const uploadText = await uploadRes.text()
    let uploadData
    try { uploadData = JSON.parse(uploadText) } catch { uploadData = uploadText }

    if (!uploadRes.ok) {
      console.log(`   ❌ Failed (${uploadRes.status}):`, JSON.stringify(uploadData))
      console.log('   PDF upload failed — check if PIT token has media scope.')
    } else {
      filingSheetUrl = uploadData?.url ?? uploadData?.fileUrl ?? uploadData?.data ?? JSON.stringify(uploadData)
      console.log(`   ✅ PDF uploaded`)
      console.log(`   URL: ${filingSheetUrl}`)
      console.log(`   Full response: ${JSON.stringify(uploadData)}`)
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`)
  }

  // ── Step 5: Add note ─────────────────────────────────────────────────────────
  console.log('\n5. Adding note to contact...')
  if (!userId) {
    console.log('   ⚠️  Skipped — GHL_USER_ID not set in .env.local')
    console.log('   To enable notes: GHL → Settings → My Profile → copy ID from URL → add to .env.local as GHL_USER_ID')
  } else {
    const mockWithUrl = { ...MOCK, compassPortalUrl: MOCK.compassPortalUrl, filingSheetUrl }
    const noteBody = buildNote(mockWithUrl)
    console.log('   Note preview (first 8 lines):')
    noteBody.split('\n').slice(0, 8).forEach(l => console.log('     ' + l))
    console.log('   ...')

    const noteRes = await ghlFetch(`/contacts/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ userId, body: noteBody }),
    })
    if (!noteRes.ok) {
      console.log(`   ❌ Failed (${noteRes.status}):`, JSON.stringify(noteRes.data))
    } else {
      console.log(`   ✅ Note created — ID: ${noteRes.data?.note?.id ?? 'unknown'}`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Test complete — check GHL pipeline')
  console.log(`   Contact ID:     ${contactId}`)
  console.log(`   Opportunity ID: ${opportunityId}`)
  console.log(`   Pipeline stage: New Order (INTAKE)`)
  console.log(`   Filing sheet:   ${filingSheetUrl ?? '(upload failed or skipped)'}`)
  console.log('')
  console.log('   When done, delete the test contact from GHL:')
  console.log(`   GHL → Contacts → search "jane.compasstest@example.com" → delete`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

run().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message)
  process.exit(1)
})
