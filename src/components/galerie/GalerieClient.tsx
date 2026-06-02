'use client'

import type { UserRole } from '@/types'
import AdminHeader from '@/components/ui/AdminHeader'
import Hero from '@/components/galerie/Hero'
import Navigation from '@/components/galerie/Navigation'
import GalerieSection from '@/components/galerie/GalerieSection'
import LivreOrSection from '@/components/galerie/LivreOrSection'
import VoeuxAudioSection from '@/components/galerie/VoeuxAudioSection'

interface Props {
  role: UserRole
  token: string
}

export default function GalerieClient({ role, token }: Props) {
  return (
    <div className="min-h-screen bg-white relative">
      <AdminHeader role={role} token={token} context="galerie" />
      <Hero />
      <Navigation />
      <GalerieSection role={role} />
      <LivreOrSection role={role} />
      <VoeuxAudioSection role={role} />
      <footer className="py-8" style={{ backgroundColor: '#4e5941' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-white">Galerie créée par CAMORIA MEMORIES</p>
        </div>
      </footer>
    </div>
  )
}