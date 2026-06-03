'use client'

import { useRouter } from 'next/navigation'
import { Camera, PenLine, Mic, UtensilsCrossed, Heart } from 'lucide-react'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'
import logoBolt from '@/assets/images/logobolt.png'
import banniereBg from '@/assets/images/banniere.png'
import { useState, useEffect } from 'react'
import type { DepotSettings } from '@/types'
import { usePreviewMode } from '@/hooks/usePreviewMode';
import { toast } from 'sonner'

interface Props {
  token: string
  settings: DepotSettings
}

function HomeDepot({ token, settings }: Props) {
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
    <div className="min-h-screen magical-background overflow-y-auto">
      <header className="relative h-[300px]">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Bannière" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={bannerStyle} />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full z-10 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto py-4 px-4 flex flex-col justify-center h-full">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <img src={logoBolt.src} alt="Logo" className="h-12 md:h-20 object-contain drop-shadow-lg" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center mt-16">
              <div className="text-center">
                <div className="mb-2">
                  <span className="font-lora text-2xl md:text-4xl font-medium drop-shadow-lg text-white">Tiffany</span>
                </div>
                <div className="flex justify-center">
                  <Heart size={32} className="text-white fill-white drop-shadow-lg" />
                </div>
                <div className="mt-2">
                  <span className="font-lora text-2xl md:text-4xl font-medium drop-shadow-lg text-white">Valentin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {settings.guestMessage && (
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="relative">
            <span className="absolute -top-6 left-0 text-6xl opacity-20 font-serif">“</span>

            <p
              className="font-lora text-lg md:text-xl italic leading-relaxed"
              style={{ color: settings.titleColor }}
            >
              {settings.guestMessage}
            </p>

            <span className="absolute -bottom-10 right-0 text-6xl opacity-20 font-serif">”</span>
          </div>

          <div className="mt-6">
            <p
              className="font-lora text-sm tracking-widest uppercase opacity-70"
              style={{ color: settings.titleColor }}
            >
              Tiffany & Valentin
            </p>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        <section className="text-center">
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg md:text-2xl font-lora mb-3 font-bold" style={{ color: settings.titleColor }}>
              Galerie des mariés
            </h3>
            <p className="text-sm md:text-lg text-sage/80 mb-6">Partagez vos meilleures photos et vidéos du mariage</p>
            <button
              className="text-[11px] md:text-sm py-2 px-6 w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-sm shadow-md font-inter transition-all"
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
              onClick={() => 
                router.push(
                  isPreview
                    ? `/depot/${token}/photo?preview=1`
                    : `/depot/${token}/photo`
                )
              }
            >
              <Camera size={18} className="shrink-0" />
              <span>Photos et vidéos</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8 md:gap-12">
          <section className="text-center">
            <h3 className="text-lg md:text-2xl font-lora mb-3 font-bold" style={{ color: settings.titleColor }}>
              Livre d'or
            </h3>
            <p className="text-sm md:text-lg text-sage/80 mb-6">Envoyez un beau message aux mariés</p>
            <button
              className="text-[11px] md:text-sm py-2 px-6 w-full max-w-[160px] mx-auto flex items-center justify-center gap-2 rounded-sm shadow-md font-inter transition-all"
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
              onClick={() => 
                router.push(
                  isPreview
                    ? `/depot/${token}/livre-or?preview=1`
                    : `/depot/${token}/livre-or`
                )
              }
            >
              <PenLine size={18} className="shrink-0" />
              <span>Message écrit</span>
            </button>
          </section>

          <section className="text-center">
            <h3 className="text-lg md:text-2xl font-lora mb-3 font-bold" style={{ color: settings.titleColor }}>
              Message vocal
            </h3>
            <p className="text-sm md:text-lg text-sage/80 mb-6">Enregistrez vos vœux pour les mariés</p>
            <button
              className="text-[11px] md:text-sm py-2 px-6 w-full max-w-[160px] mx-auto flex items-center justify-center gap-2 rounded-sm shadow-md font-inter transition-all"
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
              onClick={() => 
                router.push(
                  isPreview
                    ? `/depot/${token}/message-vocal?preview=1`
                    : `/depot/${token}/message-vocal`
                )
              }
            >
              <Mic size={18} className="shrink-0" />
              <span>Message audio</span>
            </button>
          </section>
        </div>

        <div className="w-full h-px bg-sage/30" />

        <section className="text-center">
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg md:text-2xl font-lora mb-3 font-bold" style={{ color: settings.titleColor }}>
              Menu
            </h3>
            <p className="text-sm md:text-lg text-sage/80 mb-6">Découvrez le menu du mariage</p>
            <button
              className="text-[11px] md:text-sm py-2 px-6 w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-sm shadow-md font-inter transition-all"
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
              onClick={() => menuUrl ? window.open(menuUrl, '_blank') : toast.warning('Aucun menu disponible pour le moment.')}
            >
              <UtensilsCrossed size={18} className="shrink-0" />
              <span>Voir le menu</span>
            </button>
          </div>
        </section>

        <div className="w-full h-px bg-sage/30" />
      </main>

      <footer className="text-center py-6 font-inter text-sm md:text-base border-t border-beige/30" style={{ color: settings.titleColor + '99' }}>
        <p>Créé avec <Heart size={12} className="inline text-sage fill-sage" /> par CAMORIA MEMORIES</p>
      </footer>
    </div>
  )
}

export default HomeDepot