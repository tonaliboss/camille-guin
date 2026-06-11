import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import AppLayout from '@/components/ui/AppLayout'
import TableauDeBord from '@/components/tableau-de-bord/TableauDeBord'

export default async function TableauDeBordPage() {
  const role = await getRole()
  if (role !== 'admin') redirect('/connexion')
  const settings = await getSettings()

  return (
    <AppLayout role="admin" token={process.env.NEXT_PUBLIC_DEPOT_TOKEN!} fontFamily={settings.fontFamily}>
      <TableauDeBord settings={settings} />
    </AppLayout>
  )
}