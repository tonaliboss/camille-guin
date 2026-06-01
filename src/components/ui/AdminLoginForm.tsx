'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft } from 'lucide-react'

interface Props {
  from?: string
}

export default function AdminLoginForm({ from }: Props) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    if (value.length <= 6) setCode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (res.ok) {
      router.push(from ?? '/')
    } else {
      setError(true)
      setCode('')
      setTimeout(() => setError(false), 2000)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen magical-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {from && (
          <button
            onClick={() => router.push(from)}
            className="mb-6 flex items-center text-brown/60 hover:text-brown transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
        )}

        <div className="bg-white/90 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-brown" />
            </div>
          </div>

          <h2 className="font-lora text-2xl text-center text-brown mb-2">
            Code d'accès admin
          </h2>
          <p className="text-center text-brown/60 mb-6">
            Entrez votre code d'accès
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                placeholder="------"
                className={`w-full px-4 py-3 border-2 rounded-md text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-beige/50 focus:border-sage focus:ring-sage/20'
                }`}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">Code incorrect</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length === 0}
              className="btn-primary w-full py-3"
            >
              {isLoading ? 'Vérification...' : 'Accéder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}