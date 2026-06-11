import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSettings, updateSettings } from '@/lib/settings'

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'true'
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const patch = await request.json()
  await updateSettings(patch)
  return NextResponse.json({ success: true })
}