'use client'

import type { UserRole, DepotSettings } from '@/types'
import AdminHeader from '@/components/ui/AdminHeader'
import HomeDepot from '@/components/depot/HomeDepot'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import AppLayout from '@/components/ui/AppLayout'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function DepotClient({ role, token, settings }: Props) {
  const { isPreview } = usePreviewMode()

  return (
  <AppLayout role={role} token={token}>
      <HomeDepot role={role} token={token} settings={settings} />
    </AppLayout>
  )
}