'use client'

import { useState } from 'react'
import { Copy, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  galerieUrl: string
}

export default function GalerieSection({ galerieUrl }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(galerieUrl)
    toast.success('Lien galerie copié !')
  }

  return (
    <div className={cn(tokens.card.base, tokens.card.padding)}>
      <div className={tokens.section.cardHeader}>
        <div className={cn(tokens.section.cardAccent, 'bg-[#6b7562]')} />
        <h2 className={cn(tokens.text.cardTitle, 'text-[#4E5941]')}>Galerie digitale</h2>
      </div>
      <p className={cn(tokens.text.body, 'mb-6')}>
        Transmettez ce lien à vos invités pour qu'ils puissent visionner la galerie.
      </p>

      <button
        onClick={copyToClipboard}
        className={cn(tokens.btn.secondary, 'justify-between mb-4')}
      >
        <span className="truncate mr-2 text-stone-400 text-left text-[12px]">{galerieUrl}</span>
        <div className="flex items-center gap-2 text-black shrink-0">
          <Copy className="w-4 h-4" />
          <span>Copier</span>
        </div>
      </button>

      <div className="border-t border-stone-100 pt-2">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center justify-between w-full py-3 text-left"
        >
          <span className="text-[13px] font-semibold text-[#4E5941]">Que puis-je faire dans ma galerie ?</span>
          <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform duration-300', showHelp && 'rotate-180')} />
        </button>
        {showHelp && (
          <div className="pb-2">
            <div className={cn(tokens.card.alt, 'p-4 space-y-4')}>
              {[
                { title: '1. Télécharger en HD', desc: 'Récupérez toutes les photos et vidéos dans leur qualité originale.' },
                { title: '2. Masquer des médias', desc: 'Masquez certaines photos pour qu\'elles n\'apparaissent pas sur la galerie publique.' },
                { title: '3. Gérer le livre d\'or', desc: 'Masquez les messages que vous ne souhaitez pas afficher.' },
              ].map((item, i) => (
                <div key={i}>
                  {i > 0 && <div className="h-px w-full bg-stone-200/50 mb-4" />}
                  <h4 className="text-[12px] font-bold text-[#4E5941] mb-1">{item.title}</h4>
                  <p className={cn(tokens.text.body, 'text-[11px]')}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}