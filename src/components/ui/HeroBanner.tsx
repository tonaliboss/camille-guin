'use client'

import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import { tokens } from '@/lib/design-tokens'
import LogoPill from '@/components/ui/LogoPill'
import banniereBg from '@/assets/images/banniere.png'
import type { UserRole, DepotSettings } from '@/types'

interface Props {
  role: UserRole
  settings: DepotSettings
  connexionPath: string
  children?: React.ReactNode
}

export default function HeroBanner({ role, settings, connexionPath, children }: Props) {
  const router = useRouter()
  const { isPreview } = usePreviewMode()

  const bannerStyle = settings.bannerType === 'solid'
    ? { backgroundColor: settings.bannerColor }
    : undefined

  const bannerSrc = settings.bannerType === 'custom' && settings.bannerImageUrl
    ? settings.bannerImageUrl
    : settings.bannerType === 'image'
    ? banniereBg.src
    : null

  return (
    <section className="relative h-[75vh] shrink-0">
      {bannerSrc ? (
        <img src={bannerSrc} alt="Bannière" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={bannerStyle} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className={tokens.header.floating}>
        <div className="w-9" />
        <LogoPill />
        {role !== 'admin' ? (
          <button
            onClick={() => !isPreview && router.push(connexionPath)}
            className={tokens.header.iconBtn}
            disabled={isPreview}
          >
            <User strokeWidth={1.5} className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {children}
    </section>
  )
}