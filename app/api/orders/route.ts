import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@/lib/auth'
import { setPrismaContext } from '@/lib/prisma'
import { createOrder, listOrders } from '@/services/orders'
import { ServiceType, Tier, OrderStatus } from '@prisma/client'
import { z } from 'zod'

const createOrderSchema = z.object({
  // Customer
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),

  // Business
  businessName: z.string().min(1),
  serviceType: z.nativeEnum(ServiceType),
  tier: z.nativeEnum(Tier),
  state: z.string().default('FL'),
  principalAddress: z.string().optional(),
  mailingAddress: z.string().optional(),

  // Organizer
  organizerName: z.string().optional(),
  organizerEmail: z.string().email().optional(),
  organizerPhone: z.string().optional(),

  // Filing details
  dueDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  serviceFee: z.number().min(0),
  stateFee: z.number().min(0),
  paymentRef: z.string().optional(),
  internalNotes: z.string().optional(),

  // Add-ons
  addOnEin: z.boolean().optional(),
  addOnOperatingAgreement: z.boolean().optional(),
  addOnCertificateOfStatus: z.boolean().optional(),

  // LLC Formation extras
  managementType: z.string().optional(),
  effectiveDate: z.string().optional(),
  members: z.array(z.object({ name: z.string(), ownershipPct: z.string() })).optional(),

  // Annual report extras
  flDocNumber: z.string().optional(),

  // EIN fields
  einMemberCount: z.string().optional(),
  einResponsibleParty: z.string().optional(),
  einTaxIdType: z.enum(['ssn', 'itin']).optional(),
  einTaxId: z.string().optional(),
  einBusinessPurpose: z.string().max(50).optional(),
  einDateStarted: z.string().optional(),
  einReasonApplying: z.string().optional(),
  einIsUSCitizen: z.boolean().optional(),
  einCounty: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid input', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  try {
    const result = await createOrder({
      ...parsed.data,
      tenantId: session.user.tenantId,
      actorId: session.user.id,
    })
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    Sentry.captureException(err)
    return NextResponse.json(
      { error: { code: 500, message: 'Failed to create order' } },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'OPS' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  await setPrismaContext(session.user.tenantId)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as OrderStatus | null
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const result = await listOrders(session.user.tenantId, {
    status: status ?? undefined,
    cursor,
    limit,
  })

  return NextResponse.json({ data: result })
}
