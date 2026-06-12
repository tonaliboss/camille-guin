import { toast } from 'sonner'

export const shareLink = async (url: string, text: string, title: string) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('Erreur lors du partage')
    }
  } else {
    navigator.clipboard.writeText(`${text} ${url}`)
    toast.success('Lien copié !')
  }
}