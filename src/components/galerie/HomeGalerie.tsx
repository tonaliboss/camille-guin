'use client'

import { User, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { motion } from 'motion/react'
import banniereBg from '@/assets/images/banniere.png'
import logoBolt from '@/assets/images/logobolt.png'
import type { UserRole, DepotSettings } from '@/types'
import GalerieSection from '@/components/galerie/GalerieSection'
import LivreOrSection from '@/components/galerie/LivreOrSection'
import VoeuxAudioSection from '@/components/galerie/VoeuxAudioSection'
import Navigation from '@/components/galerie/Navigation'
import CamoriaFooter from '@/components/ui/CamoriaFooter'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function HomeGalerie({ role, token, settings }: Props) {
  const router = useRouter()
  const { isPreview } = usePreviewMode()

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
              onClick={() => !isPreview && router.push(`/connexion?from=/galerie/${token}`)}
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
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={tokens.text.eyebrow}
            >
              Galerie du mariage de
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="italic font-bold text-[44px] leading-[1.05] mt-4"
            >
              {process.env.NEXT_PUBLIC_BRIDE_NAME}
              <div className="w-16 h-[1px] bg-white/50 mx-auto my-3" />
              <span className="text-white/90">{process.env.NEXT_PUBLIC_GROOM_NAME}</span>
            </motion.h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={() => document.getElementById('galerie')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 w-12 h-12 border-2 border-white/30 rounded-full flex items-center justify-center hover:border-white/60 transition-colors animate-bounce"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </section>

      <Navigation />

      <GalerieSection role={role} />
      <LivreOrSection role={role} />
      <VoeuxAudioSection role={role} />

      <CamoriaFooter />
    </div>
  )
}