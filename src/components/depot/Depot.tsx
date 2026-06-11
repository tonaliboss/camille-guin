'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, PenLine, Mic, UtensilsCrossed, FileText, Calendar } from 'lucide-react'
import { motion } from 'motion/react';
import type { DepotSettings, UserRole } from '@/types'
import { usePreviewMode } from '@/hooks/usePreviewMode';
import { WEDDING_DATE, formatDate } from '@/lib/dates'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'
import { tokens } from '@/lib/design-tokens';
import { cn } from '@/components/shadcn/utils';
import HeroBanner from '@/components/ui/HeroBanner'
import CamoriaFooter from '@/components/ui/CamoriaFooter'

interface Props {
  token: string
  settings: DepotSettings
  role: UserRole
}

export default function Depot({ token, settings, role }: Props) {
  const router = useRouter()
  const [menuUrl, setMenuUrl] = useState<string | null>(null)
  const { isPreview } = usePreviewMode()

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data: files, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(FOLDERS.PLANNING)
        if (error) { console.error('Error fetching menu files:', error); return }
        if (files && files.length > 0) {
          const latestFile = files
            .filter(file => file.name.toLowerCase().endsWith('.pdf'))
            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0]
          if (latestFile) {
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${FOLDERS.PLANNING}/${latestFile.name}`)
            setMenuUrl(data.publicUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
      }
    }
    fetchMenu()
  }, [])

  return (
    <div>
      <HeroBanner role={role} settings={settings} connexionPath={`/connexion?from=/depot/${token}`}>
        <div className="relative h-full z-10 flex items-end justify-center pb-12">
          <div className="text-center text-white flex flex-col items-center">
            <p className={tokens.text.eyebrow}>Bienvenue au mariage de</p>
            <h1 className="italic font-bold text-[44px] leading-[1.05] mt-4">
              {process.env.NEXT_PUBLIC_BRIDE_NAME}
              <div className="w-16 h-[1px] bg-white/50 mx-auto my-3" />
              <span className="text-white/90">{process.env.NEXT_PUBLIC_GROOM_NAME}</span>
            </h1>
          </div>
        </div>
      </HeroBanner>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={cn(tokens.card.base, tokens.card.padding, 'mx-5 -mt-8 relative z-10')}
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar strokeWidth={1.5} className="w-6 h-6 text-black" />
          <span className=" italic font-bold text-[22px] text-black">
            {formatDate(WEDDING_DATE)}
          </span>
        </div>

        {settings.guestMessage && (
          <>
            <p
              className={cn(tokens.text.body, 'italic')}
              style={{ color: settings.titleColor + 'CC' }}
            >
              "{settings.guestMessage}"
            </p>
            <p
              className={cn(tokens.text.label, 'text-[10px] mt-3 opacity-60')}
              style={{ color: settings.titleColor }}
            >
              {process.env.NEXT_PUBLIC_BRIDE_NAME} & {process.env.NEXT_PUBLIC_GROOM_NAME}
            </p>
          </>
        )}
      </motion.div>

      <main className="px-5 mt-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={cn(tokens.card.base, tokens.card.padding, 'flex flex-col items-center text-center group')}
        >
          <div className={cn(tokens.icon.container, 'mb-5')}>
            <Camera strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <h2 className={cn(tokens.text.cardTitle, 'mb-3')}>Galerie des mariés</h2>
          <p className={cn(tokens.text.body, 'mb-8')}>Partagez vos meilleures photos et vidéos du mariage</p>
          <button
            className={tokens.btn.primary}
            style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
            onClick={() => router.push(isPreview ? `/depot/${token}/photo?preview=1` : `/depot/${token}/photo`)}
          >
            <span>Photos et vidéos</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className={cn(tokens.card.sm, 'flex flex-col items-center text-center group')}
          >
            <div className={cn(tokens.icon.container, 'mb-4')}>
              <PenLine strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <h2 className="italic font-bold text-[18px] text-black mb-2 leading-tight">Livre d'or</h2>
            <p className={cn(tokens.text.body, 'mb-6 flex-1 text-[12px]')}>Envoyez un beau message aux mariés</p>
            <button
              className={tokens.btn.outline}
              style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
              onClick={() => router.push(isPreview ? `/depot/${token}/livre-or?preview=1` : `/depot/${token}/livre-or`)}
            >
              <span>Message écrit</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className={cn(tokens.card.sm, 'flex flex-col items-center text-center group')}
          >
            <div className={cn(tokens.icon.container, 'mb-4')}>
              <Mic strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <h2 className="italic font-bold text-[18px] text-black mb-2 leading-tight">Message vocal</h2>
            <p className={cn(tokens.text.body, 'mb-6 flex-1 text-[12px]')}>Enregistrez vos vœux pour les mariés</p>
            <button
              className={tokens.btn.outline}
              style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
              onClick={() => router.push(isPreview ? `/depot/${token}/message-vocal?preview=1` : `/depot/${token}/message-vocal`)}
            >
              <span>Message audio</span>
            </button>
          </motion.div>
        </div>

        {(settings.menuUrl || settings.planningUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className={cn(tokens.card.alt, tokens.card.padding, 'flex flex-col items-center text-center group')}
          >
            <div className={cn(tokens.icon.containerWhite, 'mb-5')}>
              <FileText strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <h2 className={cn(tokens.text.cardTitle, 'mb-3')}>Documents</h2>
            <p className={cn(tokens.text.body, 'mb-6')}>Consultez les documents de l'événement.</p>
            <div className="flex flex-col w-full gap-2">
              {settings.menuUrl && (
                <button
                  className={tokens.btn.primary}
                  style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
                  onClick={() => window.open(settings.menuUrl!, '_blank')}
                >
                  <UtensilsCrossed size={18} className="shrink-0" />
                  <span>Voir le menu</span>
                </button>
              )}
              {settings.planningUrl && (
                <button
                  className={tokens.btn.secondary}
                  onClick={() => window.open(settings.planningUrl!, '_blank')}
                >
                  <FileText size={18} className="shrink-0" />
                  <span>Voir le programme</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

      </main>

      <CamoriaFooter />
    </div>
  )
}