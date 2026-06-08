'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { QrCode, Images, User } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import type { UserRole } from '@/types'

interface Props {
  children: React.ReactNode
  token: string
  role: UserRole
}

export default function AppLayout({ children, token, role }: Props) {
  const pathname = usePathname()
  const router = useRouter()

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
      onClick: () => router.push(`/depot/${token}`),
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
      onClick: () => role === 'admin'
        ? router.push(`/depot/${token}/personnaliser`)
        : router.push(`/connexion?from=/depot/${token}`),
    },
  ]

  return (
    <div className={tokens.layout.page}>
      <div className={tokens.layout.container}>
        {children}

        {/* Navigation pill flottante */}
        <div className={tokens.nav.pill}>
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
      </div>
    </div>
  )
}