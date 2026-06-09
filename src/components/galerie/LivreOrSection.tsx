'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, EyeOff, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import jsPDF from 'jspdf'
import { getMessages, toggleMediaVisibility } from '@/lib/media'
import type { Message, Page, UserRole } from '@/types'
import { tokens } from '@/lib/design-tokens'
import { cn } from '@/components/shadcn/utils'

interface Props {
  role: UserRole
}

export default function LivreOrSection({ role }: Props) {
  const [messages, setMessages] = useState<(Message & { _id: string })[]>([])
  const [hiddenMessages, setHiddenMessages] = useState<(Message & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

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
    if (currentPage >= allPages.length - 1 && currentPage > 0) setCurrentPage(currentPage - 1)
    loadMessages()
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

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= allPages.length) return
    setCurrentPage(newPage)
  }

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX) }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50 && currentPage < allPages.length - 1) handlePageChange(currentPage + 1)
    if (distance < -50 && currentPage > 0) handlePageChange(currentPage - 1)
  }

  // ── PDF (logique inchangée) ──────────────────────────────────────────────

  const createTextCanvas = (text: string, fontFamily: string, fontSize: number, maxWidth: number, textColor: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = maxWidth * 3.78
    ctx.font = `${fontSize * 3.78}px ${fontFamily}`
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
    ctx.font = `${fontSize * 3.78}px ${fontFamily}`
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
    const fonts = ['Parisienne', 'Sacramento', 'Alex Brush']
    const selectedFont = fonts[messageIndex % fonts.length]
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    const shadowWidth = 15
    for (let j = 0; j < shadowWidth; j++) {
      const opacity = 0.12 - (j / shadowWidth) * 0.12
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.setGState(new (pdf as any).GState({ opacity }))
      pdf.line(margin + j, margin, margin + j, pageHeight - margin)
    }
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }))
    pdf.setDrawColor(150, 150, 150)
    pdf.setLineWidth(0.3)
    pdf.line(margin, margin, margin, pageHeight - margin)
    pdf.line(margin, margin, pageWidth - margin, margin)
    pdf.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin)
    const messageCanvas = createTextCanvas(message, selectedFont, 10, contentWidth - 40, 'rgb(30, 41, 59)')
    const messageHeight = messageCanvas.height / 3.78
    const messageY = pageHeight / 2 - messageHeight / 2
    pdf.addImage(messageCanvas.toDataURL('image/png'), 'PNG', margin + 20, messageY, contentWidth - 40, messageHeight)
    if (author) {
      const authorCanvas = createTextCanvas(author, selectedFont, 9, contentWidth - 40, 'rgb(55, 65, 81)')
      const authorHeight = authorCanvas.height / 3.78
      pdf.addImage(authorCanvas.toDataURL('image/png'), 'PNG', margin + 20, messageY + messageHeight + 20, contentWidth - 40, authorHeight)
    }
    pdf.setFont('times', 'italic')
    pdf.setFontSize(10)
    pdf.setTextColor(156, 163, 175)
    pdf.text(`${pageNum}`, pageWidth / 2, pageHeight - margin - 5, { align: 'center' })
  }

  const downloadCurrentPageAsPDF = () => {
    if (!allPages.length) return
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const p = allPages[currentPage]
    addPDFPage(pdf, p.message, p.author, currentPage + 1, p.originalIndex)
    pdf.save(`page-${currentPage + 1}.pdf`)
  }

  const downloadAllAsPDF = async () => {
    if (!messages.length || downloading) return
    setDownloading(true)
    setDownloadProgress(10)
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const splitMessageForPDF = (msg: string, max: number = 550): string[] => {
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
      const pdfPages: { message: string; author: string; pageNumber: number; messageIndex: number }[] = []
      messages.forEach((msg, msgIndex) => {
        const parts = splitMessageForPDF(msg.message)
        parts.forEach((part, partIndex) => {
          pdfPages.push({ message: part, author: partIndex === parts.length - 1 ? msg.author : '', pageNumber: pdfPages.length + 1, messageIndex: msgIndex })
        })
      })
      for (let i = 0; i < pdfPages.length; i++) {
        if (i > 0) pdf.addPage()
        const p = pdfPages[i]
        addPDFPage(pdf, p.message, p.author, p.pageNumber, p.messageIndex)
        setDownloadProgress(10 + ((i + 1) / pdfPages.length) * 85)
        await new Promise(r => setTimeout(r, 10))
      }
      setDownloadProgress(100)
      pdf.save('livre-or.pdf')
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <section id="livre-or" className="py-12 px-5">
      <p className={cn(tokens.text.body, 'text-center')}>Chargement...</p>
    </section>
  )

  const currentPageData = allPages[currentPage]

  return (
    <section id="livre-or" className="py-12 px-5 scroll-mt-28">

      <div className="text-center mb-8 flex flex-col items-center">
        <span className={tokens.section.eyebrow}>Les mots qui réchauffent le cœur</span>
        <div className="flex items-center gap-4 mt-2">
          <div className={tokens.section.divider} />
          <h2 className={tokens.section.title}>Livre d'Or</h2>
          <div className={tokens.section.divider} />
        </div>
      </div>

      {role === 'admin' && allPages.length > 0 && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <button onClick={downloadAllAsPDF} disabled={downloading} className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50">
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
        <div
          className={cn(tokens.card.base, 'px-8 py-14 flex flex-col items-center justify-center relative min-h-[340px]')}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {role === 'admin' && (
            <button
              onClick={() => hideMessage(currentPageData.originalMessage)}
              className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-black transition-colors"
              title="Masquer ce message"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="text-center w-full"
            >
              <div className="text-[40px] font-serif text-stone-200 leading-none h-6 mb-4">"</div>
              <p className="font-['Lora'] italic text-[20px] leading-[1.6] text-black mb-8 px-4">
                {currentPageData.message}
              </p>
              {currentPageData.author && (
                <p className="font-['Inter'] font-bold text-[10px] tracking-[0.2em] uppercase text-stone-400">
                  {currentPageData.author}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-black transition-colors disabled:opacity-20"
            >
              <ChevronLeft strokeWidth={1} className="w-6 h-6" />
            </button>
            <button
              onClick={downloadCurrentPageAsPDF}
              className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-black transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === allPages.length - 1}
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-black transition-colors disabled:opacity-20"
            >
              <ChevronRight strokeWidth={1} className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Messages masqués — admin */}
      {role === 'admin' && hiddenMessages.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-100">
          <div className="text-center mb-6 flex flex-col items-center">
            <span className={tokens.section.eyebrow}>Contenu masqué</span>
            <div className="flex items-center gap-4 mt-2">
              <div className={tokens.section.divider} />
              <h3 className={tokens.section.title}>Messages masqués</h3>
              <div className={tokens.section.divider} />
            </div>
          </div>
          <div className="space-y-3">
            {hiddenMessages.map((msg, index) => (
              <div key={msg._id} className={cn(tokens.card.base, 'px-6 py-5 relative')}>
                <button
                  onClick={() => unhideMessage(msg)}
                  className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-black transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <p className="font-['Lora'] italic text-[16px] text-black leading-relaxed text-center">{msg.message}</p>
                {msg.author && (
                  <p className="font-['Inter'] text-[10px] tracking-widest uppercase text-stone-400 text-center mt-3">{msg.author}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}