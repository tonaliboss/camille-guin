import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import GalerieClient from '@/components/galerie/GalerieClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function GaleriePage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('galerie', token)) notFound()

  const role = await getRole()

  return <GalerieClient role={role} token={token} />
}