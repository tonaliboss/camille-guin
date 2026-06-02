'use client'

import { useEffect, useState } from 'react'
import { Download, X, EyeOff, Eye } from 'lucide-react'
import JSZip from 'jszip'
import { getGalerieMedia, toggleMediaVisibility } from '@/lib/media'
import type { MediaItem, UserRole } from '@/types'

interface Props {
  role: UserRole
}

export default function GalerieSection({ role }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [hiddenMedia, setHiddenMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const loadMedia = async () => {
    setLoading(true)
    const [pub, hidden] = await Promise.all([
      getGalerieMedia(false),
      role === 'admin' ? getGalerieMedia(true) : Promise.resolve([]),
    ])
    console.log('pub', pub)
    console.log('hidden', hidden)
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

  const downloadMedia = async (item: MediaItem) => {
    const response = await fetch(item.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadAllMedia = async () => {
    if (!media.length || downloading) return
    setDownloading(true)
    setDownloadProgress(0)
    try {
      const zip = new JSZip()
      const folder = zip.folder('galerie')
      for (let i = 0; i < media.length; i++) {
        const response = await fetch(media[i].url)
        const blob = await response.blob()
        folder?.file(media[i].name, blob)
        setDownloadProgress(((i + 1) / media.length) * 90)
        await new Promise(r => setTimeout(r, 10))
      }
      setDownloadProgress(95)
      const content = await zip.generateAsync({ type: 'blob' })
      setDownloadProgress(100)
      const url = window.URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'galerie.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  if (loading) return (
    <section id="galerie" className="py-20 px-4 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="font-sans text-3xl text-stone-800 mb-12 uppercase tracking-wider">Galerie</h2>
        <p className="text-stone-500">Chargement...</p>
      </div>
    </section>
  )

  return (
    <>
      <section id="galerie" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="font-sans text-3xl text-center text-stone-800 uppercase tracking-wider mb-1">Galerie</h2>
            {role === 'admin' && media.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={downloadAllMedia}
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
          </div>

          {media.length === 0 ? (
            <p className="text-center text-stone-500">Aucune photo ou vidéo disponible</p>
          ) : (
            <div className="columns-2 md:columns-4 gap-4 space-y-4">
              {media.map((item, index) => (
                <div
                  key={item.id}
                  className="break-inside-avoid group relative cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  {role === 'admin' && (
                    <button
                      onClick={e => { e.stopPropagation(); hideMedia(item) }}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <EyeOff className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {item.type === 'image' ? (
                    <img src={item.url} alt="" className="w-full shadow-md hover:shadow-xl transition-shadow" />
                  ) : (
                    <video src={item.url} className="w-full shadow-md hover:shadow-xl transition-shadow" controls />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
              ))}
            </div>
          )}

          {role === 'admin' && hiddenMedia.length > 0 && (
            <div className="mt-16 pt-10 border-t border-stone-200">
              <h3 className="font-sans text-xl text-center text-stone-500 uppercase tracking-wider mb-8">Galerie masquée</h3>
              <div className="columns-2 md:columns-4 gap-4 space-y-4">
                {hiddenMedia.map(item => (
                  <div key={item.id} className="break-inside-avoid group relative">
                    <button
                      onClick={() => unhideMedia(item)}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full shadow-md" />
                    ) : (
                      <video src={item.url} className="w-full shadow-md" controls />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <button onClick={() => downloadMedia(media[lightboxIndex])} className="absolute top-4 left-4 text-white hover:text-stone-300 transition-colors">
            <Download className="w-6 h-6" />
          </button>
          {media[lightboxIndex].type === 'image' ? (
            <img src={media[lightboxIndex].url} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <video src={media[lightboxIndex].url} className="max-w-full max-h-full" controls autoPlay />
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4">
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : media.length - 1)) }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev! < media.length - 1 ? prev! + 1 : 0)) }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </>
  )
}