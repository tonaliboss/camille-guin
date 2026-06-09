'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Link, Upload, Eye, LogOut, Type, Palette, ImageIcon, Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import banniereBg from '@/assets/images/banniere.png'
import type { DepotSettings } from '@/types'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { toast } from 'sonner'
import AppLayout from '@/components/ui/AppLayout'
import { Calendar, HardDrive, Film } from 'lucide-react'
import { WEDDING_DATE, formatDate, getStorageExpiryDate, getVideoDeliveryDate } from '@/lib/dates'

interface Props {
  settings: DepotSettings
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
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
}

export default function TableauDeBord({ settings }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showGalleryHelp, setShowGalleryHelp] = useState(false)

  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const depotUrl = `${origin}/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`
  const galerieUrl = `${origin}/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`

  const [localBannerType, setLocalBannerType] = useState(settings.bannerType)
  const [localBannerColor, setLocalBannerColor] = useState(settings.bannerColor)
  const [localBannerImageUrl, setLocalBannerImageUrl] = useState(settings.bannerImageUrl)
  const [localThemeColor, setLocalThemeColor] = useState(settings.themeColor)
  const [localTitleColor, setLocalTitleColor] = useState(settings.titleColor)
  const [localButtonTextColor, setLocalButtonTextColor] = useState(settings.buttonTextColor)
  const [localGuestMessage, setLocalGuestMessage] = useState(settings.guestMessage)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'depot' | 'galerie'>('depot')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const copyToClipboard = (url: string, label: string) => {
    navigator.clipboard.writeText(url)
    toast.success(`Lien ${label} copié !`)
  }

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings({
        bannerType: localBannerType,
        bannerColor: localBannerColor,
        bannerImageUrl: localBannerImageUrl,
        themeColor: localThemeColor,
        titleColor: localTitleColor,
        buttonTextColor: localButtonTextColor,
        guestMessage: localGuestMessage,
      })
      setPreviewKey(prev => prev + 1)
      toast.success('Modifications enregistrées !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async (redirectTo: 'depot' | 'galerie') => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push(redirectTo === 'depot'
      ? `/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`
      : `/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`
    )
  }

  const selectTheme = (swatch: ThemeSwatch) => {
    setLocalThemeColor(swatch.buttonColor)
    setLocalTitleColor(swatch.titleColor)
    setLocalButtonTextColor(swatch.buttonTextColor)
  }

  return (
    <AppLayout role="admin" token={process.env.NEXT_PUBLIC_DEPOT_TOKEN!}>
      <div className="pb-8">

        {/* Header */}
        <header className="pt-16 pb-8 px-5 bg-[#FAFAFA]">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(tokens.text.title, 'text-[36px]')}
          >
            Espace <br /><span style={{ color: '#4a5443' }}>Hôtes</span>
          </motion.h1>
        </header>

        <div className="px-5 space-y-4">
          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#EDE3DC]/50 backdrop-blur-md p-3.5 rounded-[24px] border border-[#EDE3DC] shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100/80 px-1">
              <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                <Calendar strokeWidth={1.5} className="w-4 h-4 text-[#4E5941]" />
              </div>
              <div className="flex flex-col">
                <p className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Événement</p>
                <p className="text-[16px] font-['Lora'] italic font-bold text-stone-500 leading-none">
                  {formatDate(WEDDING_DATE)}
                </p>
              </div>
            </div>

            <div className="flex divide-x divide-stone-100/80 pt-1">
              <div className="flex-1 flex items-center gap-2 px-2">
                <HardDrive strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="flex flex-col">
                  <p className="text-[8px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Stockage</p>
                  <p className="text-[10px] font-medium text-stone-500 leading-none">
                    jusqu'au {getStorageExpiryDate()}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 px-2 pl-3">
                <Film strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="flex flex-col">
                  <p className="text-[8px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Vidéo montée</p>
                  <p className="text-[10px] font-medium text-stone-500 leading-none">
                    le {getVideoDeliveryDate()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plateforme de dépôt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(tokens.card.base, tokens.card.padding)}
          >
            <div className={tokens.section.cardHeader}>
              <div className={cn(tokens.section.cardAccent, 'bg-[#6b7562]')} />
              <h2 className={cn(tokens.text.cardTitle, 'text-[#4E5941]')}>Plateforme de dépôt</h2>
            </div>
            <p className={cn(tokens.text.body, 'mb-6')}>
              Partagez ce lien à vos invités pour qu'ils puissent déposer leurs photos et vidéos.
            </p>
            <button
              onClick={() => copyToClipboard(depotUrl, 'dépôt')}
              className={cn(tokens.btn.secondary, 'justify-between')}
            >
              <span className="truncate mr-4 text-stone-400 text-left">{depotUrl}</span>
              <div className="flex items-center gap-2 text-black shrink-0">
                <Copy className="w-4 h-4" />
                <span>Copier</span>
              </div>
            </button>
          </motion.div>

          {/* Galerie digitale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn(tokens.card.base, tokens.card.padding)}
          >
            <div className={tokens.section.cardHeader}>
              <div className={cn(tokens.section.cardAccent, 'bg-[#6b7562]')} />
              <h2 className={cn(tokens.text.cardTitle, 'text-[#4E5941]')}>Galerie digitale</h2>
            </div>
            <p className={cn(tokens.text.body, 'mb-6')}>
              Transmettez ce lien à vos invités pour qu'ils puissent visionner la galerie.
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => copyToClipboard(galerieUrl, 'galerie')}
                className={cn(tokens.btn.secondary, 'flex-1 justify-between')}
              >
                <span className="truncate mr-2 text-stone-400 text-left text-[12px]">{galerieUrl}</span>
                <div className="flex items-center gap-2 text-black shrink-0">
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </div>
              </button>
            </div>

            {/* Que puis-je faire */}
            <div className="border-t border-stone-100 pt-2 mt-4">
              <button
                onClick={() => setShowGalleryHelp(!showGalleryHelp)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="text-[13px] font-semibold text-[#4E5941]">Que puis-je faire dans ma galerie ?</span>
                <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform duration-300', showGalleryHelp && 'rotate-180')} />
              </button>
              {showGalleryHelp && (
                <div className="pb-2">
                  <div className={cn(tokens.card.alt, 'p-4 space-y-4')}>
                    {[
                      { title: '1. Télécharger en HD', desc: 'Récupérez toutes les photos et vidéos dans leur qualité originale.' },
                      { title: '2. Masquer des médias', desc: 'Masquez certaines photos pour qu\'elles n\'apparaissent pas sur la galerie publique.' },
                      { title: '3. Gérer le livre d\'or', desc: 'Masquez les messages que vous ne souhaitez pas afficher.' },
                    ].map((item, i) => (
                      <div key={i}>
                        {i > 0 && <div className="h-px w-full bg-stone-200/50 mb-4" />}
                        <h4 className="text-[12px] font-bold text-[#4E5941] mb-1">{item.title}</h4>
                        <p className={cn(tokens.text.body, 'text-[11px]')}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Personnalisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn(tokens.card.alt, tokens.card.padding)}
          >
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

              {/* Aperçu */}
              <div className="relative rounded-2xl overflow-hidden h-24 bg-stone-100 mb-4">
                {localBannerType === 'image' && <img src={banniereBg.src} alt="" className="w-full h-full object-cover" />}
                {localBannerType === 'solid' && <div className="w-full h-full" style={{ backgroundColor: localBannerColor }} />}
                {localBannerType === 'custom' && localBannerImageUrl && <img src={localBannerImageUrl} alt="" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white text-[11px] font-medium drop-shadow">Aperçu</span>
                </div>
              </div>

              {/* Bannière originale */}
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

              {/* Couleurs */}
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

              {/* Upload image custom */}
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

              {/* Aperçu */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 px-4 rounded-full text-[12px] font-semibold flex items-center shadow-sm" style={{ backgroundColor: localThemeColor, color: localButtonTextColor }}>
                  Aperçu
                </div>
                <span className="font-['Lora'] italic font-bold text-[16px]" style={{ color: localTitleColor }}>Titre</span>
              </div>

              {/* Thème original */}
              <button
                onClick={() => selectTheme(THEME_COLORS[0])}
                className={cn('w-9 h-9 rounded-full border-2 transition-all shadow-sm flex items-center justify-center mb-4', localThemeColor === THEME_COLORS[0].buttonColor ? 'border-black scale-110' : 'border-transparent hover:border-stone-400')}
                style={{ backgroundColor: THEME_COLORS[0].color }}
              >
                {localThemeColor === THEME_COLORS[0].buttonColor && <Check size={14} className="text-white drop-shadow" />}
              </button>

              {/* Autres thèmes */}
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

            {/* Bouton enregistrer */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(tokens.btn.primary, 'disabled:opacity-50')}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </motion.div>

          {/* Prévisualisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={cn(tokens.card.base, tokens.card.padding)}
          >
            <button
              onClick={() => {
                setPreviewOpen(prev => !prev)
                if (!previewOpen) setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
              }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-stone-400" />
                <h3 className="text-[13px] font-semibold text-black">Prévisualisation</h3>
              </div>
              {previewOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </button>

            {previewOpen && (
              <div ref={previewRef} className="mt-6 flex flex-col items-center gap-4">
                
                {/* Sélecteur */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPreviewTarget('depot'); setPreviewKey(prev => prev + 1) }}
                    className={cn('py-2 px-4 rounded-full text-[12px] font-semibold transition-all', previewTarget === 'depot' ? 'bg-black text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}
                  >
                    Dépôt
                  </button>
                  <button
                    onClick={() => { setPreviewTarget('galerie'); setPreviewKey(prev => prev + 1) }}
                    className={cn('py-2 px-4 rounded-full text-[12px] font-semibold transition-all', previewTarget === 'galerie' ? 'bg-black text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}
                  >
                    Galerie
                  </button>
                </div>

                {/* Iframe */}
                <div
                  className="relative overflow-hidden"
                  style={{ width: '320px', height: `${Math.round(844 * 320 / 390)}px`, borderRadius: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '6px solid #1c1c1e', background: '#1c1c1e' }}
                >
                  <div style={{ width: '390px', height: '844px', transformOrigin: 'top left', transform: `scale(${320 / 390})`, position: 'absolute', top: 0, left: 0 }}>
                    <iframe
                      key={previewKey}
                      src={previewTarget === 'depot'
                        ? `/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}?preview=1`
                        : `/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}?preview=1`
                      }
                      style={{ width: '390px', height: '844px', border: 'none' }}
                      title="Prévisualisation"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Déconnexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-4 px-6 bg-red-50 text-red-500 border border-red-100 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            ) : (
              <div className={cn(tokens.card.base, tokens.card.padding, 'flex flex-col gap-3')}>
                <p className={cn(tokens.text.body, 'text-center')}>Où souhaitez-vous être redirigé ?</p>
                <button
                  onClick={() => handleLogout('depot')}
                  className={tokens.btn.secondary}
                >
                  Plateforme de dépôt
                </button>
                <button
                  onClick={() => handleLogout('galerie')}
                  className={tokens.btn.secondary}
                >
                  Galerie digitale
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={cn(tokens.btn.ghost, 'justify-center')}
                >
                  Annuler
                </button>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </AppLayout>
  )
}