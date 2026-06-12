'use client'

import { useRef, useState } from 'react'
import { Upload, Check, Type, Palette, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import { THEME_COLORS, FONTS } from '@/lib/tableau-de-bord'
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
  const [localBackgroundColor, setLocalBackgroundColor] = useState(settings.backgroundColor ?? '#F9F6F2')
  const [localBannerHeroColor, setLocalBannerHeroColor] = useState(settings.bannerHeroColor ?? '#2C1A0E')
  const [localFooterColor, setLocalFooterColor] = useState(settings.footerColor ?? '#F2EBE0')
  const [localThemeName, setLocalThemeName] = useState(settings.themeName ?? 'Feu de bois')
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
    setLocalBackgroundColor(swatch.backgroundColor)
    setLocalBannerHeroColor(swatch.bannerHeroColor)
    setLocalFooterColor(swatch.footerColor)
    setLocalThemeName(swatch.label)
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
      backgroundColor: localBackgroundColor,
      bannerHeroColor: localBannerHeroColor,
      footerColor: localFooterColor,
      themeName: localThemeName,
    })
  }

  return (
    <div className="bg-[#F0F0F0] border border-[#E5E5E5] rounded-[32px] p-7">
      <div className={tokens.section.cardHeader}>
        <div className={cn(tokens.section.cardAccent, 'bg-stone-300')} />
        <h2 className="italic font-bold text-[22px] leading-tight" style={{ color: '#525252' }}>Personnalisation</h2>
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
        <p className={cn(tokens.text.body, 'mb-4 text-[11px]')}>Importez votre propre photo pour personnaliser la bannière.</p>

        {localBannerType === 'custom' && localBannerImageUrl && (
          <div className="relative rounded-2xl overflow-hidden h-24 bg-stone-100 mb-4">
            <img src={localBannerImageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white text-[11px] font-medium drop-shadow">Aperçu</span>
            </div>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingBanner}
          className={cn(tokens.btn.secondary, 'border-dashed')}
        >
          <Upload className="w-4 h-4" />
          {uploadingBanner ? 'Chargement...' : 'Importer une image'}
        </button>
        {localBannerType === 'custom' && localBannerImageUrl && (
          <button
            onClick={() => { setLocalBannerType('solid'); setLocalBannerImageUrl(null) }}
            className="w-full mt-2 py-2 px-4 rounded-full text-[12px] font-semibold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Supprimer l'image
          </button>
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

        <div className="grid grid-cols-2 gap-2">
          {THEME_COLORS.map(swatch => {
            const isSelected = localThemeColor === swatch.buttonColor && localTitleColor === swatch.titleColor
            return (
              <button
                key={swatch.label}
                onClick={() => selectTheme(swatch)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl border-2 transition-all',
                  isSelected ? 'border-black bg-white' : 'border-transparent bg-white/60 hover:bg-white'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 border border-white/20 shadow-sm"
                  style={{ backgroundColor: swatch.color }}
                />
                <span className="text-[13px] font-medium text-black">{swatch.label}</span>
                {isSelected && <Check size={14} className="ml-auto text-black" />}
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
        style={{ backgroundColor: '#525252', color: '#ffffff' }}
      >
        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </div>
  )
}