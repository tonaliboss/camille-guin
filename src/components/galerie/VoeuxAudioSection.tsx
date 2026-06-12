'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Download, EyeOff, Eye, Play, Pause } from 'lucide-react'
import { getAudioMessages, toggleMediaVisibility } from '@/lib/media'
import { downloadAllAsZip, downloadFile } from '@/lib/download'
import type { AudioMessage, UserRole, DepotSettings } from '@/types'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  role: UserRole
  settings: DepotSettings
}

interface AudioPlayerState {
  isPlaying: boolean
  progress: number
  duration: number
}

interface AudioRowProps {
  audio: AudioMessage
  index: number
  hidden: boolean
  role: UserRole
  player: AudioPlayerState
  audioRef: (el: HTMLAudioElement | null) => void
  onTogglePlay: () => void
  onTimeUpdate: () => void
  onEnded: () => void
  onHide: () => void
  onUnhide: () => void
  onDownload: () => void
}

function AudioRow({ audio, index, hidden, role, player, audioRef, onTogglePlay, onTimeUpdate, onEnded, onHide, onUnhide, onDownload }: AudioRowProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="py-5 flex items-center gap-5 group border-b border-stone-200/60 last:border-0">
      <audio
        ref={audioRef}
        src={audio.url}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onTimeUpdate}
      />

      <button
        onClick={onTogglePlay}
        className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-black group-hover:border-black group-hover:text-white text-black"
      >
        {player.isPlaying
          ? <Pause strokeWidth={1.5} className="w-4 h-4" />
          : <Play strokeWidth={1.5} className="w-4 h-4 ml-0.5" fill="currentColor" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-3">
          <span className="italic font-bold text-[18px] truncate">
            {audio.metadata?.author ?? `Vœux audio ${index + 1}`}
          </span>
          <span className="text-[10px] font-medium tracking-widest text-stone-400 ml-2 shrink-0">
            {formatTime(player.duration)}
          </span>
        </div>
        <div className="relative h-[2px] bg-stone-200 rounded-full w-full">
          <div
            className="absolute top-0 left-0 h-full bg-black rounded-full transition-all"
            style={{ width: `${player.progress}%` }}
          />
          {player.isPlaying && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full shadow-sm"
              style={{ left: `${player.progress}%` }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {role === 'admin' && (
          <>
            <button onClick={onDownload} className="p-1 text-stone-300 hover:text-black transition-colors">
              <Download className="w-4 h-4" />
            </button>
            {hidden ? (
              <button onClick={onUnhide} className="p-1 text-stone-300 hover:text-black transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onHide} className="p-1 text-stone-300 hover:text-black transition-colors">
                <EyeOff className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function VoeuxAudioSection({ role, settings }: Props) {
  const [audioMessages, setAudioMessages] = useState<AudioMessage[]>([])
  const [hiddenAudio, setHiddenAudio] = useState<AudioMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [players, setPlayers] = useState<{ [id: string]: AudioPlayerState }>({})
  const audioRefs = useRef<{ [id: string]: HTMLAudioElement | null }>({})

  const INITIAL_AUDIO = 3
  const [showAllAudio, setShowAllAudio] = useState(false)
  const [showAllHiddenAudio, setShowAllHiddenAudio] = useState(false)

  const loadAudio = useCallback(async () => {
    setLoading(true)
    const [pub, hidden] = await Promise.all([
      getAudioMessages(false),
      role === 'admin' ? getAudioMessages(true) : Promise.resolve([]),
    ])
    setAudioMessages(pub)
    setHiddenAudio(hidden)
    setLoading(false)
  }, [role])

  useEffect(() => { loadAudio() }, [loadAudio])

  const togglePlay = useCallback((audio: AudioMessage) => {
    const audioEl = audioRefs.current[audio.id]
    if (!audioEl) return

    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== audio.id && el) {
        el.pause()
        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }))
      }
    })

    if (audioEl.paused) {
      audioEl.play()
      setPlayers(prev => ({ ...prev, [audio.id]: { ...prev[audio.id], isPlaying: true } }))
    } else {
      audioEl.pause()
      setPlayers(prev => ({ ...prev, [audio.id]: { ...prev[audio.id], isPlaying: false } }))
    }
  }, [])

  const handleTimeUpdate = useCallback((id: string) => {
    const audioEl = audioRefs.current[id]
    if (!audioEl) return
    setPlayers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        progress: audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0,
        duration: audioEl.duration || 0,
      }
    }))
  }, [])

  const handleEnded = useCallback((id: string) => {
    setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false, progress: 0 } }))
  }, [])

  const hideAudio = useCallback(async (item: AudioMessage) => {
    await toggleMediaVisibility(item.id, true)
    loadAudio()
  }, [loadAudio])

  const unhideAudio = useCallback(async (item: AudioMessage) => {
    await toggleMediaVisibility(item.id, false)
    loadAudio()
  }, [loadAudio])

  const downloadAudio = useCallback((audio: AudioMessage) => {
    downloadFile(audio.url, audio.name)
  }, [])

  const downloadAllAudio = async () => {
    if (!audioMessages.length || downloading) return
    setDownloading(true)
    setDownloadProgress(0)
    try {
      await downloadAllAsZip(audioMessages, 'audio', 'audio.zip', setDownloadProgress)
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  if (loading) return (
    <section id="voeux-audio" className="py-12 px-5">
      <p className={cn(tokens.text.body, 'text-center')}>Chargement...</p>
    </section>
  )

  return (
    <section id="voeux-audio" className="py-12 px-5 scroll-mt-28">
      <div className="text-center mb-8 flex flex-col items-center">
        <span className={tokens.section.eyebrow}>Les voix de nos proches</span>
        <div className="flex items-center gap-4 mt-2">
          <div className={tokens.section.divider} />
          <h2 className={tokens.section.title}>Mots Vocaux</h2>
          <div className={tokens.section.divider} />
        </div>
        {audioMessages.length > 0 && (
          <p className="text-[11px] text-stone-400 mt-2">{audioMessages.length} élément{audioMessages.length > 1 ? 's' : ''}</p>
        )}
      </div>

      {role === 'admin' && audioMessages.length > 0 && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <button onClick={downloadAllAudio} disabled={downloading} className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50">
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

      {audioMessages.length === 0 ? (
        <p className={cn(tokens.text.body, 'text-center')}>Aucun message audio disponible</p>
      ) : (
        <div className="border-t border-stone-200/60">
          {audioMessages.slice(0, showAllAudio ? undefined : INITIAL_AUDIO).map((audio, index) => (
            <AudioRow
              key={audio.id}
              audio={audio}
              index={index}
              hidden={false}
              role={role}
              player={players[audio.id] || { isPlaying: false, progress: 0, duration: 0 }}
              audioRef={el => { audioRefs.current[audio.id] = el }}
              onTogglePlay={() => togglePlay(audio)}
              onTimeUpdate={() => handleTimeUpdate(audio.id)}
              onEnded={() => handleEnded(audio.id)}
              onHide={() => hideAudio(audio)}
              onUnhide={() => unhideAudio(audio)}
              onDownload={() => downloadAudio(audio)}
            />
          ))}
        </div>
      )}
      {audioMessages.length > INITIAL_AUDIO && (
        <button
          onClick={() => setShowAllAudio(!showAllAudio)}
          className={cn(tokens.btn.outline, 'mt-4')}
          style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
        >
          {showAllAudio ? 'Voir moins' : `Voir tout (+${audioMessages.length - INITIAL_AUDIO})`}
        </button>
      )}

      {role === 'admin' && hiddenAudio.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-100">
          <div className="text-center mb-6 flex flex-col items-center">
            <span className={tokens.section.eyebrow}>Contenu masqué</span>
            <div className="flex items-center gap-4 mt-2">
              <div className={tokens.section.divider} />
              <h3 className={tokens.section.title}>Messages masqués</h3>
              <div className={tokens.section.divider} />
            </div>
            {hiddenAudio.length > 0 && (
              <p className="text-[11px] text-stone-400 mt-2">{hiddenAudio.length} élément{hiddenAudio.length > 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="border-t border-stone-200/60">
            {hiddenAudio.slice(0, showAllHiddenAudio ? undefined : INITIAL_AUDIO).map((audio, index) => (
              <AudioRow
                key={audio.id}
                audio={audio}
                index={index}
                hidden={true}
                role={role}
                player={players[audio.id] || { isPlaying: false, progress: 0, duration: 0 }}
                audioRef={el => { audioRefs.current[audio.id] = el }}
                onTogglePlay={() => togglePlay(audio)}
                onTimeUpdate={() => handleTimeUpdate(audio.id)}
                onEnded={() => handleEnded(audio.id)}
                onHide={() => hideAudio(audio)}
                onUnhide={() => unhideAudio(audio)}
                onDownload={() => downloadAudio(audio)}
              />
            ))}
          </div>
        </div>
      )}
      {hiddenAudio.length > INITIAL_AUDIO && (
        <button
          onClick={() => setShowAllHiddenAudio(!showAllHiddenAudio)}
          className={cn(tokens.btn.outline, 'mt-4')}
          style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
        >
          {showAllHiddenAudio ? 'Voir moins' : `Voir tout (+${hiddenAudio.length - INITIAL_AUDIO})`}
        </button>
      )}
    </section>
  )
}