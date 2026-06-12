import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 semaine

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  if (code !== process.env.ADMIN_CODE) {
    return NextResponse.json(
      { error: 'Code incorrect' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}