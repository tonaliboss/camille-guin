'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import type { DepotSettings } from '@/types'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { saveSettings } from '@/lib/tableau-de-bord'
import DatesBadge from '@/components/ui/DatesBadge'
import LogoPill from '@/components/ui/LogoPill'
import CamoriaFooter from '@/components/ui/CamoriaFooter'
import DepotSection from '@/components/tableau-de-bord/DepotSection'
import GalerieSection from '@/components/tableau-de-bord/GalerieSection'
import PersonnalisationSection from '@/components/tableau-de-bord/PersonnalisationSection'
import LogoutSection from '@/components/tableau-de-bord/LogoutSection'

interface Props {
  settings: DepotSettings
}

export default function TableauDeBord({ settings }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [origin, setOrigin] = useState('')
  const depotUrl = `${origin}/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`
  const galerieUrl = `${origin}/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`
  const [previewKey, setPreviewKey] = useState(0)

  const dashboardFooterSettings: DepotSettings = {
    ...settings,
    footerColor: '#F0F0F0',
    themeColor: '#525252',
    buttonTextColor: '#ffffff',
  }

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const handleSave = async (patch: Partial<DepotSettings>) => {
    setSaving(true)
    try {
      await saveSettings(patch)
      setPreviewKey(prev => prev + 1)
      router.refresh()
      toast.success('Modifications enregistrées !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-8 dashboard-fixed-font">
      <header className="pt-8 pb-8 px-5 bg-[#FAFAFA] flex flex-col items-center gap-6">
        <LogoPill variant="black" />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(tokens.text.title, 'text-[36px] text-center font-lora-italic')}
        >
          Tableau <br /><span className="font-lora-italic" style={{ color: '#4a5443' }}>de bord</span>
        </motion.h1>
      </header>

      <div className="px-5 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <DatesBadge />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <DepotSection depotUrl={depotUrl} settings={settings} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <GalerieSection galerieUrl={galerieUrl} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <PersonnalisationSection settings={settings} onSave={handleSave} saving={saving} previewKey={previewKey} />
        </motion.div>

        <div className="[&>footer]:px-0 [&>footer]:py-0 [&>footer]:mt-0">
          <CamoriaFooter settings={dashboardFooterSettings} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <LogoutSection />
        </motion.div>        
      </div>
    </div>
  )
}