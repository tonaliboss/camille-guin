'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { toast } from 'sonner'

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
    <div className={tokens.layout.page}>
      <div className={cn(tokens.layout.container, 'flex items-center justify-center p-8')}>
        <div className="w-full">
          {from && (
            <button
              onClick={() => router.push(from)}
              className={cn(tokens.btn.ghost, 'mb-6')}
            >
              <ArrowLeft size={18} />
              Retour
            </button>
          )}

          <div className={cn(tokens.card.base, tokens.card.padding)}>
            <div className={cn(tokens.icon.container, 'mb-5 mx-auto')}>
              <Lock strokeWidth={1.5} className="w-6 h-6" />
            </div>

            <h2 className={cn(tokens.text.cardTitle, 'text-center mb-2')}>
              Code d'accès admin
            </h2>
            <p className={cn(tokens.text.body, 'text-center mb-6')}>
              Entrez votre code d'accès
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                placeholder="------"
                className={cn(
                  tokens.input.base,
                  'text-center text-lg tracking-widest font-mono',
                  error && tokens.input.error
                )}
                autoFocus
              />
              {error && (
                <p className="text-[12px] text-red-400 text-center">Code incorrect</p>
              )}
              <button
                type="submit"
                disabled={isLoading || code.length === 0}
                className={cn(tokens.btn.primary, 'disabled:opacity-50')}
              >
                {isLoading ? 'Vérification...' : 'Accéder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}