'use client'

import { useState } from 'react'
import type { UserRole, DepotSettings } from '@/types'
import AdminHeader from '@/components/ui/AdminHeader'
import PersonnaliserClient from '@/components/depot/PersonnaliserClient'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function PersonnaliserPage({ role, token, settings }: Props) {
  const [themeColor, setThemeColor] = useState(settings.themeColor)

  return (
    <div>
      <AdminHeader role={role} token={token} context="depot" themeColor={themeColor} />
      <PersonnaliserClient settings={settings} token={token} onThemeChange={setThemeColor} />
    </div>
  )
}