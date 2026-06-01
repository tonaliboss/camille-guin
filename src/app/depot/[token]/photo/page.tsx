import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import PhotoUpload from '@/components/depot/PhotoUpload'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PhotoPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()
  return <PhotoUpload />
}