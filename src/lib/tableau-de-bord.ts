import type { DepotSettings, FontFamily } from '@/types'

export interface BannerSwatch { 
  label: string; color: string 
}

export interface ThemeSwatch {
  label: string
  color: string
  buttonColor: string
  titleColor: string
  buttonTextColor: string
  backgroundColor: string
  bannerHeroColor: string
  footerColor: string
}

export const THEME_COLORS: ThemeSwatch[] = [
  { label: 'Feu de bois',     color: '#3C1F0F', buttonColor: '#3C1F0F', titleColor: '#5C3D22', buttonTextColor: '#ffffff', backgroundColor: '#F9F6F2', bannerHeroColor: '#2C1A0E', footerColor: '#F2EBE0' },
  { label: 'Plume',           color: '#3A3935', buttonColor: '#3A3935', titleColor: '#5F5E5A', buttonTextColor: '#F4F3F1', backgroundColor: '#F4F3F1', bannerHeroColor: '#3A3935', footerColor: '#E8E7E3' },
  { label: 'Lin d\'été',      color: '#C4B49A', buttonColor: '#C4B49A', titleColor: '#9A8870', buttonTextColor: '#ffffff', backgroundColor: '#FAFAF8', bannerHeroColor: '#C4B49A', footerColor: '#F2EDE5' },
  { label: 'Soleil couchant', color: '#a7523c', buttonColor: '#a7523c', titleColor: '#6E3324', buttonTextColor: '#FAF3F0', backgroundColor: '#FAF3F0', bannerHeroColor: '#a7523c', footerColor: '#EEDDD6' },
  { label: 'Minuit',          color: '#1b2f47', buttonColor: '#1b2f47', titleColor: '#3D6E8A', buttonTextColor: '#F5F4F2', backgroundColor: '#F5F4F2', bannerHeroColor: '#1b2f47', footerColor: '#E4EAF0' },
  { label: 'Jardin secret',   color: '#A8B49E', buttonColor: '#A8B49E', titleColor: '#5C6E52', buttonTextColor: '#ffffff', backgroundColor: '#F6F8F4', bannerHeroColor: '#A8B49E', footerColor: '#E0E8D8' },
  { label: 'Pivoine',         color: '#E8A8B4', buttonColor: '#E8A8B4', titleColor: '#A05870', buttonTextColor: '#ffffff', backgroundColor: '#F7F6F4', bannerHeroColor: '#E8A8B4', footerColor: '#FBF0F2' },
  { label: 'Champêtre',       color: '#4e5941', buttonColor: '#4e5941', titleColor: '#b2a791', buttonTextColor: '#ffffff', backgroundColor: '#F7F5F0', bannerHeroColor: '#4e5941', footerColor: '#EAE5D8' },
  { label: 'Poudre de fée',   color: '#C2BAD4', buttonColor: '#C2BAD4', titleColor: '#7E7496', buttonTextColor: '#ffffff', backgroundColor: '#FAF9F6', bannerHeroColor: '#C2BAD4', footerColor: '#F4F0FA' },
  { label: 'Passion',         color: '#5C0A1F', buttonColor: '#5C0A1F', titleColor: '#4A0818', buttonTextColor: '#EDE0D6', backgroundColor: '#F8F3F0', bannerHeroColor: '#5C0A1F', footerColor: '#EDE0D6' },
]

export const FONTS: { label: string; value: FontFamily; preview: string }[] = [
  { label: 'Lora',        value: 'Lora',               preview: 'Tiffany & Valentin' },
  { label: 'Playfair',    value: 'Playfair_Display',    preview: 'Tiffany & Valentin' },
  { label: 'Cormorant',   value: 'Cormorant_Garamond',  preview: 'Tiffany & Valentin' },
  { label: 'Great Vibes', value: 'Great_Vibes',         preview: 'Tiffany & Valentin' },
  { label: 'Montserrat',  value: 'Montserrat',          preview: 'Tiffany & Valentin' },
  { label: 'EB Garamond', value: 'EB_Garamond',         preview: 'Tiffany & Valentin' },
]

export async function saveSettings(patch: Partial<DepotSettings>) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
}