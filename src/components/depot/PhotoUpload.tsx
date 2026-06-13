'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/useFileUpload'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import { FOLDERS } from '@/lib/supabase'
import { formatFileSize } from '@/lib/fileOptimization'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import FileUploadProgress from '@/components/ui/FileUploadProgress'
import HiddenToggle from '@/components/ui/HiddenToggle'
import { useSettings } from '@/components/providers/SettingsProvider'

export default function PhotoUpload() {
  const settings = useSettings()
  const router = useRouter()
  const { isPreview, executeIfNotPreview } = usePreviewMode()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState(false)
  const { uploadFiles, uploadProgress, isUploading, resetProgress } = useFileUpload(FOLDERS.GALERIE, hidden)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError('')
    const dropped = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (!dropped.length) { setError('Aucun fichier image ou vidéo valide détecté'); return }
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    const valid = selected.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!valid.length) { setError('Aucun fichier valide sélectionné'); return }
    if (valid.length !== selected.length) {
      setError(`${selected.length - valid.length} fichier(s) ignoré(s) — format non supporté`)
    }
    setFiles(prev => [...prev, ...valid])
  }

  const handleUpload = () => executeIfNotPreview(async () => {
    if (!files.length) return
    setError('')
    resetProgress()
    const { success, failed } = await uploadFiles(files)
    if (success > 0) {
      toast.success(`${success} fichier(s) envoyé(s) avec succès !${hidden ? ' (en masqué)' : ''}${failed > 0 ? ` (${failed} échec(s))` : ''}`)
      router.back()
    } else {
      setError("Aucun fichier n'a pu être envoyé")
    }
  })

  return (
    <div>
      <header className="flex items-center px-5 py-4 border-b border-stone-100">
        <button onClick={() => router.back()} className={tokens.btn.ghost}>
          <ArrowLeft size={20} />
        </button>
      </header>

      <main className="px-5 py-6 space-y-4">
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className={cn(tokens.text.body, 'text-red-600')}>{error}</p>
          </div>
        )}

        <div className={cn(tokens.card.base, tokens.card.padding)}>
          <h2 className={cn(tokens.text.cardTitle, 'text-center mb-2')}>Déposez vos souvenirs</h2>
          <p className={cn(tokens.text.body, 'text-center mb-8')}>Partagez des photos et des vidéos aux mariés</p>
          <div
            className={cn(
              'border-2 border-dashed rounded-[32px] p-8 text-center transition-colors',
              dragActive ? 'border-black bg-stone-50' : 'border-stone-200'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-10 h-10 mx-auto mb-4 text-stone-300" />
            <p className={cn(tokens.text.body, 'mb-4')}>Glissez-déposez vos fichiers ici ou</p>
            <button
              type="button"
              onClick={() => executeIfNotPreview(() => inputRef.current?.click())}
              className={cn(tokens.btn.primary, 'inline-flex w-auto cursor-pointer px-6')}
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
            >
              <Upload size={16} />
              Parcourir
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
            />
            <p className="text-[11px] text-stone-300 mt-3">
              Images (JPG, PNG, GIF) et Vidéos (MP4, MOV, AVI)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <HiddenToggle hidden={hidden} onChange={setHidden} />
            <button
              onClick={handleUpload}
              disabled={isUploading || isPreview}
              className={cn(tokens.btn.primary, 'disabled:opacity-50')}
              style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
            >
              <Upload size={16} />
              {isUploading ? 'Envoi en cours...' : `Envoyer ${files.length} fichier(s)`}
            </button>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className={cn(tokens.card.base, 'flex items-center justify-between p-3')}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageIcon size={16} className="text-stone-300 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className={cn(tokens.text.body, 'truncate text-black text-[12px]')}>{file.name}</p>
                      <p className="text-[11px] text-stone-300">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-stone-300 hover:text-red-400 transition-colors ml-2"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {Object.keys(uploadProgress).length > 0 && (
              <FileUploadProgress progress={uploadProgress} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}