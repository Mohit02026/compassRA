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

  if (result.available === 'unknown') {
    return NextResponse.json(
      { error: { code: 503, message: 'Name search is temporarily unavailable. Please try again.' } },
      { status: 503 }
    )
  }

  const messages: Record<string, string> = {
    available: 'This name appears to be available in Florida.',
    taken: result.exactMatch?.status === 'Inactive'
      ? 'An inactive LLC with this name exists — you may still be able to register it.'
      : 'This name is already registered in Florida.',
    likely: 'Similar names exist but no exact match — this name is likely available.',
  }

  return NextResponse.json(
    {
      data: {
        available: result.available,
        matches: result.matches,
        exactMatch: result.exactMatch,
        message: messages[result.available] ?? '',
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300' } }
  )
}
