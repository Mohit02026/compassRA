// SunBiz entity lookup via SunBiz Daily API.
// No auth required — public data.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { lookupByDocNumber } from '@/services/sunbiz'

const querySchema = z.object({
  docNumber: z.string().min(1).max(20),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ docNumber: searchParams.get('docNumber') })

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 400, message: 'docNumber query param required' } },
      { status: 400 }
    )
  }

  const entity = await lookupByDocNumber(parsed.data.docNumber)

  if (!entity) {
    return NextResponse.json(
      { error: { code: 404, message: 'Entity not found on SunBiz' } },
      { status: 404 }
    )
  }

  return NextResponse.json(
    { data: entity },
    { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' } }
  )
}
