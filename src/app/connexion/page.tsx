import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import Connexion from '@/components/connexion/Connexion'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function ConnexionPage({ searchParams }: Props) {
  const role = await getRole()
  if (role === 'admin') redirect('/tableau-de-bord')

  const { from } = await searchParams
  const settings = await getSettings()

  return <Connexion from={from} settings={settings} />
}