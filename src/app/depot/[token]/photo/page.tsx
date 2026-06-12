import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import PhotoUpload from '@/components/depot/PhotoUpload'
import AppLayout from '@/components/ui/AppLayout'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PhotoPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()
  const role = await getRole()
  const settings = await getSettings()

  return (
    <AppLayout role={role} token={token} fontFamily={settings.fontFamily} backgroundColor={settings.backgroundColor} titleColor={settings.titleColor}>
      <PhotoUpload settings={settings}/>
    </AppLayout>
  )
}