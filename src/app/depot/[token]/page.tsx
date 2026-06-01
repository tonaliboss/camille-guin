import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import DepotClient from '@/components/depot/DepotClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function DepotPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()

  const role = await getRole()
  const settings = await getSettings()

  return <DepotClient role={role} token={token} settings={settings} />
}