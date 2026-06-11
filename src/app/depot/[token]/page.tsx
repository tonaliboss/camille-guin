import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import AppLayout from '@/components/ui/AppLayout'
import Depot from '@/components/depot/Depot'

interface Props {
  params: Promise<{ token: string }>
}

export default async function DepotPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()

  const role = await getRole()
  const settings = await getSettings()

  return (
    <AppLayout role={role} token={token} fontFamily={settings.fontFamily}>
      <Depot role={role} token={token} settings={settings} />
    </AppLayout>
  )
}