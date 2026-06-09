'use client'

import { cn } from '@/components/shadcn/utils'
import { tokens } from '@/lib/design-tokens'

export default function CamoriaFooter() {
  return (
    <footer className="px-5 py-8 mt-4">
      <div className={tokens.card.subtle}>
        <h2 className="font-['Lora'] italic font-medium text-[16px] text-black mb-1.5">
          Vous avez aimé l'expérience ?
        </h2>
        <p className={cn(tokens.text.body, 'mb-4 max-w-[240px] text-[12px]')}>
          Offrez ce même niveau d'excellence pour votre prochain événement.
        </p>
        <div className="flex w-full gap-2">
          <button className={cn(tokens.btn.sm, 'flex-1 bg-white text-black border border-stone-200/80 hover:bg-stone-50')}>
            <span>Laisser un avis</span>
          </button>
          <button className={cn(tokens.btn.sm, 'flex-1 bg-black text-white hover:bg-stone-800')}>
            <span>Découvrir</span>
          </button>
        </div>
      </div>
    </footer>
  )
}