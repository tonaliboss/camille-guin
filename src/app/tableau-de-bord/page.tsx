import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import TableauDeBord from '@/components/tableau-de-bord/TableauDeBord'

export default async function TableauDeBordPage() {
  const role = await getRole()
  if (role !== 'admin') redirect('/connexion')
  const settings = await getSettings()
  return <TableauDeBord settings={settings} />
}