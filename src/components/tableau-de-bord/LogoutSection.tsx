'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

export default function LogoutSection() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showConfirm) {
      setTimeout(() => confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
  }, [showConfirm])

  const handleLogout = async (redirectTo: 'depot' | 'galerie') => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push(redirectTo === 'depot'
      ? `/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`
      : `/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`
    )
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-4 px-6 bg-red-50 text-red-500 border border-red-100 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>
    )
  }

  return (
    <div ref={confirmRef} className={cn(tokens.card.base, tokens.card.padding, 'flex flex-col gap-3')}>
      <p className={cn(tokens.text.body, 'text-center')}>Où souhaitez-vous être redirigé ?</p>
      <button onClick={() => handleLogout('depot')} className={tokens.btn.secondary}>
        Plateforme de dépôt
      </button>
      <button onClick={() => handleLogout('galerie')} className={tokens.btn.secondary}>
        Galerie digitale
      </button>
      <button onClick={() => setShowConfirm(false)} className={cn(tokens.btn.ghost, 'justify-center')}>
        Annuler
      </button>
    </div>
  )
}