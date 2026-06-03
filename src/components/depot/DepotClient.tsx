'use client'

import type { UserRole, DepotSettings } from '@/types'
import AdminHeader from '@/components/ui/AdminHeader'
import HomeDepot from '@/components/depot/HomeDepot'
import { usePreviewMode } from '@/hooks/usePreviewMode'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function DepotClient({ role, token, settings }: Props) {
  const { isPreview } = usePreviewMode()

  return (
    <div>
      {!isPreview && <AdminHeader role={role} token={token} context="depot" themeColor={settings.themeColor} />}
      <HomeDepot token={token} settings={settings} />
    </div>
  )
}