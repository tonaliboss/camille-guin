import type { DepotSettings } from '@/types'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

const SETTINGS_KEY = 'depot_settings'

export async function getSettings(): Promise<DepotSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .single()

  if (error || !data) {
    return {
      bannerType: 'image',
      bannerColor: '#747373',
      bannerImageUrl: null,
      themeColor: '#3C1F0F',
      titleColor: '#3C1F0F',
      buttonTextColor: '#ffffff',
      guestMessage: '',
      menuUrl: null,
      planningUrl: null,
      fontFamily: 'Lora',
    }
  }

  return data.value as DepotSettings
}

export async function updateSettings(patch: Partial<DepotSettings>): Promise<void> {
  const current = await getSettings()
  const updated = { ...current, ...patch }

  const { error } = await supabaseAdmin
    .from('settings')
    .update({ value: updated, updated_at: new Date().toISOString() })
    .eq('key', SETTINGS_KEY)

  if (error) throw error
}