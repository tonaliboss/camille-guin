import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import VoiceRecorder from '@/components/depot/VoiceRecorder'

interface Props {
  params: Promise<{ token: string }>
}

export default async function MessageVocalPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()
  return <VoiceRecorder />
}