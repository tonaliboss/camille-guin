import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import GuestBookForm from '@/components/depot/GuestBookForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function LivreOrPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()
  return <GuestBookForm />
}