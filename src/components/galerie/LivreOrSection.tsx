'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, EyeOff, Eye, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import type { Message, Page, UserRole, DepotSettings } from '@/types'
import { getMessages, toggleMediaVisibility } from '@/lib/media'
import { tokens } from '@/lib/design-tokens'
import { downloadFile } from '@/lib/download'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import { downloadFileAsAttachment } from '@/lib/download'
import { cn } from '@/components/shadcn/utils'

interface Props {
  role: UserRole
  settings: DepotSettings
}

export default function LivreOrSection({ role, settings }: Props) {
  const [messages, setMessages] = useState<(Message & { _id: string })[]>([])
  const [hiddenMessages, setHiddenMessages] = useState<(Message & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [singleDownloading, setSingleDownloading] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward')
  
  
  const INITIAL_HIDDEN = 3
  const [showAllHiddenMessages, setShowAllHiddenMessages] = useState(false)

  const loadMessages = async () => {
    setLoading(true)
    const [pub, hidden] = await Promise.all([
      getMessages(false),
      role === 'admin' ? getMessages(true) : Promise.resolve([]),
    ])
    setMessages(pub)
    setHiddenMessages(hidden)
    setLoading(false)
  }

  useEffect(() => { loadMessages() }, [role])

  const hideMessage = async (item: Message & { _id: string }) => {
    await toggleMediaVisibility(item._id, true)
    await loadMessages()
  }

  const unhideMessage = async (item: Message & { _id: string }) => {
    await toggleMediaVisibility(item._id, false)
    loadMessages()
  }

  const splitMessageIntoPages = (message: string, maxChars: number = 350): string[] => {
    if (message.length <= maxChars) return [message]
    const pages: string[] = []
    let remaining = message
    while (remaining.length > 0) {
      if (remaining.length <= maxChars) { pages.push(remaining); break }
      let cutIndex = maxChars
      const searchText = remaining.substring(0, maxChars)
      const lastPeriod = searchText.lastIndexOf('.')
      if (lastPeriod > maxChars * 0.6) { cutIndex = lastPeriod + 1 }
      else {
        const lastComma = searchText.lastIndexOf(',')
        if (lastComma > maxChars * 0.6) { cutIndex = lastComma + 1 }
        else {
          const lastSpace = searchText.lastIndexOf(' ')
          if (lastSpace > maxChars * 0.6) cutIndex = lastSpace + 1
        }
      }
      pages.push(remaining.substring(0, cutIndex).trim())
      remaining = remaining.substring(cutIndex).trim()
    }
    return pages
  }

  const createPages = (): Page[] => {
    const pages: Page[] = []
    messages.forEach((msg, msgIndex) => {
      const parts = splitMessageIntoPages(msg.message)
      parts.forEach((part, partIndex) => {
        pages.push({
          message: part,
          author: partIndex === parts.length - 1 ? msg.author : '',
          pageNumber: partIndex + 1,
          totalPages: parts.length,
          originalIndex: msgIndex,
          originalMessage: msg,
        })
      })
    })
    return pages
  }

  const allPages = messages.length > 0 ? createPages() : []
  const safePage = Math.min(currentPage, Math.max(allPages.length - 1, 0))
  const currentPageData = allPages[safePage]

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= allPages.length || isFlipping) return
    setFlipDirection(newPage > safePage ? 'forward' : 'backward')
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentPage(newPage)
      setIsFlipping(false)
    }, 800)
  }

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX) }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50 && safePage < allPages.length - 1) handlePageChange(safePage + 1)
    if (distance < -50 && safePage > 0) handlePageChange(safePage - 1)
  }

  const downloadPDF = async (pdf: jsPDF, filename: string, onProgress?: (p: number) => void) => {
    const blob = pdf.output('blob')
    const path = `temp-pdf/${Date.now()}-${filename}`

    onProgress?.(75)
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, blob, {
      contentType: 'application/pdf',
    })
    if (error) {
      console.error(error)
      return
    }

    onProgress?.(90)
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
    await downloadFileAsAttachment(data.publicUrl, filename)
    onProgress?.(100)

    setTimeout(() => {
      supabase.storage.from(BUCKET_NAME).remove([path])
    }, 60_000)
  }

  const createTextCanvas = (text: string, fontFamily: string, fontSize: number, maxWidth: number, textColor: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = maxWidth * 3.78
    ctx.font = `italic ${fontSize * 3.78}px Georgia, serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (ctx.measureText(testLine).width > canvas.width - 40) { if (currentLine) lines.push(currentLine); currentLine = word }
      else currentLine = testLine
    })
    if (currentLine) lines.push(currentLine)
    const lineHeight = fontSize * 3.78 * 1.5
    canvas.height = lines.length * lineHeight + 20

    // Remplir en blanc avant de dessiner (nécessaire pour JPEG, qui n'a pas de transparence)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `italic ${fontSize * 3.78}px Georgia, serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, i * lineHeight + 10))
    return canvas
  }

  const addPDFPage = (pdf: jsPDF, message: string, author: string, pageNum: number, messageIndex: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    const selectedFont = 'Georgia'
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    const shadowWidth = 15
    for (let j = 0; j < shadowWidth; j++) {
      const opacity = 0.12 - (j / shadowWidth) * 0.12
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      ;(pdf as any).setGState(new (pdf as any).GState({ opacity }))
      pdf.line(margin + j, margin, margin + j, pageHeight - margin)
    }
    ;(pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }))
    pdf.setDrawColor(150, 150, 150)
    pdf.setLineWidth(0.3)
    pdf.line(margin, margin, margin, pageHeight - margin)
    pdf.line(margin, margin, pageWidth - margin, margin)
    pdf.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin)
    const messageCanvas = createTextCanvas(message, selectedFont, 10, contentWidth - 40, 'rgb(30, 41, 59)')
    const messageHeight = messageCanvas.height / 3.78
    const messageY = pageHeight / 2 - messageHeight / 2
    pdf.addImage(messageCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin + 20, messageY, contentWidth - 40, messageHeight)
    if (author) {
      const authorCanvas = createTextCanvas(author, selectedFont, 9, contentWidth - 40, 'rgb(55, 65, 81)')
      const authorHeight = authorCanvas.height / 3.78
      pdf.addImage(authorCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin + 20, messageY + messageHeight + 20, contentWidth - 40, authorHeight)
    }
    pdf.setFont('times', 'italic')
    pdf.setFontSize(10)
    pdf.setTextColor(156, 163, 175)
    pdf.text(`${pageNum}`, pageWidth / 2, pageHeight - margin - 5, { align: 'center' })
  }

  const splitMessageForPDF = (msg: string, max: number = 200): string[] => {
    if (msg.length <= max) return [msg]
    const pages: string[] = []
    let remaining = msg
    while (remaining.length > 0) {
      if (remaining.length <= max) { pages.push(remaining); break }
      let cutIndex = max
      const s = remaining.substring(0, max)
      const lp = s.lastIndexOf('.')
      if (lp > max * 0.6) cutIndex = lp + 1
      else { const lc = s.lastIndexOf(','); if (lc > max * 0.6) cutIndex = lc + 1; else { const ls = s.lastIndexOf(' '); if (ls > max * 0.6) cutIndex = ls + 1 } }
      pages.push(remaining.substring(0, cutIndex).trim())
      remaining = remaining.substring(cutIndex).trim()
    }
    return pages
  }

  const downloadCurrentPageAsPDF = async () => {
    if (!allPages.length || singleDownloading) return
    setSingleDownloading('current')
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const p = allPages[safePage]
      const parts = splitMessageForPDF(p.originalMessage.message)
      parts.forEach((part, i) => {
        if (i > 0) pdf.addPage()
        addPDFPage(pdf, part, i === parts.length - 1 ? p.originalMessage.author : '', i + 1, p.originalIndex)
      })
      await downloadPDF(pdf, `message-${p.originalIndex + 1}.pdf`)
    } finally {
      setSingleDownloading(null)
    }
  }

  const downloadSingleMessageAsPDF = async (msg: Message & { _id: string }, index: number, filename: string) => {
    if (singleDownloading) return
    setSingleDownloading(msg._id)
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const parts = splitMessageForPDF(msg.message)
      parts.forEach((part, i) => {
        if (i > 0) pdf.addPage()
        addPDFPage(pdf, part, i === parts.length - 1 ? msg.author : '', i + 1, index)
      })
      await downloadPDF(pdf, filename)
    } finally {
      setSingleDownloading(null)
    }
  }

  const downloadMessagesAsPDF = async (msgs: (Message & { _id: string })[], filename: string) => {
    if (!msgs.length || downloading) return
    setDownloading(true)
    setDownloadProgress(10)
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfPages: { message: string; author: string; pageNumber: number; messageIndex: number }[] = []
      msgs.forEach((msg, msgIndex) => {
        const parts = splitMessageForPDF(msg.message)
        parts.forEach((part, partIndex) => {
          pdfPages.push({ message: part, author: partIndex === parts.length - 1 ? msg.author : '', pageNumber: pdfPages.length + 1, messageIndex: msgIndex })
        })
      })
      for (let i = 0; i < pdfPages.length; i++) {
        if (i > 0) pdf.addPage()
        const p = pdfPages[i]
        addPDFPage(pdf, p.message, p.author, p.pageNumber, p.messageIndex)
        setDownloadProgress(10 + ((i + 1) / pdfPages.length) * 80)
        await new Promise(r => setTimeout(r, 10))
      }
      setDownloadProgress(95)
      await downloadPDF(pdf, filename)
      setDownloadProgress(100)
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  if (loading) return (
    <section id="livre-or" className="py-12 px-5">
      <p className={cn(tokens.text.body, 'text-center')}>Chargement...</p>
    </section>
  )

  return (
    <section id="livre-or" className="py-12 px-5 scroll-mt-28">
      <div className="text-center mb-8 flex flex-col items-center">
        <span className={tokens.section.eyebrow}>Les mots qui réchauffent le cœur</span>
        <div className="flex items-center gap-4 mt-2">
          <div className={tokens.section.divider} />
          <h2 className={tokens.section.title}>Livre d'Or</h2>
          <div className={tokens.section.divider} />
        </div>
        {allPages.length > 0 && (
          <p className="text-[11px] text-stone-400 mt-2">{allPages.length} élément{allPages.length > 1 ? 's' : ''}</p>
        )}
      </div>

      {role === 'admin' && allPages.length > 0 && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <button onClick={() => downloadMessagesAsPDF(messages, 'livre-or.pdf')} disabled={downloading} className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50">
            <Download className="w-6 h-6 text-stone-300" />
          </button>
          {downloading && (
            <div className="w-48">
              <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-stone-400 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
              </div>
              <p className="text-xs text-stone-400 text-center mt-1">{Math.round(downloadProgress)}%</p>
            </div>
          )}
        </div>
      )}

      {allPages.length === 0 ? (
        <p className={cn(tokens.text.body, 'text-center')}>Aucun message disponible</p>
      ) : (
        <>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id="curvedPageClip" clipPathUnits="objectBoundingBox">
              <path d="M 0,0.01 Q 0.5,0.005 0.97,0.015 Q 0.985,0.25 0.98,0.5 Q 0.985,0.75 0.97,0.985 Q 0.5,0.995 0,0.99 L 0,0.01 Z" />
            </clipPath>
          </defs>
        </svg>

        <div
          className="relative bg-white rounded-[32px] shadow-card border border-stone-100/80 px-8 py-14 flex flex-col items-center justify-center min-h-[340px] overflow-hidden"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Bande reliure gauche */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.08) 0%, transparent 100%)' }}
          />
            {role === 'admin' && (
              <button
                onClick={() => hideMessage(currentPageData.originalMessage)}
                className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-black transition-colors"
                title="Masquer ce message"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            )}

            {isFlipping && (
              <div
                className="absolute inset-0 bg-white z-20"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  transformOrigin: 'left center',
                  animation: flipDirection === 'forward'
                    ? 'flipPageForward 0.8s ease-in-out forwards'
                    : 'flipPageBackward 0.8s ease-in-out forwards',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  clipPath: 'url(#curvedPageClip)',
                  WebkitClipPath: 'url(#curvedPageClip)',
                }}
              >
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="text-[40px] font-serif text-stone-200 leading-none h-6 mb-4">"</div>
                  <p className="italic text-[20px] leading-[1.6] text-black mb-8 px-4 text-center">
                    {currentPageData.message}
                  </p>
                  {currentPageData.author && (
                    <p className="font-bold text-[10px] tracking-[0.2em] uppercase text-stone-400">
                      {currentPageData.author}
                    </p>
                  )}
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                    animation: 'pageShadow 0.8s ease-in-out',
                  }}
                />
              </div>
            )}

            <div className="text-center w-full">
              <div className="text-[40px] font-serif text-stone-200 leading-none h-6 mb-4">"</div>
              <p className="italic text-[20px] leading-[1.6] text-black mb-8 px-4">
                {currentPageData.message}
              </p>
              {currentPageData.author && (
                <p className="font-bold text-[10px] tracking-[0.2em] uppercase text-stone-400">
                  {currentPageData.author}
                </p>
              )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 0 || isFlipping}
                className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-black transition-colors disabled:opacity-20"
              >
                <ChevronLeft strokeWidth={1} className="w-6 h-6" />
              </button>
              <button
                onClick={downloadCurrentPageAsPDF}
                disabled={!!singleDownloading}
                className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-black transition-colors disabled:opacity-50"
              >
                {singleDownloading === 'current' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === allPages.length - 1 || isFlipping}
                className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-black transition-colors disabled:opacity-20"
              >
                <ChevronRight strokeWidth={1} className="w-6 h-6" />
              </button>
            </div>
          </div></>
      )}

      {role === 'admin' && hiddenMessages.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-100">
          <div className="text-center mb-6 flex flex-col items-center">
            <span className={tokens.section.eyebrow}>Contenu masqué</span>
            <div className="flex items-center gap-4 mt-2">
              <div className={tokens.section.divider} />
              <h3 className={tokens.section.title}>Messages masqués</h3>
              <div className={tokens.section.divider} />
            </div>
            {hiddenMessages.length > 0 && (
              <p className="text-[11px] text-stone-400 mt-2">{hiddenMessages.length} élément{hiddenMessages.length > 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 mb-6">
            <button
              onClick={() => downloadMessagesAsPDF(hiddenMessages, 'livre-or-masque.pdf')}
              disabled={downloading}
              className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50"
              title="Télécharger tous les messages masqués"
            >
              <Download className="w-6 h-6 text-stone-300" />
            </button>
            {downloading && (
              <div className="w-48">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                </div>
                <p className="text-xs text-stone-400 text-center mt-1">{Math.round(downloadProgress)}%</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {hiddenMessages.slice(0, showAllHiddenMessages ? undefined : INITIAL_HIDDEN).map((msg, index) => (
              <div key={msg._id} className={cn(tokens.card.base, 'px-6 py-5 relative')}>
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => downloadSingleMessageAsPDF(msg, index, `message-${index + 1}.pdf`)}
                    disabled={!!singleDownloading}
                    className="p-1.5 text-stone-300 hover:text-black transition-colors disabled:opacity-50"
                    title="Télécharger ce message"
                  >
                    {singleDownloading === msg._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => unhideMessage(msg)}
                    className="p-1.5 text-stone-300 hover:text-black transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <p className="italic text-[16px] text-black leading-relaxed text-center">{msg.message}</p>
                {msg.author && (
                  <p className="text-[10px] tracking-widest uppercase text-stone-400 text-center mt-3">{msg.author}</p>
                )}
              </div>
            ))}
          </div>
          {hiddenMessages.length > INITIAL_HIDDEN && (
            <button
              onClick={() => setShowAllHiddenMessages(!showAllHiddenMessages)}
              className={cn(tokens.btn.outline, 'mt-4')}
              style={{ backgroundColor: settings.themeColor + '15', color: settings.themeColor, borderColor: settings.themeColor + '30' }}
            >
              {showAllHiddenMessages ? 'Voir moins' : `Voir tout (+${hiddenMessages.length - INITIAL_HIDDEN})`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}