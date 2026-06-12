'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'

interface Props {
  videoUrl: string
}

export default function VideoRecapSection({ videoUrl }: Props) {
  const [showPlayer, setShowPlayer] = useState(false)

  return (
    <>
      <section id="video" className="py-12 px-5 scroll-mt-28">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className={tokens.section.eyebrow}>Revivons l&apos;émotion en un instant</span>
          <div className="flex items-center gap-4 mt-2">
            <div className={tokens.section.divider} />
            <h2 className={tokens.section.title}>Vidéo récap&apos;</h2>
            <div className={tokens.section.divider} />
          </div>
        </div>

        <div
          className="relative rounded-[6px] overflow-hidden aspect-[21/9] shadow-card group cursor-pointer"
          onClick={() => setShowPlayer(true)}
        >
          <video src={videoUrl} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
              <Play strokeWidth={1} className="w-5 h-5 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      </section>

      {showPlayer && (
        <div className="fixed inset-0 z-[100] bg-black/5 backdrop-blur-sm flex items-center justify-center p-4">
          <button onClick={() => setShowPlayer(false)} className="absolute top-4 right-4 bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <video src={videoUrl} className="max-w-full max-h-full" controls autoPlay />
        </div>
      )}
    </>
  )
}