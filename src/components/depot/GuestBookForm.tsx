'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { saveMessage } from '@/lib/media'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'
import { usePreviewMode } from '@/hooks/usePreviewMode'
import { toast } from 'sonner'

export default function GuestbookForm() {
  const router = useRouter()
  const { executeIfNotPreview } = usePreviewMode()
  const [message, setMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !author.trim()) {
      toast.warning('Veuillez remplir tous les champs')
      return
    }
    executeIfNotPreview(async () => {
      setIsSending(true)
      try {
        await saveMessage(message.trim(), author.trim())
        toast.success('Votre message a été enregistré !')
        router.back()
      } catch {
        toast.error("Une erreur est survenue lors de l'envoi.")
      } finally {
        setIsSending(false)
      }
    })
  }

  return (
    <div>
      <header className="flex items-center px-5 py-4 border-b border-stone-100">
        <button onClick={() => router.back()} className={tokens.btn.ghost}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={cn(tokens.text.title, 'text-[18px] ml-3')}>Livre d'or</h1>
      </header>

      <main className="px-5 py-6">
        <div className={cn(tokens.card.base, tokens.card.padding)}>
          <div className={cn(tokens.icon.container, 'mb-5 mx-auto')}>
            <Send strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <h2 className={cn(tokens.text.cardTitle, 'text-center mb-2')}>Laissez un message</h2>
          <p className={cn(tokens.text.body, 'text-center mb-6')}>Partagez vos vœux aux mariés</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">
                Votre message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className={cn(tokens.input.textarea, 'h-28')}
                placeholder="Écrivez votre message ici..."
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">
                De la part de
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className={tokens.input.base}
                placeholder="Votre nom"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className={cn(tokens.btn.primary, 'mt-2 disabled:opacity-50')}
            >
              <Send size={16} />
              {isSending ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}