import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'true'
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.type === 'message') {
    const { error } = await supabaseAdmin
      .from('media_items')
      .insert({
        bucket_path: `ecrit/message-${Date.now()}`,
        type: 'message',
        folder: 'ecrit',
        hidden: false,
        metadata: body.metadata,
      })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { bucket_path, type, folder } = body
  const { error } = await supabaseAdmin
    .from('media_items')
    .insert({ bucket_path, type, folder, hidden: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id, hidden } = await request.json()
  const { error } = await supabaseAdmin
    .from('media_items')
    .update({ hidden })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}