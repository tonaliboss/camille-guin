'use client'

import { cn } from '@/components/shadcn/utils'

interface Props {
  hidden: boolean
  onChange: (hidden: boolean) => void
}

export default function HiddenToggle({ hidden, onChange }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-stone-200 bg-white w-full">
      <span className="text-[13px] font-medium text-stone-600">
        {hidden ? 'Sera masqué pour les invités' : 'Visible par tous les invités'}
      </span>
      <button
        type="button"
        onClick={() => onChange(!hidden)}
        aria-label="Basculer la visibilité"
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3',
          hidden ? 'bg-stone-200' : 'bg-green-500'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            hidden ? 'left-0.5' : 'left-[22px]'
          )}
        />
      </button>
    </div>
  )
}