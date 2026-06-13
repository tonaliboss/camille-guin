'use client'

import { useState, useRef } from 'react'
import { Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  previewKey: number
}

export default function PreviewSection({ previewKey }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'depot' | 'galerie'>('depot')
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn(tokens.card.alt, 'p-4 bg-white')}>
      <button
        onClick={() => {
          setPreviewOpen(prev => !prev)
          if (!previewOpen) setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
        }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-stone-400" />
          <h3 className="text-[13px] font-semibold text-black font-['Inter']">Prévisualisation</h3>
        </div>
        {previewOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {previewOpen && (
        <div ref={previewRef} className="mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setPreviewTarget('depot') }}
              className={cn('py-2 px-4 rounded-full text-[12px] font-semibold transition-all', previewTarget === 'depot' ? 'bg-black text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}
            >
              Dépôt
            </button>
            <button
              onClick={() => { setPreviewTarget('galerie') }}
              className={cn('py-2 px-4 rounded-full text-[12px] font-semibold transition-all', previewTarget === 'galerie' ? 'bg-black text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}
            >
              Galerie
            </button>
          </div>

          <div
            className="relative overflow-hidden"
            style={{ width: '320px', height: `${Math.round(844 * 320 / 390)}px`, borderRadius: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '6px solid #1c1c1e', background: '#1c1c1e' }}
          >
            <div style={{ width: '390px', height: '844px', transformOrigin: 'top left', transform: `scale(${320 / 390})`, position: 'absolute', top: 0, left: 0 }}>
              <iframe
                key={previewKey}
                src={previewTarget === 'depot'
                  ? `/depot/${process.env.NEXT_PUBLIC_DEPOT_TOKEN}?preview=1`
                  : `/galerie/${process.env.NEXT_PUBLIC_GALERIE_TOKEN}?preview=1`
                }
                style={{ width: '390px', height: '844px', border: 'none' }}
                title="Prévisualisation"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}