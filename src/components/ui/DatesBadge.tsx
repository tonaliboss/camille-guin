import { Calendar, HardDrive, Film } from 'lucide-react'
import { WEDDING_DATE, formatDate, getStorageExpiryDate, getVideoDeliveryDate } from '@/lib/dates'

export default function DatesBadge() {
  return (
    <div className="bg-[#EDE3DC]/50 backdrop-blur-md p-3.5 rounded-[24px] border border-[#EDE3DC] shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3 pb-3 border-b border-stone-100/80 px-1">
        <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
          <Calendar strokeWidth={1.5} className="w-4 h-4 text-[#4E5941]" />
        </div>
        <div className="flex flex-col">
          <p className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Événement</p>
          <p className="text-[16px] font-bold leading-none font-lora-italic">
            {formatDate(WEDDING_DATE)}
          </p>
        </div>
      </div>

      <div className="flex divide-x divide-stone-100/80 pt-1">
        <div className="flex-1 flex items-center gap-2 px-2">
          <HardDrive strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <div className="flex flex-col">
            <p className="text-[8px] font-bold tracking-widest uppercase text-stone-400 mb-1">Stockage</p>
            <p className="text-[10px] font-medium text-stone-500 leading-normal">
              jusqu'au {getStorageExpiryDate()}
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 px-2 pl-3">
          <Film strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <div className="flex flex-col">
            <p className="text-[8px] font-bold tracking-widest uppercase text-stone-400 mb-1">Vidéo montée</p>
            <p className="text-[10px] font-medium text-stone-500 leading-normal">
              disponible le {getVideoDeliveryDate()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}