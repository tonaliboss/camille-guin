import { notFound, redirect } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import PersonnaliserPage from '@/components/depot/PersonnaliserPage'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PersonnaliserPageRoute({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()

  const role = await getRole()
  if (role !== 'admin') redirect(`/connexion?from=/depot/${token}/personnaliser`)

  const settings = await getSettings()

  return <PersonnaliserPage role={role} token={token} settings={settings} />
}