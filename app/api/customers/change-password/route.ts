import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

// mustChangePwd flow (force-change): currentPassword not required
// Normal flow: currentPassword is always required
const schema = z.object({
  password: passwordSchema,
  currentPassword: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }
  if (session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: { code: 403, message: 'Forbidden' } }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 400, message: 'Invalid input' } }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.json({ error: { code: 404, message: 'User not found' } }, { status: 404 })
  }

  // Normal flow: currentPassword is required and must match.
  // mustChangePwd=true is the force-change flow — no current password needed.
  if (!user.mustChangePwd) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json(
        { error: { code: 400, message: 'Current password is required' } },
        { status: 400 }
      )
    }
    const valid = await compare(parsed.data.currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: { code: 400, message: 'Current password is incorrect' } },
        { status: 400 }
      )
    }
  }

  const passwordHash = await hash(parsed.data.password, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePwd: false },
  })

  return NextResponse.json({ data: { ok: true } })
}
