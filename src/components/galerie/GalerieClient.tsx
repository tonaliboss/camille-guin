'use client'

import type { UserRole, DepotSettings } from '@/types'
import AppLayout from '@/components/ui/AppLayout'
import HomeGalerie from '@/components/galerie/HomeGalerie'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function GalerieClient({ role, token, settings }: Props) {
  return (
    <AppLayout role={role} token={token}>
      <HomeGalerie role={role} token={token} settings={settings} />
    </AppLayout>
  )
}