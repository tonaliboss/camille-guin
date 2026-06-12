'use client'

import { useEffect, useState } from 'react'
import { Download, X, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem, UserRole, DepotSettings } from '@/types'
import { getGalerieMedia, toggleMediaVisibility } from '@/lib/media'
import { downloadAllAsZip, downloadFile } from '@/lib/download'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  role: UserRole
  settings: DepotSettings
}

export default function PhotoSection({ role, settings }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [hiddenMedia, setHiddenMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const [lightboxList, setLightboxList] = useState<'public' | 'hidden'>('public')
  const currentList = lightboxList === 'public' ? media : hiddenMedia

  const INITIAL_PHOTOS = 6
  const [showAllMedia, setShowAllMedia] = useState(false)
  const [showAllHidden, setShowAllHidden] = useState(false)

  const loadMedia = async () => {
    setLoading(true)
    const [pub, hidden] = await Promise.all([
      getGalerieMedia(false),
      role === 'admin' ? getGalerieMedia(true) : Promise.resolve([]),
    ])
    setMedia(pub)
    setHiddenMedia(hidden)
    setLoading(false)
  }

  useEffect(() => { loadMedia() }, [role])

  const hideMedia = async (item: MediaItem) => {
    await toggleMediaVisibility(item.id, true)
    loadMedia()
  }

  const unhideMedia = async (item: MediaItem) => {
    await toggleMediaVisibility(item.id, false)
    loadMedia()
  }

  const downloadAllMedia = async (items: MediaItem[], folderName: string, zipName: string) => {
    if (!items.length || downloading) return
    setDownloading(true)
    setDownloadProgress(0)
    try {
      await downloadAllAsZip(items, folderName, zipName, setDownloadProgress)
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  if (loading) return (
    <section id="galerie" className="py-20 px-5">
      <p className={cn(tokens.text.body, 'text-center')}>Chargement...</p>
    </section>
  )

  return (
    <>
      <section id="galerie" className="py-12 px-5 scroll-mt-28">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className={tokens.section.eyebrow}>Nos plus beaux souvenirs</span>
          <div className="flex items-center gap-4 mt-2">
            <div className={tokens.section.divider} />
            <h2 className={tokens.section.title}>Galerie digitale</h2>
            <div className={tokens.section.divider} />
          </div>
          {media.length > 0 && (
            <p className="text-[11px] text-stone-400 mt-2">{media.length} élément{media.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {role === 'admin' && media.length > 0 && (
          <div className="flex flex-col items-center gap-2 mb-6">
            <button
              onClick={() => downloadAllMedia(media, 'galerie', 'galerie.zip')}
              disabled={downloading}
              className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
              title={downloading ? 'Téléchargement en cours...' : 'Télécharger toute la galerie'}
            >
              <Download className="w-6 h-6 text-stone-300" />
            </button>
            {downloading && (
              <div className="w-48">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                </div>
                <p className="text-xs text-stone-400 text-center mt-1">{Math.round(downloadProgress)}%</p>
              </div>
            )}
          </div>
        )}

        {media.length === 0 ? (
          <p className={cn(tokens.text.body, 'text-center')}>Aucune photo ou vidéo disponible</p>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {media.slice(0, showAllMedia ? undefined : INITIAL_PHOTOS).map((item, index) => (
              <div
                key={item.id}
                className="break-inside-avoid rounded-[6px] overflow-hidden group relative cursor-pointer bg-stone-100"
                onClick={() => { setLightboxList('public'); setLightboxIndex(index) }}
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt="" className="w-full hover:scale-105 transition-transform duration-700" />
                ) : (
                  <video src={item.url} className="w-full" controls />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              </div>
            ))}
          </div>
        )}
        {media.length > INITIAL_PHOTOS && (
          <button
            onClick={() => setShowAllMedia(!showAllMedia)}
            className={cn(tokens.btn.outline, 'mt-4')}
            style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
          >
            {showAllMedia ? 'Voir moins' : `Voir tout (+${media.length - INITIAL_PHOTOS})`}
          </button>
        )}

        {role === 'admin' && hiddenMedia.length > 0 && (
          <div className="mt-12 pt-8 border-t border-stone-100">
            <div className="text-center mb-8 flex flex-col items-center">
              <span className={tokens.section.eyebrow}>Contenu masqué</span>
              <div className="flex items-center gap-4 mt-2">
                <div className={tokens.section.divider} />
                <h2 className={tokens.section.title}>Galerie masquée</h2>
                <div className={tokens.section.divider} />
              </div>
              {hiddenMedia.length > 0 && (
                <p className="text-[11px] text-stone-400 mt-2">{hiddenMedia.length} élément{hiddenMedia.length > 1 ? 's' : ''}</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 mb-6">
              <button
                onClick={() => downloadAllMedia(hiddenMedia, 'galerie-masquee', 'galerie-masquee.zip')}
                disabled={downloading}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
                title={downloading ? 'Téléchargement en cours...' : 'Télécharger la galerie masquée'}
              >
                <Download className="w-6 h-6 text-stone-300" />
              </button>
              {downloading && (
                <div className="w-48">
                  <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-400 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 text-center mt-1">{Math.round(downloadProgress)}%</p>
                </div>
              )}
            </div>

            <div className="columns-2 gap-3 space-y-3">
              {hiddenMedia.slice(0, showAllHidden ? undefined : INITIAL_PHOTOS).map((item, index) => (
                <div
                  key={item.id}
                  className="break-inside-avoid rounded-[6px] overflow-hidden group relative cursor-pointer bg-stone-100"
                  onClick={() => { setLightboxList('hidden'); setLightboxIndex(index) }}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt="" className="w-full" />
                  ) : (
                    <video src={item.url} className="w-full" controls />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {hiddenMedia.length > INITIAL_PHOTOS && (
          <button
            onClick={() => setShowAllHidden(!showAllHidden)}
            className={cn(tokens.btn.outline, 'mt-4')}
            style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
          >
            {showAllHidden ? 'Voir moins' : `Voir tout (+${hiddenMedia.length - INITIAL_PHOTOS})`}
          </button>
        )}
      </section>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/5 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <button onClick={() => setLightboxIndex(null)} className="bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button onClick={() => downloadFile(currentList[lightboxIndex].url, currentList[lightboxIndex].name)} className="bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              {role === 'admin' && (
                lightboxList === 'public' ? (
                  <button
                    onClick={() => { hideMedia(currentList[lightboxIndex]); setLightboxIndex(null) }}
                    className="bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { unhideMedia(currentList[lightboxIndex]); setLightboxIndex(null) }}
                    className="bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>

          {currentList[lightboxIndex].type === 'image' ? (
            <img src={currentList[lightboxIndex].url} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <video src={currentList[lightboxIndex].url} className="max-w-full max-h-full" controls autoPlay />
          )}

          <button
            onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : currentList.length - 1)) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev! < currentList.length - 1 ? prev! + 1 : 0)) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 p-2.5 rounded-full text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  )
}