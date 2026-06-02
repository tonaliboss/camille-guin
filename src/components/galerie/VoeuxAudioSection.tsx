'use client'

import { useEffect, useState } from 'react'
import { Mic, Download, EyeOff, Eye } from 'lucide-react'
import JSZip from 'jszip'
import { getAudioMessages, toggleMediaVisibility } from '@/lib/media'
import type { AudioMessage, UserRole } from '@/types'

interface Props {
  role: UserRole
}

export default function VoeuxAudioSection({ role }: Props) {
  const [audioMessages, setAudioMessages] = useState<AudioMessage[]>([])
  const [hiddenAudio, setHiddenAudio] = useState<AudioMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const loadAudio = async () => {
    setLoading(true)
    const [pub, hidden] = await Promise.all([
      getAudioMessages(false),
      role === 'admin' ? getAudioMessages(true) : Promise.resolve([]),
    ])
    setAudioMessages(pub)
    setHiddenAudio(hidden)
    setLoading(false)
  }

  useEffect(() => { loadAudio() }, [role])

  const hideAudio = async (item: AudioMessage) => {
    await toggleMediaVisibility(item.id, true)
    loadAudio()
  }

  const unhideAudio = async (item: AudioMessage) => {
    await toggleMediaVisibility(item.id, false)
    loadAudio()
  }

  const downloadAudio = async (audio: AudioMessage) => {
    const response = await fetch(audio.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = audio.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadAllAudio = async () => {
    if (!audioMessages.length || downloading) return
    setDownloading(true)
    setDownloadProgress(0)
    try {
      const zip = new JSZip()
      const folder = zip.folder('messages-audio')
      for (let i = 0; i < audioMessages.length; i++) {
        const response = await fetch(audioMessages[i].url)
        const blob = await response.blob()
        folder?.file(audioMessages[i].name, blob)
        setDownloadProgress(((i + 1) / audioMessages.length) * 90)
        await new Promise(r => setTimeout(r, 10))
      }
      setDownloadProgress(95)
      const content = await zip.generateAsync({ type: 'blob' })
      setDownloadProgress(100)
      const url = window.URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'messages-audio.zip'
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
    <section id="voeux-audio" className="py-32 px-8 bg-neutral-50">
      <div className="container mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl text-black mb-20 font-light tracking-widest uppercase">Messages Audios</h2>
        <p className="text-neutral-400 font-light">Chargement...</p>
      </div>
    </section>
  )

  return (
    <section id="voeux-audio" className="py-20 px-4 bg-white relative z-0">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h2 className="font-sans text-3xl text-center text-stone-800 uppercase tracking-wider mb-1">Messages Audios</h2>
          {role === 'admin' && audioMessages.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={downloadAllAudio}
                disabled={downloading}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
                title="Télécharger tous les messages audio"
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

        {audioMessages.length === 0 ? (
          <p className="text-center text-stone-500">Aucun message audio disponible</p>
        ) : (
          <div className="grid gap-6">
            {audioMessages.map((audio, index) => (
              <div key={audio.id} className="bg-stone-50 rounded-md p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mic className="w-6 h-6 text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">Vœux audio {index + 1}</p>
                  </div>
                  {role === 'admin' && (
                    <button onClick={() => hideAudio(audio)} className="p-2 hover:bg-stone-200 rounded-full transition-colors opacity-40 hover:opacity-100" title="Masquer">
                      <EyeOff className="w-5 h-5 text-stone-600" />
                    </button>
                  )}
                  <button onClick={() => downloadAudio(audio)} className="p-2 hover:bg-stone-200 rounded-full transition-colors" title="Télécharger">
                    <Download className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
                <audio controls className="w-full" style={{ height: '40px' }}>
                  <source src={audio.url} />
                </audio>
              </div>
            ))}
          </div>
        )}

        {role === 'admin' && hiddenAudio.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200">
            <h3 className="font-sans text-xl text-center text-stone-500 uppercase tracking-wider mb-8">Messages masqués</h3>
            <div className="grid gap-6">
              {hiddenAudio.map((audio, index) => (
                <div key={audio.id} className="bg-stone-50 rounded-md p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mic className="w-6 h-6 text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">Vœux audio masqué {index + 1}</p>
                    </div>
                    <button onClick={() => unhideAudio(audio)} className="p-2 hover:bg-stone-200 rounded-full transition-colors opacity-40 hover:opacity-100" title="Remettre visible">
                      <Eye className="w-5 h-5 text-stone-600" />
                    </button>
                  </div>
                  <audio controls className="w-full" style={{ height: '40px' }}>
                    <source src={audio.url} type="audio/mpeg" />
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}