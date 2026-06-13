'use client'

import { useState, useRef, useEffect } from 'react'
import { Star, ExternalLink, X, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/components/shadcn/utils'
import { tokens } from '@/lib/design-tokens'
import { toast } from 'sonner'
import type { DepotSettings } from '@/types'

interface Props {
  settings: DepotSettings
}

export default function CamoriaFooter({ settings }: Props) {
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showReview) {
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350)
    }
  }, [showReview])

  const handleSubmit = async () => {
    if (!rating) { toast.warning('Veuillez sélectionner une note'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, author }),
      })
      if (!res.ok) throw new Error()
      toast.success('Merci pour votre avis !')
      setShowReview(false)
      setRating(0)
      setComment('')
      setAuthor('')
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    const url = process.env.NEXT_PUBLIC_CAMORIA_URL ?? ''
    const text = `Salut ! Je suis à un événement en ce moment et ils utilisent ce service pour récupérer les photos, vidéos & messages des invités. Je trouve ça vraiment sympa, je me suis dit que ça pourrait t'intéresser ☺️ :`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Camoria Memories', text, url })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        toast.error('Erreur lors du partage')
      }
    } else {
      navigator.clipboard.writeText(`${text}${url}`)
      toast.success('Lien copié !')
    }
  }

  return (
    <footer className="px-5 py-8 mt-4">
      <div
        className={cn(tokens.card.subtle, 'border-0')}
        style={{ backgroundColor: settings.footerColor ?? '#F2EBE0' }}
      >
        <h2 className="italic font-bold text-[18px] mb-2 leading-tight font-['Inter']">Vous avez aimé l'expérience ?</h2>
        <p className={cn(tokens.text.body, 'mb-4 max-w-[240px] text-[12px]')}>
          Offrez ce même niveau d'excellence pour votre prochain événement.
        </p>

        <AnimatePresence>
          {showReview && (
            <motion.div
              ref={reviewRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-4 space-y-3">

                <div className="flex justify-end">
                  <button onClick={() => setShowReview(false)} className={tokens.btn.ghost}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-400'
                        )}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className={cn(tokens.input.textarea, 'h-20 text-[12px]')}
                  placeholder="Votre avis (facultatif)"
                />

                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className={cn(tokens.input.base, 'text-[12px]')}
                  placeholder="Votre nom (facultatif)"
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !rating}
                  className={cn(tokens.btn.primary, 'disabled:opacity-50')}
                  style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
                >
                  {submitting ? 'Envoi...' : 'Envoyer mon avis'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-full gap-2">
          <button
            onClick={handleShare}
            className={cn(tokens.btn.sm, 'flex-1 border')}
            style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
          >
            <Share2 className="w-3 h-3" />
            <span>Partager</span>
          </button>
          <button
            onClick={() => setShowReview(!showReview)}
            className={cn(tokens.btn.sm, 'flex-1 bg-white text-black border border-stone-200/80 hover:bg-stone-50')}
          >
            <Star className="w-3 h-3" />
            <span>Laisser un avis</span>
          </button>
          <a
            href={process.env.NEXT_PUBLIC_CAMORIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(tokens.btn.sm, 'flex-1')}
            style={{ backgroundColor: settings.themeColor, color: settings.buttonTextColor }}
          >
            <span>Découvrir</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}