'use client'

import { useRef, useState } from 'react'
import { Upload, Check, Type, Palette, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import banniereBg from '@/assets/images/banniere.png'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import { saveSettings, BANNER_COLORS, THEME_COLORS, FONTS } from '@/lib/tableau-de-bord'
import { tokens, fontMap } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import type { DepotSettings, FontFamily } from '@/types'

interface Props {
  settings: DepotSettings
  onSave: (patch: Partial<DepotSettings>) => void
  saving: boolean
}

export default function PersonnalisationSection({ settings, onSave, saving }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [localBannerType, setLocalBannerType] = useState(settings.bannerType)
  const [localBannerColor, setLocalBannerColor] = useState(settings.bannerColor)
  const [localBannerImageUrl, setLocalBannerImageUrl] = useState(settings.bannerImageUrl)
  const [localThemeColor, setLocalThemeColor] = useState(settings.themeColor)
  const [localTitleColor, setLocalTitleColor] = useState(settings.titleColor)
  const [localButtonTextColor, setLocalButtonTextColor] = useState(settings.buttonTextColor)
  const [localGuestMessage, setLocalGuestMessage] = useState(settings.guestMessage)
  const [localFontFamily, setLocalFontFamily] = useState<FontFamily>(settings.fontFamily ?? 'Lora')
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `banniere/custom-banner-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
      setLocalBannerImageUrl(data.publicUrl)
      setLocalBannerType('custom')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploadingBanner(false)
    }
  }

  const selectTheme = (swatch: typeof THEME_COLORS[0]) => {
    setLocalThemeColor(swatch.buttonColor)
    setLocalTitleColor(swatch.titleColor)
    setLocalButtonTextColor(swatch.buttonTextColor)
  }

  const handleSave = () => {
    onSave({
      bannerType: localBannerType,
      bannerColor: localBannerColor,
      bannerImageUrl: localBannerImageUrl,
      themeColor: localThemeColor,
      titleColor: localTitleColor,
      buttonTextColor: localButtonTextColor,
      guestMessage: localGuestMessage,
      fontFamily: localFontFamily,
    })
  }

  return (
    <div className={cn(tokens.card.alt, tokens.card.padding)}>
      <div className={tokens.section.cardHeader}>
        <div className={cn(tokens.section.cardAccent, 'bg-[#6b7562]')} />
        <h2 className={cn(tokens.text.cardTitle, 'text-[#4E5941]')}>Personnalisation</h2>
      </div>

      {/* Mot aux invités */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Type className="w-4 h-4 text-stone-400" />
          <h3 className="text-[13px] font-semibold text-black">Mot aux invités</h3>
        </div>
        <p className={cn(tokens.text.body, 'mb-3 text-[11px]')}>Ce texte apparaît sous la bannière de la page d'accueil.</p>
        <textarea
          value={localGuestMessage}
          onChange={e => setLocalGuestMessage(e.target.value)}
          className={cn(tokens.input.textarea, 'h-24')}
          placeholder="Merci d'avoir partagé cette journée avec nous..."
        />
      </div>

      {/* Bannière */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-4 h-4 text-stone-400" />
          <h3 className="text-[13px] font-semibold text-black">Bannière</h3>
        </div>
        <p className={cn(tokens.text.body, 'mb-4 text-[11px]')}>Couleur unie ou importez votre propre image.</p>

        <div className="relative rounded-2xl overflow-hidden h-24 bg-stone-100 mb-4">
          {localBannerType === 'image' && <img src={banniereBg.src} alt="" className="w-full h-full object-cover" />}
          {localBannerType === 'solid' && <div className="w-full h-full" style={{ backgroundColor: localBannerColor }} />}
          {localBannerType === 'custom' && localBannerImageUrl && <img src={localBannerImageUrl} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-[11px] font-medium drop-shadow">Aperçu</span>
          </div>
        </div>

        <button
          onClick={() => { setLocalBannerType('image'); setLocalBannerImageUrl(null) }}
          className={cn('relative rounded-xl overflow-hidden h-12 w-24 border-2 transition-all mb-4', localBannerType === 'image' ? 'border-black' : 'border-stone-200')}
        >
          <img src={banniereBg.src} alt="" className="w-full h-full object-cover" />
          {localBannerType === 'image' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>

        <div className="flex flex-wrap gap-2 mb-4">
          {BANNER_COLORS.map(({ label, color }) => {
            const isSelected = localBannerType === 'solid' && localBannerColor === color
            return (
              <button
                key={color}
                title={label}
                onClick={() => { setLocalBannerType('solid'); setLocalBannerColor(color) }}
                className={cn('w-8 h-8 rounded-lg border-2 transition-all', isSelected ? 'border-black scale-110' : 'border-transparent hover:border-stone-400')}
                style={{ backgroundColor: color }}
              >
                {isSelected && <Check size={12} className="text-white drop-shadow mx-auto" />}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingBanner}
          className={cn(tokens.btn.secondary, 'border-dashed')}
        >
          <Upload className="w-4 h-4" />
          {uploadingBanner ? 'Envoi...' : 'Importer une image'}
        </button>
        {localBannerType === 'custom' && localBannerImageUrl && (
          <p className="text-[11px] text-green-500 flex items-center gap-1 mt-2">
            <Check size={12} /> Image importée
          </p>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerImageUpload} />
      </div>

      {/* Couleur du thème */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-stone-400" />
          <h3 className="text-[13px] font-semibold text-black">Couleur</h3>
        </div>
        <p className={cn(tokens.text.body, 'mb-4 text-[11px]')}>S'applique aux titres et aux boutons de toutes les pages.</p>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 px-4 rounded-full text-[12px] font-semibold flex items-center shadow-sm" style={{ backgroundColor: localThemeColor, color: localButtonTextColor }}>
            Aperçu
          </div>
          <span className="italic font-bold text-[16px]" style={{ color: localTitleColor }}>Titre</span>
        </div>

        <button
          onClick={() => selectTheme(THEME_COLORS[0])}
          className={cn('w-9 h-9 rounded-full border-2 transition-all shadow-sm flex items-center justify-center mb-4', localThemeColor === THEME_COLORS[0].buttonColor ? 'border-black scale-110' : 'border-transparent hover:border-stone-400')}
          style={{ backgroundColor: THEME_COLORS[0].color }}
        >
          {localThemeColor === THEME_COLORS[0].buttonColor && <Check size={14} className="text-white drop-shadow" />}
        </button>

        <div className="flex flex-wrap gap-3">
          {THEME_COLORS.slice(1).map(swatch => {
            const isSelected = localThemeColor === swatch.buttonColor && localTitleColor === swatch.titleColor
            return (
              <button
                key={swatch.label}
                title={swatch.label}
                onClick={() => selectTheme(swatch)}
                className={cn('w-9 h-9 rounded-full border-2 transition-all shadow-sm flex items-center justify-center', isSelected ? 'border-black scale-110' : 'border-transparent hover:border-stone-400')}
                style={{ backgroundColor: swatch.color }}
              >
                {isSelected && <Check size={14} className="text-white drop-shadow" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Police */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Type className="w-4 h-4 text-stone-400" />
          <h3 className="text-[13px] font-semibold text-black">Police</h3>
        </div>
        <p className={cn(tokens.text.body, 'mb-4 text-[11px]')}>S'applique à tout le texte de la plateforme.</p>
        <div className="space-y-2">
          {FONTS.map(font => (
            <button
              key={font.value}
              onClick={() => setLocalFontFamily(font.value)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all',
                localFontFamily === font.value ? 'border-black bg-white' : 'border-transparent bg-white/60 hover:bg-white'
              )}
            >
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">{font.label}</span>
              <span
                data-font-preview
                className="text-[18px] italic"
                style={{ '--preview-font': fontMap[font.value] } as React.CSSProperties}
              >
                {font.preview}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(tokens.btn.primary, 'disabled:opacity-50')}
      >
        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </div>
  )
}