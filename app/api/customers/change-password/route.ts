import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  password: z.string().min(8),
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

  const passwordHash = await hash(parsed.data.password, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePwd: false },
  })

  return NextResponse.json({ data: { ok: true } })
}
