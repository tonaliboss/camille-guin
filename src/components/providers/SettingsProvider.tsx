'use client'

import { createContext, useContext } from 'react'
import type { DepotSettings, UserRole } from '@/types'

interface DepotContextValue {
  settings: DepotSettings
  role: UserRole
}

const DepotContext = createContext<DepotContextValue | null>(null)

export function SettingsProvider({ settings, role, children }: DepotContextValue & { children: React.ReactNode }) {
  return <DepotContext.Provider value={{ settings, role }}>{children}</DepotContext.Provider>
}

export function useSettings(): DepotSettings {
  const ctx = useContext(DepotContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx.settings
}

export function useRole(): UserRole {
  const ctx = useContext(DepotContext)
  if (!ctx) throw new Error('useRole must be used within SettingsProvider')
  return ctx.role
}