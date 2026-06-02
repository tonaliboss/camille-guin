'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, EyeOff, Eye } from 'lucide-react'
import jsPDF from 'jspdf'
import { getMessages, toggleMediaVisibility } from '@/lib/media'
import type { Message, Page, UserRole } from '@/types'

interface Props {
  role: UserRole
}

export default function LivreOrSection({ role }: Props) {
  const [messages, setMessages] = useState<(Message & { _id: string })[]>([])
  const [hiddenMessages, setHiddenMessages] = useState<(Message & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward')
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
    if (currentPage >= allPages.length - 1 && currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
    loadMessages()
  }

  const unhideMessage = async (item: Message & { _id: string }) => {
    await toggleMediaVisibility(item._id, false)
    loadMessages()
  }

  const getFontClass = (index: number) => {
    const fonts = ['font-[Parisienne]', 'font-[Sacramento]', 'font-[Alex_Brush]']
    return fonts[index % fonts.length]
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
    if (newPage < 0 || newPage >= allPages.length || isFlipping) return
    setFlipDirection(newPage > currentPage ? 'backward' : 'forward')
    setIsFlipping(true)
    setTimeout(() => { setCurrentPage(newPage); setIsFlipping(false) }, 800)
  }

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX) }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50 && currentPage < allPages.length - 1) handlePageChange(currentPage + 1)
    if (distance < -50 && currentPage > 0) handlePageChange(currentPage - 1)
  }

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

  if (loading) return (
    <section id="livre-or" className="py-32 px-8 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl text-black mb-20 font-light tracking-widest uppercase">Livre d'or</h2>
        <p className="text-neutral-400 font-light">Chargement...</p>
      </div>
    </section>
  )

  if (allPages.length === 0) return (
    <section id="livre-or" className="py-12 px-4 bg-stone-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-sans text-3xl text-center text-stone-800 uppercase tracking-wider mb-12">Livre d'or</h2>
        <p className="text-center text-neutral-400 font-light mb-12">Aucun message disponible</p>
        {role === 'admin' && hiddenMessages.length > 0 && (
          <div className="mt-8 pt-10 border-t border-stone-200">
            <h3 className="font-sans text-xl text-center text-stone-500 uppercase tracking-wider mb-8">Messages masqués</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {hiddenMessages.map((msg, index) => (
                <div key={msg._id} className="group relative bg-white rounded-lg border border-stone-200 px-6 py-5 shadow-sm">
                  <button onClick={() => unhideMessage(msg)} className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full opacity-40 hover:opacity-100 transition z-50" title="Remettre dans le livre d'or">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <p className={`text-lg text-gray-700 leading-relaxed text-center ${getFontClass(index)}`}>{msg.message}</p>
                  {msg.author && <p className={`text-base text-gray-500 italic text-center mt-3 ${getFontClass(index)}`}>{msg.author}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )

  const currentPageData = allPages[currentPage]

  return (
    <section id="livre-or" className="py-12 px-4 bg-stone-50">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="font-sans text-3xl text-center text-stone-800 uppercase tracking-wider mb-1">Livre d'or</h2>
          {role === 'admin' && allPages.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <button onClick={downloadAllAsPDF} disabled={downloading} className="p-1 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-50" title="Télécharger le livre d'or en PDF">
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
        </div>

        <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <clipPath id="curvedPageClip" clipPathUnits="objectBoundingBox">
                <path d="M 0,0.01 Q 0.5,0.005 0.97,0.015 Q 0.985,0.25 0.98,0.5 Q 0.985,0.75 0.97,0.985 Q 0.5,0.995 0,0.99 L 0,0.01 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className="relative max-w-4xl mx-auto px-4 md:px-8">
            <div className="relative" style={{ perspective: '1500px' }}>
              <div className="absolute -left-6 top-0 w-16" style={{ height: '420px', background: 'linear-gradient(to right, #6b5642 0%, #8b6f47 30%, #a68a64 70%, #b89968 100%)', transform: 'rotateY(15deg)', transformOrigin: 'right center', boxShadow: '-4px 0 15px rgba(0,0,0,0.4), inset -2px 0 8px rgba(0,0,0,0.2)', zIndex: 0, borderRadius: '4px 0 0 4px' }} />

              <div className="relative flex overflow-hidden" style={{ height: '420px', transformStyle: 'preserve-3d' }}>
                {role === 'admin' && (
                  <button onClick={() => hideMessage(currentPageData.originalMessage)} className="absolute top-3 right-10 bg-black/60 p-2 rounded-full opacity-40 hover:opacity-100 transition z-50" title="Masquer ce message">
                    <EyeOff className="w-4 h-4 text-white" />
                  </button>
                )}

                {isFlipping && (
                  <div className="absolute inset-0 bg-white z-20" style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', transformOrigin: 'right center', animation: flipDirection === 'forward' ? 'flipPageForward 0.8s ease-in-out forwards' : 'flipPageBackward 0.8s ease-in-out forwards', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', clipPath: 'url(#curvedPageClip)' }}>
                    <div className="h-full flex flex-col justify-center items-center px-8 md:px-20 py-12">
                      <div className={`text-xl md:text-2xl text-gray-800 leading-relaxed text-center max-w-md ${getFontClass(currentPageData.originalIndex)}`}>{currentPageData.message}</div>
                      {currentPageData.author && <div className="mt-10"><p className={`text-xl md:text-2xl text-gray-700 italic ${getFontClass(currentPageData.originalIndex)}`}>{currentPageData.author}</p></div>}
                    </div>
                  </div>
                )}

                <div className="relative bg-white" style={{ width: '100%', boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.12), 3px 3px 15px rgba(0,0,0,0.2)', clipPath: 'url(#curvedPageClip)', transform: 'translateZ(5px)', border: '1px solid rgba(200, 200, 200, 0.4)' }}>
                  <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.06) 50%, transparent 100%)' }} />
                  <svg className="absolute right-0 top-0 h-full pointer-events-none" width="100%" height="100%" style={{ zIndex: 10 }} preserveAspectRatio="none">
                    <path d="M 97 1.5 Q 98.5 25 98 50 Q 98.5 75 97 98.5" fill="none" stroke="#2c2c2c" strokeWidth="1.5" opacity="0.6" vectorEffect="non-scaling-stroke" />
                  </svg>

                  <div className="h-full flex flex-col justify-center items-center px-8 md:px-20 py-12">
                    <div className={`text-xl md:text-2xl text-gray-800 leading-relaxed text-center max-w-md ${getFontClass(currentPageData.originalIndex)}`}>{currentPageData.message}</div>
                    {currentPageData.author && (
                      <div className="mt-10">
                        <p className={`text-xl md:text-2xl text-gray-700 italic ${getFontClass(currentPageData.originalIndex)}`}>{currentPageData.author}</p>
                      </div>
                    )}
                    <div className="absolute bottom-8 text-xs text-gray-400">{currentPage + 1}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 left-0 right-0 h-12 -z-10" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)', filter: 'blur(10px)' }} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0 || isFlipping} className="p-3 bg-white hover:bg-stone-100 disabled:opacity-30 rounded-full shadow-md transition-all hover:scale-105">
              <ChevronLeft className="w-6 h-6 text-stone-800" />
            </button>
            <button onClick={downloadCurrentPageAsPDF} className="p-3 bg-white hover:bg-stone-100 rounded-full shadow-md transition-all hover:scale-105" title="Télécharger cette page">
              <Download className="w-5 h-5 text-stone-800" />
            </button>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === allPages.length - 1 || isFlipping} className="p-3 bg-white hover:bg-stone-100 disabled:opacity-30 rounded-full shadow-md transition-all hover:scale-105">
              <ChevronRight className="w-6 h-6 text-stone-800" />
            </button>
          </div>

          <div className="text-center mt-4 text-sm text-stone-500">
            Page {currentPage + 1} sur {allPages.length}
            {currentPageData.totalPages > 1 && <span className="text-stone-400 ml-2">({currentPageData.pageNumber}/{currentPageData.totalPages} pour ce message)</span>}
          </div>
        </div>

        {role === 'admin' && hiddenMessages.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200">
            <h3 className="font-sans text-xl text-center text-stone-500 uppercase tracking-wider mb-8">Messages masqués</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {hiddenMessages.map((msg, index) => (
                <div key={msg._id} className="group relative bg-white rounded-lg border border-stone-200 px-6 py-5 shadow-sm">
                  <button onClick={() => unhideMessage(msg)} className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full opacity-40 hover:opacity-100 transition z-50" title="Remettre dans le livre d'or">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <p className={`text-lg text-gray-700 leading-relaxed text-center ${getFontClass(index)}`}>{msg.message}</p>
                  {msg.author && <p className={`text-base text-gray-500 italic text-center mt-3 ${getFontClass(index)}`}>{msg.author}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}