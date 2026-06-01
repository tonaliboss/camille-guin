'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Upload, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import logoBolt from '@/assets/images/logobolt.png'
import banniereBg from '@/assets/images/banniere.png'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import type { DepotSettings } from '@/types'

interface Props {
  settings: DepotSettings
  token: string
  onThemeChange?: (color: string) => void
}

interface BannerSwatch { label: string; color: string }
interface ThemeSwatch { label: string; color: string; buttonColor: string; titleColor: string; buttonTextColor: string }

const BANNER_COLORS: BannerSwatch[] = [
  { label: 'Gris',       color: '#747373' },
  { label: 'Beige',      color: '#ecded2' },
  { label: 'Terracotta', color: '#a7523c' },
  { label: 'Bleu ciel',  color: '#d5e4fa' },
  { label: 'Bleu',       color: '#1b2f47' },
  { label: 'Vert sauge', color: '#aeb7a4' },
  { label: 'Rose',       color: '#db7f8f' },
  { label: 'Jaune',      color: '#fff5cd' },
  { label: 'Vert sapin', color: '#4e5941' },
  { label: 'Marron',     color: '#d9ccbd' },
  { label: 'Violet',     color: '#c8b5d0' },
  { label: 'Bordeaux',   color: '#60071d' },
]

const THEME_COLORS: ThemeSwatch[] = [
  { label: 'Original',   color: '#3C1F0F', buttonColor: '#3C1F0F', titleColor: '#3C1F0F', buttonTextColor: '#ffffff' },
  { label: 'Gris',       color: '#747373', buttonColor: '#747373', titleColor: '#1a1a1a', buttonTextColor: '#ffffff' },
  { label: 'Beige',      color: '#ecded2', buttonColor: '#ecded2', titleColor: '#ae9c88', buttonTextColor: '#ae9c88' },
  { label: 'Terracotta', color: '#a7523c', buttonColor: '#a7523c', titleColor: '#5a382a', buttonTextColor: '#ffffff' },
  { label: 'Bleu',       color: '#1b2f47', buttonColor: '#1b2f47', titleColor: '#1b2f47', buttonTextColor: '#ffffff' },
  { label: 'Vert sauge', color: '#aeb7a4', buttonColor: '#aeb7a4', titleColor: '#4e5941', buttonTextColor: '#ffffff' },
  { label: 'Rose',       color: '#fad7dd', buttonColor: '#db7f8f', titleColor: '#995964', buttonTextColor: '#fad7dd' },
  { label: 'Jaune',      color: '#fff5cd', buttonColor: '#fff5cd', titleColor: '#2d2d2d', buttonTextColor: '#6b6b6b' },
  { label: 'Vert sapin', color: '#4e5941', buttonColor: '#b2a791', titleColor: '#4e5941', buttonTextColor: '#ffffff' },
  { label: 'Marron',     color: '#624838', buttonColor: '#624838', titleColor: '#624838', buttonTextColor: '#ffffff' },
  { label: 'Violet',     color: '#c8b5d0', buttonColor: '#c8b5d0', titleColor: '#8C7E91', buttonTextColor: '#7a5f96' },
  { label: 'Bordeaux',   color: '#60071d', buttonColor: '#ecded2', titleColor: '#60071d', buttonTextColor: '#60071d' },
]

