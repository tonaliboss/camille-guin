'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, ArrowLeft, Send } from 'lucide-react'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import { toast } from 'sonner'

export default function VoiceRecorder() {
  const router = useRouter()
  const { executeIfNotPreview } = usePreviewMode()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000)
    } catch {
      toast.error('Impossible d\'accéder au microphone.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const uploadAudio = () => executeIfNotPreview(async () => {
    if (!audioBlob) return
    setIsSending(true)
    try {
      const fileName = `voice-message-${Date.now()}.webm`
      const bucketPath = `${FOLDERS.AUDIO}/${fileName}`
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(bucketPath, audioBlob)
      if (error) throw error
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket_path: bucketPath, type: 'audio', folder: FOLDERS.AUDIO }),
      })
      if (!res.ok) throw new Error('Erreur BDD')
      toast.success('Message vocal envoyé !')
      router.back()
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setIsSending(false)
    }
  })

  return (
    <div>
      <header className="flex items-center px-5 py-4 border-b border-stone-100">
        <button onClick={() => router.back()} className={tokens.btn.ghost}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={cn(tokens.text.title, 'text-[18px] ml-3')}>Message vocal</h1>
      </header>

      <main className="px-5 py-6">
        <div className={cn(tokens.card.base, tokens.card.padding, 'flex flex-col items-center')}>
          <div className={cn(tokens.icon.container, 'mb-5')}>
            <Mic strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <h2 className={cn(tokens.text.cardTitle, 'text-center mb-2')}>Enregistrez votre message</h2>
          <p className={cn(tokens.text.body, 'text-center mb-8')}>Laissez un message vocal pour les mariés</p>

          <div className="flex flex-col items-center space-y-6 w-full">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center animate-pulse">
                  <Mic className="text-red-400" size={28} />
                </div>
                <p className="text-[13px] font-medium text-red-400">{formatTime(recordingTime)}</p>
                <button
                  onClick={stopRecording}
                  className="w-12 h-12 rounded-full bg-red-400 flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <Square size={18} className="text-white" />
                </button>
              </div>
            ) : audioBlob ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setAudioBlob(null); setRecordingTime(0) }}
                    className={tokens.btn.secondary}
                  >
                    Recommencer
                  </button>
                  <button
                    onClick={uploadAudio}
                    disabled={isSending}
                    className={cn(tokens.btn.primary, 'disabled:opacity-50')}
                  >
                    <Send size={16} />
                    {isSending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                <Mic className="text-stone-400" size={28} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}