import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import AppLayout from '@/components/ui/AppLayout'
import Galerie from '@/components/galerie/Galerie'

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

  return (
    <AppLayout role={role} token={token} fontFamily={settings.fontFamily}>
      <Galerie role={role} token={token} settings={settings} />
    </AppLayout>
  )
}