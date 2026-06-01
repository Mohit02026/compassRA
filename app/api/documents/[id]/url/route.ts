import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDownloadUrl } from '@/services/documents'

interface Context {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    const url = await getDownloadUrl(params.id, session.user.tenantId)
    return NextResponse.json({ data: { url } })
  } catch (err) {
    console.error('[GET /api/documents/[id]/url]', err)
    return NextResponse.json(
      { error: { code: 404, message: 'Document not found' } },
      { status: 404 }
    )
  }
}
