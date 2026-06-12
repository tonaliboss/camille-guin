'use client'

import { useRef, useState } from 'react'
import { Upload, Copy } from 'lucide-react'
import { toast } from 'sonner'
import type { DepotSettings } from '@/types'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'
import { saveSettings } from '@/lib/tableau-de-bord'
import { tokens } from '@/lib/design-tokens'
import { hasFeature } from '@/lib/plan'
import { cn } from '@/components/shadcn/utils'

interface Props {
  depotUrl: string
  settings: DepotSettings
}

export default function DepotSection({ depotUrl, settings }: Props) {
  const [localMenuUrl, setLocalMenuUrl] = useState(settings.menuUrl)
  const [localPlanningUrl, setLocalPlanningUrl] = useState(settings.planningUrl)
  const [uploadingMenu, setUploadingMenu] = useState(false)
  const [uploadingPlanning, setUploadingPlanning] = useState(false)
  const menuInputRef = useRef<HTMLInputElement>(null)
  const planningInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depotUrl)
    toast.success('Lien dépôt copié !')
  }

  const handleFileUpload = async (
    file: File,
    type: 'menu' | 'planning',
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void
  ) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${FOLDERS.PLANNING}/${type}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
      setUrl(data.publicUrl)
      await saveSettings({ [`${type}Url`]: data.publicUrl })
      toast.success(`${type === 'menu' ? 'Menu' : 'Programme'} uploadé !`)
    } catch {
      toast.error(`Erreur lors de l'upload`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (type: 'menu' | 'planning', setUrl: (url: null) => void) => {
    await saveSettings({ [`${type}Url`]: null })
    setUrl(null)
    toast.success(`${type === 'menu' ? 'Menu' : 'Programme'} supprimé`)
  }

  return (
    <div className={cn(tokens.card.base, tokens.card.padding)}>
      <div className={tokens.section.cardHeader}>
        <div className={cn(tokens.section.cardAccent, 'bg-[#6b7562]')} />
        <h2 className={cn(tokens.text.cardTitle, 'text-[#4E5941]')}>Plateforme de dépôt</h2>
      </div>
      <p className={cn(tokens.text.body, 'mb-6')}>
        Partagez ce lien à vos invités pour qu'ils puissent déposer leurs photos et vidéos.
      </p>

      <button
        onClick={copyToClipboard}
        className={cn(tokens.btn.secondary, 'justify-between')}
      >
        <span className="truncate mr-4 text-stone-400 text-left">{depotUrl}</span>
        <div className="flex items-center gap-2 text-black shrink-0">
          <Copy className="w-4 h-4" />
          <span>Copier</span>
        </div>
      </button>

      {/* Menu et programme */}
      {hasFeature('menu') && (
        <>
          <div className={cn(tokens.card.alt, 'p-4 mt-4 space-y-3')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-black">Menu</h3>
                <p className={cn(tokens.text.body, 'text-[11px]')}>PDF ou image visible sur la plateforme de dépôt.</p>
              </div>
              {localMenuUrl && (
                <a href={localMenuUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#4E5941] font-medium underline">
                  Voir
                </a>
              )}
            </div>
            {localMenuUrl ? (
              <button
                onClick={() => handleDeleteFile('menu', setLocalMenuUrl)}
                className="w-full py-2 px-4 rounded-full text-[12px] font-semibold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Supprimer le menu
              </button>
            ) : (
              <button
                onClick={() => menuInputRef.current?.click()}
                disabled={uploadingMenu}
                className={cn(tokens.btn.secondary, 'border-dashed')}
              >
                <Upload className="w-4 h-4" />
                {uploadingMenu ? 'Envoi...' : 'Importer un menu'}
              </button>
            )}
            <input
              ref={menuInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'menu', setUploadingMenu, setLocalMenuUrl) }}
            />
          </div>

          <div className={cn(tokens.card.alt, 'p-4 mt-2 space-y-3')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-black">Programme</h3>
                <p className={cn(tokens.text.body, 'text-[11px]')}>PDF ou image visible sur la plateforme de dépôt.</p>
              </div>
              {localPlanningUrl && (
                <a href={localPlanningUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#4E5941] font-medium underline">
                  Voir
                </a>
              )}
            </div>
            {localPlanningUrl ? (
              <button
                onClick={() => handleDeleteFile('planning', setLocalPlanningUrl)}
                className="w-full py-2 px-4 rounded-full text-[12px] font-semibold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Supprimer le programme
              </button>
            ) : (
              <button
                onClick={() => planningInputRef.current?.click()}
                disabled={uploadingPlanning}
                className={cn(tokens.btn.secondary, 'border-dashed')}
              >
                <Upload className="w-4 h-4" />
                {uploadingPlanning ? 'Envoi...' : 'Importer un programme'}
              </button>
            )}
            <input
              ref={planningInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'planning', setUploadingPlanning, setLocalPlanningUrl) }}
            />
          </div>
        </>
      )}
    </div>
  )
}