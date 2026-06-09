import logoBolt from '@/assets/images/logobolt.png'
import { tokens } from '@/lib/design-tokens'

export default function LogoPill() {
  return (
    <div className={tokens.header.logoPill}>
      <img src={logoBolt.src} alt="Logo" className="h-10 object-contain drop-shadow-lg" />
    </div>
  )
}