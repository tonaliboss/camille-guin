import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import GalerieClient from '@/components/galerie/GalerieClient'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function GaleriePage({ params, searchParams }: Props) {
  const { token } = await params
  const { preview } = await searchParams
  if (!isValidToken('galerie', token)) notFound()

  const role = preview === '1' ? 'guest' : await getRole()
  const settings = await getSettings()

  return <GalerieClient role={role} token={token} settings={settings} />
}