import { cookies } from 'next/headers'
import type { UserRole } from '@/types'

export async function getRole(): Promise<UserRole> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === 'true' ? 'admin' : 'guest'
}