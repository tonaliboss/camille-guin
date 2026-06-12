import JSZip from 'jszip'

interface DownloadableItem {
  url: string
  name: string
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export async function downloadAllAsZip(
  items: DownloadableItem[],
  folderName: string,
  zipName: string,
  onProgress: (progress: number) => void
) {
  const zip = new JSZip()
  const folder = zip.folder(folderName)

  for (let i = 0; i < items.length; i++) {
    const response = await fetch(items[i].url)
    const blob = await response.blob()
    folder?.file(items[i].name, blob)
    onProgress(((i + 1) / items.length) * 90)
    await new Promise(r => setTimeout(r, 10))
  }

  onProgress(95)
  const content = await zip.generateAsync({ type: 'blob' })
  onProgress(100)

  if (isMobile() && navigator.canShare) {
    const file = new File([content], zipName, { type: 'application/zip' })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: zipName })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
  }

  const url = window.URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function downloadFile(url: string, name: string) {
  const response = await fetch(url)
  const blob = await response.blob()

  if (isMobile() && navigator.canShare) {
    const file = new File([blob], name, { type: blob.type })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
  }

  const objectUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(objectUrl)
}