'use client'

import { useRouter } from 'next/navigation'
import { Camera, PenLine, Mic, UtensilsCrossed, Heart, User } from 'lucide-react'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'
import logoBolt from '@/assets/images/logobolt.png'
import banniereBg from '@/assets/images/banniere.png'
import { useState, useEffect } from 'react'
import type { DepotSettings } from '@/types'
import { usePreviewMode } from '@/hooks/usePreviewMode';
import { toast } from 'sonner'
import { tokens } from '@/lib/design-tokens';
import type { UserRole } from '@/types';
import { motion } from 'motion/react';
import { cn } from '@/components/shadcn/utils';
import CamoriaFooter from '@/components/ui/CamoriaFooter'

interface Props {
  token: string
  settings: DepotSettings
  role: UserRole
}

function HomeDepot({ token, settings, role }: Props) {
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

  // Bannière selon le type choisi
  const bannerStyle = settings.bannerType === 'solid'
    ? { backgroundColor: settings.bannerColor }
    : undefined

  const bannerSrc = settings.bannerType === 'custom' && settings.bannerImageUrl
    ? settings.bannerImageUrl
    : settings.bannerType === 'image'
    ? banniereBg.src
    : null

  return (
    <div>
      <section className="relative h-[75vh] shrink-0">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Bannière" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={bannerStyle} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className={tokens.header.floating}>
          <div className="w-9" />
          <div className={tokens.header.logoPill}>
            <img src={logoBolt.src} alt="Logo" className="h-6 object-contain drop-shadow-lg" />
          </div>
          {role !== 'admin' ? (
            <button
              onClick={() => !isPreview && router.push(`/connexion?from=/depot/${token}`)}
              className={tokens.header.iconBtn}
              disabled={isPreview}
            >
              <User strokeWidth={1.5} className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <div className="relative h-full z-10 flex items-end justify-center pb-12">
          <div className="text-center text-white flex flex-col items-center">
            <p className={tokens.text.eyebrow}>Bienvenue au mariage de</p>
            <h1 className="font-['Lora'] italic font-bold text-[44px] leading-[1.05] mt-4">
              {process.env.NEXT_PUBLIC_BRIDE_NAME}
              <div className="w-16 h-[1px] bg-white/50 mx-auto my-3" />
              <span className="text-white/90">{process.env.NEXT_PUBLIC_GROOM_NAME}</span>
            </h1>
          </div>
        </div>
      </section>

      {settings.guestMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={cn(tokens.card.base, tokens.card.padding, 'mx-5 -mt-8 relative z-10')}
        >
          <p
            className={cn(tokens.text.body, 'italic text-center')}
            style={{ color: settings.titleColor + 'CC' }}
          >
            "{settings.guestMessage}"
          </p>
          <p
            className="text-center text-[10px] tracking-widest uppercase mt-3 opacity-60"
            style={{ color: settings.titleColor }}
          >
            {process.env.NEXT_PUBLIC_BRIDE_NAME} & {process.env.NEXT_PUBLIC_GROOM_NAME}
          </p>
        </motion.div>
      )}

      <main className="px-5 mt-4 space-y-4">
        {/* Photos & vidéos — full width */}
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

        {/* Livre d'or + Message vocal — 2 colonnes */}
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
            <h2 className="font-['Lora'] italic font-bold text-[18px] text-black mb-2 leading-tight">Livre d'or</h2>
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
            <h2 className="font-['Lora'] italic font-bold text-[18px] text-black mb-2 leading-tight">Message vocal</h2>
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

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className={cn(tokens.card.alt, tokens.card.padding, 'flex flex-col items-center text-center group')}
        >
          <div className={cn(tokens.icon.containerWhite, 'mb-5')}>
            <UtensilsCrossed strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <h2 className={cn(tokens.text.cardTitle, 'mb-3')}>Menu</h2>
          <p className={cn(tokens.text.body, 'mb-8')}>Découvrez le menu du mariage</p>
          <button
            className={tokens.btn.primary}
            style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
            onClick={() => menuUrl ? window.open(menuUrl, '_blank') : toast.warning('Aucun menu disponible pour le moment.')}
          >
            <span>Voir le menu</span>
          </button>
        </motion.div>

      </main>

      <CamoriaFooter />
    </div>
  )
}

export default HomeDepot