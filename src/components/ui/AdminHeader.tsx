'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, Shield, ChevronDown, Upload, Camera, Settings } from 'lucide-react'
import type { UserRole } from '@/types'

interface Props {
  role: UserRole
  token: string
  context: 'depot' | 'galerie'
  themeColor?: string
}

export default function AdminHeader({ role, token, context, themeColor = '#71805C' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
    setOpen(false)
  }

  return (
    <div className="flex justify-end items-center px-4 py-3 gap-3" style={{ backgroundColor: themeColor }}>
      {role === 'admin' ? (
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <Shield size={16} />
            Mode admin
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-100 overflow-hidden z-50">
              {context === 'galerie' && (
                <button
                  onClick={() => { router.push(`/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}`); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-brown hover:bg-stone-50 transition-colors"
                >
                  <Upload size={16} />
                  Plateforme de dépôt
                </button>
              )}
              {context === 'depot' && (
                <button
                  onClick={() => { router.push(`/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}`); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-brown hover:bg-stone-50 transition-colors"
                >
                  <Camera size={16} />
                  Galerie
                </button>
              )}
              <button
                onClick={() => { router.push(`/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}/personnaliser`); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-brown hover:bg-stone-50 transition-colors"
              >
                <Settings size={16} />
                Personnaliser la plateforme
              </button>
              <div className="border-t border-stone-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => router.push(`/connexion?from=${context === 'depot' ? `/depot/${token}` : `/galerie/${token}`}`)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
        >
          <LogIn size={16} />
          Se connecter
        </button>
      )}
    </div>
  )
}