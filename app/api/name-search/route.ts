import { NextRequest, NextResponse } from 'next/server'
import { searchName } from '@/services/nameSearch'
import { z } from 'zod'

const querySchema = z.object({
  name: z.string().min(1).max(200),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ name: searchParams.get('name') ?? '' })

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'Missing or invalid name parameter' } },
      { status: 400 }
    )
  }

  const result = await searchName(parsed.data.name)
  return NextResponse.json({ data: result })
}
