import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import AppLayout from '@/components/ui/AppLayout'
import { SettingsProvider } from '@/components/providers/SettingsProvider'

interface Props {
  children: React.ReactNode
  params: Promise<{ token: string }>
}

export default async function DepotLayout({ children, params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()

  const role = await getRole()
  const settings = await getSettings()

  return (
    <SettingsProvider settings={settings} role={role}>
      <AppLayout role={role} token={token} fontFamily={settings.fontFamily} backgroundColor={settings.backgroundColor} titleColor={settings.titleColor}>
        {children}
      </AppLayout>
    </SettingsProvider>
  )
}