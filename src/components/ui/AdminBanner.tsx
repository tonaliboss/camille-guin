'use client'

import { Shield, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminBanner() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="bg-stone-800 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Shield size={16} />
        Mode admin
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-sm text-stone-300 hover:text-white transition-colors"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  )
}