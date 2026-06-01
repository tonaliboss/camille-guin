'use client'

import type { UserRole } from '@/types'
import AdminBanner from '@/components/ui/AdminBanner'
import HomeDepot from '@/components/depot/HomeDepot'

interface Props {
  role: UserRole
  token: string
}

export default function DepotClient({ role, token }: Props) {
  return (
    <div>
      {role === 'admin' && <AdminBanner />}
      <HomeDepot token={token} />
    </div>
  )
}