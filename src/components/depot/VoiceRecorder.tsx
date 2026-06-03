'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, ArrowLeft, Send, Heart } from 'lucide-react';
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase';
import audioBg from '@/assets/images/audio.png';
import { usePreviewMode } from '@/hooks/usePreviewMode';
import { toast } from 'sonner'

function VoiceRecorder() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const { isPreview, executeIfNotPreview } = usePreviewMode()
  console.log('isPreview', isPreview)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadAudio = async () => {
    if (!audioBlob) return
    setIsSending(true)
    try {
      const fileName = `voice-message-${Date.now()}.webm`
      const bucketPath = `${FOLDERS.AUDIO}/${fileName}`

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(bucketPath, audioBlob)
      if (error) throw error

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket_path: bucketPath, type: 'audio', folder: FOLDERS.AUDIO }),
      })
      if (!res.ok) throw new Error('Erreur BDD')

      toast.success('Message vocal envoyé avec succès !')
      router.back()
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen magical-background">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="text-brown hover:text-brown/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-lora text-2xl text-brown ml-4">Message Vocal</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-center mb-6">
          <img src={audioBg.src} alt="" className="w-32 h-32 object-cover opacity-60" />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-lora text-2xl text-brown font-bold mb-2">
              Enregistrez votre message <Heart size={20} className="inline-block text-sage fill-sage ml-1 -mt-1" />
            </h2>
            <p className="text-brown/70 mb-1">Laissez un message vocal pour les mariés</p>
            <p className="text-[11px] text-brown/60">(visible que par les mariés)</p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                  <Mic className="text-red-500" size={32} />
                </div>
                <p className="text-red-500 font-medium">{formatTime(recordingTime)}</p>
                <button onClick={stopRecording} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors">
                  <Square size={24} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {audioBlob ? (
                  <>
                    <audio src={URL.createObjectURL(audioBlob)} controls className="mb-4" />
                    <div className="flex space-x-4">
                      <button
                        onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                        className="bg-[#8FA87C] text-white font-inter px-8 py-3 rounded-sm transition-all hover:bg-[#8FA87C]/90 flex items-center justify-center gap-2 relative overflow-hidden shadow-md"
                      >
                        Recommencer
                      </button>
                      <button onClick={uploadAudio} className="btn-primary px-8 py-3">
                        <Send size={20} />
                        Envoyer
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => executeIfNotPreview(startRecording)}
                    className="w-16 h-16 rounded-full bg-brown/10 flex items-center justify-center hover:bg-brown/20 transition-colors"
                  >
                    <Mic className="text-brown" size={32} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default VoiceRecorder;