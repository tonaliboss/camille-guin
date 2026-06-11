'use client'

import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/components/shadcn/utils'
import { tokens } from '@/lib/design-tokens'

interface Props {
  hidden: boolean
  onChange: (hidden: boolean) => void
}

export default function HiddenToggle({ hidden, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!hidden)}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold border transition-all w-full',
        hidden
          ? 'bg-stone-800 text-white border-stone-800'
          : 'bg-white text-stone-400 border-stone-200'
      )}
    >
      {hidden
        ? <EyeOff className="w-4 h-4 shrink-0" />
        : <Eye className="w-4 h-4 shrink-0" />
      }
      {hidden ? 'Sera masqué pour les invités' : 'Visible par tous les invités'}
    </button>
  )
}