import type { DepotSettings, FontFamily } from '@/types'

export interface BannerSwatch { label: string; color: string }
export interface ThemeSwatch { label: string; color: string; buttonColor: string; titleColor: string; buttonTextColor: string }

export const BANNER_COLORS: BannerSwatch[] = [
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

export const THEME_COLORS: ThemeSwatch[] = [
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