async function saveSettings(patch: Partial<DepotSettings>) {
  await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export default function PersonnaliserClient({ settings, token, onThemeChange }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewKey, setPreviewKey] = useState(0)

  const [localBannerType, setLocalBannerType] = useState(settings.bannerType)
  const [localBannerColor, setLocalBannerColor] = useState(settings.bannerColor)
  const [localBannerImageUrl, setLocalBannerImageUrl] = useState(settings.bannerImageUrl)
  const [localThemeColor, setLocalThemeColor] = useState(settings.themeColor)
  const [localTitleColor, setLocalTitleColor] = useState(settings.titleColor)
  const [localButtonTextColor, setLocalButtonTextColor] = useState(settings.buttonTextColor)
  const [localGuestMessage, setLocalGuestMessage] = useState(settings.guestMessage)

  const [saving, setSaving] = useState(false)
  const [savedBanner, setSavedBanner] = useState(false)
  const [savedTheme, setSavedTheme] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

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
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingBanner(false)
    }
  }

  const saveBanner = async () => {
    setSaving(true)
    await saveSettings({ bannerType: localBannerType, bannerColor: localBannerColor, bannerImageUrl: localBannerImageUrl })
    setSaving(false)
    setSavedBanner(true)
    setTimeout(() => setSavedBanner(false), 2000)
  }

  const saveTheme = async () => {
    setSaving(true)
    await saveSettings({ themeColor: localThemeColor, titleColor: localTitleColor, buttonTextColor: localButtonTextColor })
    setSaving(false)
    setSavedTheme(true)
    setPreviewKey(prev => prev + 1)
    setTimeout(() => setSavedTheme(false), 1000)
  }

  const saveGuestMessage = async () => {
    setSaving(true)
    await saveSettings({ guestMessage: localGuestMessage })
    setSaving(false)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  const selectTheme = (swatch: ThemeSwatch) => {
    setLocalThemeColor(swatch.buttonColor)
    setLocalTitleColor(swatch.titleColor)
    setLocalButtonTextColor(swatch.buttonTextColor)
    onThemeChange?.(swatch.buttonColor)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-6">
          <img src={logoBolt.src} alt="Logo" className="h-10 object-contain" />
          <button
            onClick={() => router.push(`/depot/${token}`)}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            ← Revenir à la plateforme de dépôt
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        <div>
          <h1 className="font-lora text-2xl md:text-3xl text-stone-800 font-semibold">
            Personnaliser ma plateforme de dépôt
          </h1>
          <p className="text-stone-400 text-sm mt-1">Vos modifications sont appliquées en temps réel pour vos invités.</p>
        </div>

        {/* Bannière */}
        <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="font-lora text-lg text-stone-800 font-medium">Image de la bannière</h2>
            <p className="text-stone-400 text-sm mt-0.5">Choisissez une couleur unie ou importez votre propre image.</p>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="relative rounded-lg overflow-hidden h-28 bg-stone-100">
              {localBannerType === 'image' && (
                <img src={banniereBg.src} alt="Bannière actuelle" className="w-full h-full object-cover" />
              )}
              {localBannerType === 'solid' && (
                <div className="w-full h-full" style={{ backgroundColor: localBannerColor }} />
              )}
              {localBannerType === 'custom' && localBannerImageUrl && (
                <img src={localBannerImageUrl} alt="Bannière personnalisée" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-center text-white drop-shadow">
                  <div className="font-lora text-xl font-medium">Tiffany</div>
                  <Heart size={18} className="inline fill-white text-white my-0.5" />
                  <div className="font-lora text-xl font-medium">Valentin</div>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-white/80 rounded px-2 py-0.5 text-xs text-stone-500">Aperçu</div>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Bannière originale</p>
              <button
                onClick={() => { setLocalBannerType('image'); setLocalBannerImageUrl(null) }}
                className={`relative rounded-lg overflow-hidden h-14 w-32 border-2 transition-all ${
                  localBannerType === 'image' ? 'border-stone-700 ring-2 ring-stone-700/20' : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <img src={banniereBg.src} alt="Originale" className="w-full h-full object-cover" />
                {localBannerType === 'image' && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Couleurs unies</p>
              <div className="flex flex-wrap gap-2.5">
                {BANNER_COLORS.map(({ label, color }) => {
                  const isSelected = localBannerType === 'solid' && localBannerColor === color
                  return (
                    <button
                      key={color}
                      title={label}
                      onClick={() => { setLocalBannerType('solid'); setLocalBannerColor(color) }}
                      className={`w-9 h-9 rounded-md border-2 transition-all shadow-sm ${
                        isSelected ? 'border-stone-700 ring-2 ring-stone-700/20 scale-110' : 'border-transparent hover:border-stone-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {isSelected && (
                        <span className="flex items-center justify-center h-full">
                          <Check size={14} className="text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Image personnalisée</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="flex items-center gap-2 px-4 py-2 rounded-md border border-stone-300 text-sm text-stone-600 hover:bg-stone-50 hover:border-stone-400 transition-all"
                >
                  <Upload size={15} />
                  {uploadingBanner ? 'Envoi…' : 'Importer une image'}
                </button>
                {localBannerType === 'custom' && localBannerImageUrl && (
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Check size={12} className="text-green-500" /> Image importée
                  </span>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerImageUpload} />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveBanner}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-md text-sm text-white font-medium transition-all"
                style={{ backgroundColor: savedBanner ? '#4e7c59' : '#3C1F0F' }}
              >
                {savedBanner ? <><Check size={15} /> Enregistré</> : 'Enregistrer la bannière'}
              </button>
            </div>
          </div>
        </section>

        {/* Thème */}
        <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="font-lora text-lg text-stone-800 font-medium">Couleur du thème</h2>
            <p className="text-stone-400 text-sm mt-0.5">La couleur choisie s'applique aux titres et aux boutons.</p>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="h-9 px-5 rounded-sm text-sm font-medium flex items-center shadow-md"
                style={{ backgroundColor: localThemeColor, color: localButtonTextColor }}
              >
                Aperçu bouton
              </div>
              <div className="font-lora text-xl font-bold" style={{ color: localTitleColor }}>
                Aperçu titre
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Thème original</p>
              <button
                onClick={() => selectTheme(THEME_COLORS[0])}
                className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm flex items-center justify-center ${
                  localThemeColor === THEME_COLORS[0].buttonColor ? 'border-stone-700 ring-2 ring-stone-700/20 scale-110' : 'border-transparent hover:border-stone-400 hover:scale-105'
                }`}
                style={{ backgroundColor: THEME_COLORS[0].color }}
              >
                {localThemeColor === THEME_COLORS[0].buttonColor && <Check size={14} className="text-white drop-shadow" />}
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Autres thèmes</p>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.slice(1).map((swatch) => {
                  const isSelected = localThemeColor === swatch.buttonColor && localTitleColor === swatch.titleColor
                  return (
                    <button
                      key={swatch.label}
                      title={swatch.label}
                      onClick={() => selectTheme(swatch)}
                      className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm flex items-center justify-center ${
                        isSelected ? 'border-stone-700 ring-2 ring-stone-700/20 scale-110' : 'border-transparent hover:border-stone-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                    >
                      {isSelected && <Check size={14} className="text-white drop-shadow" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveTheme}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-md text-sm text-white font-medium transition-all"
                style={{ backgroundColor: savedTheme ? '#4e7c59' : '#3C1F0F' }}
              >
                {savedTheme ? <><Check size={15} /> Enregistré</> : 'Enregistrer le thème'}
              </button>
            </div>
          </div>
        </section>

        {/* Message invités */}
        <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="font-lora text-lg text-stone-800 font-medium">Un mot pour vos invités</h2>
            <p className="text-stone-400 text-sm mt-0.5">Ce texte apparaît sous la bannière de la page d'accueil.</p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <textarea
              value={localGuestMessage}
              onChange={(e) => setLocalGuestMessage(e.target.value)}
              placeholder="Ex : Merci d'être là pour partager ce jour si spécial avec nous…"
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-stone-200 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none transition-all placeholder:text-stone-300"
            />
            {localGuestMessage.trim() && (
              <p className="text-sm italic" style={{ color: localTitleColor + 'CC' }}>
                Aperçu : {localGuestMessage}
              </p>
            )}
            <div className="pt-1">
              <button
                onClick={saveGuestMessage}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-md text-sm text-white font-medium transition-all"
                style={{ backgroundColor: savedMessage ? '#4e7c59' : '#3C1F0F' }}
              >
                {savedMessage ? <><Check size={15} /> Enregistré</> : 'Enregistrer le message'}
              </button>
            </div>
          </div>
        </section>

        {/* Prévisualisation */}
        <div className="flex justify-center pb-2">
          <button
            onClick={() => {
              setPreviewOpen(prev => !prev)
              if (!previewOpen) setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-800 transition-all font-medium text-sm bg-white shadow-sm"
          >
            <Eye size={17} />
            {previewOpen ? 'Fermer la prévisualisation' : 'Prévisualiser la plateforme'}
            {previewOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {previewOpen && (
          <div ref={previewRef} className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-2 bg-stone-50">
              <Eye size={14} className="text-stone-500" />
              <span className="font-medium text-stone-700 text-sm">Prévisualisation</span>
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">Mode lecture seule</span>
            </div>
            <div className="flex justify-center py-6 bg-stone-50">
              <div
                className="relative overflow-hidden"
                style={{ width: '320px', height: `${Math.round(844 * 320 / 390)}px`, borderRadius: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '6px solid #1c1c1e', background: '#1c1c1e' }}
              >
                <div style={{ width: '390px', height: '844px', transformOrigin: 'top left', transform: `scale(${320 / 390})`, position: 'absolute', top: 0, left: 0 }}>
                  <iframe
                    key={previewKey}
                    src={`/depot/${token}?preview=1`}
                    style={{ width: '390px', height: '844px', border: 'none' }}
                    title="Prévisualisation plateforme"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center py-4 text-stone-300 text-xs">
          <p>Créé avec <Heart size={10} className="inline text-stone-300 fill-stone-300" /> par CAMORIA MEMORIES</p>
        </footer>
      </main>
    </div>
  )
}