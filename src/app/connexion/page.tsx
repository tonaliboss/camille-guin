import { redirect } from 'next/navigation'
import { getRole } from '@/lib/auth'
import AdminLoginForm from '@/components/ui/AdminLoginForm'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function ConnexionPage({ searchParams }: Props) {
  const role = await getRole()
  if (role === 'admin') redirect('/tableau-de-bord')

  const { from } = await searchParams
  return <AdminLoginForm from={from} />
}