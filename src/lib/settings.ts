import { createClient } from '@supabase/supabase-js'
import type { DepotSettings } from '@/types'

// Client avec service role pour l'écriture (côté serveur uniquement)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client public pour la lecture
import { supabase } from '@/lib/supabase'

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