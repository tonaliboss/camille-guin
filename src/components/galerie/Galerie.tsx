'use client'

import { motion } from 'motion/react'
import { tokens } from '@/lib/design-tokens'
import type { UserRole, DepotSettings } from '@/types'
import { useRecapVideo } from '@/hooks/useRecapVideo'
import { hasFeature } from '@/lib/plan'
import PhotoSection from '@/components/galerie/PhotoSection'
import VideoRecapSection from '@/components/galerie/VideoRecapSection'
import LivreOrSection from '@/components/galerie/LivreOrSection'
import VoeuxAudioSection from '@/components/galerie/VoeuxAudioSection'
import Navigation from '@/components/galerie/Navigation'
import CamoriaFooter from '@/components/ui/CamoriaFooter'
import HeroBanner from '@/components/ui/HeroBanner'

interface Props {
  role: UserRole
  token: string
  settings: DepotSettings
}

export default function Galerie({ role, token, settings }: Props) {
  const { videoUrl, loading: videoLoading } = useRecapVideo()
  const showVideoRecap = hasFeature('videoRecap') && !videoLoading && videoUrl

  return (
    <div>
      <HeroBanner role={role} settings={settings} connexionPath={`/connexion?from=/galerie/${token}`}>
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
              className="banner-title text-[44px] italic font-bold leading-[1.05] mt-4 text-white"
            >
              {process.env.NEXT_PUBLIC_BRIDE_NAME}
              <div className="w-16 h-[1px] bg-white/50 mx-auto my-3" />
              <span className="text-white/90">{process.env.NEXT_PUBLIC_GROOM_NAME}</span>
            </motion.h1>
          </div>
        </div>
      </HeroBanner>

      <Navigation videoUrl={showVideoRecap ? videoUrl : null} />
      
      {showVideoRecap && <VideoRecapSection videoUrl={videoUrl} />}

      <PhotoSection role={role} settings={settings} />
      <LivreOrSection role={role} settings={settings} />
      <VoeuxAudioSection role={role} settings={settings} />

      <CamoriaFooter settings={settings} />
    </div>
  )
}