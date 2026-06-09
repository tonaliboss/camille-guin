'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { QrCode, Images, User } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import type { UserRole } from '@/types'
import { usePreviewMode } from '@/hooks/usePreviewMode'

interface Props {
  children: React.ReactNode
  token: string
  role: UserRole
}

export default function AppLayout({ children, token, role }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { isPreview } = usePreviewMode()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  const isDepot = pathname === `/depot/${token}` || pathname.startsWith(`/depot/${token}/`) && !pathname.includes('galerie')
  const isGalerie = pathname.startsWith(`/galerie/${token}`)
  const isProfil = pathname.includes('profil') || pathname.includes('personnaliser')

  const navItems = [
    {
      icon: QrCode,
      label: 'Plateforme\nde dépôt',
      active: isDepot,
      onClick: () => router.push(`/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`),
    },
    {
      icon: Images,
      label: 'Galerie\ndigitale',
      active: isGalerie,
      onClick: () => router.push(`/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`),
    },
    {
      icon: User,
      label: 'Tableau\nde bord',
      active: isProfil,
      onClick: () => router.push('/tableau-de-bord')
    },
  ]

  return (
    <div className={tokens.layout.page}>
      <div className={tokens.layout.container}>
        <div className="flex-1">
          {children}
        </div>

        {role === 'admin' && !isPreview && (
          <div className="sticky bottom-6 mx-5 bg-white/50 backdrop-blur-2xl border border-stone-300/50 rounded-full px-2 py-3 flex justify-between items-center z-50 shadow-nav mb-6">
            {navItems.map(({ icon: Icon, label, active, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 transition-colors flex-1',
                  active ? tokens.nav.itemActive : tokens.nav.itemInactive
                )}
              >
                <Icon strokeWidth={active ? 2 : 1.5} className="w-5 h-5" />
                <span className={tokens.text.navLabel}>
                  {label.split('\n').map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        )}
    </div>
  </div>
)
}