import logoBolt from '@/assets/images/logobolt.png'
import logoBoltBlack from '@/assets/images/logobolt-black.png'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  variant?: 'white' | 'black'
}

export default function LogoPill({ variant = 'white' }: Props) {
  return (
    <div className={cn(tokens.header.logoPill, variant === 'white' ? 'bg-transparent border-0' : '')}>
      <img
        src={variant === 'white' ? logoBolt.src : logoBoltBlack.src}
        alt="Logo"
        className="h-8 object-contain drop-shadow-lg"
      />
    </div>
  )
}