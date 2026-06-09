import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import { getRole } from '@/lib/auth'
import GuestBookForm from '@/components/depot/GuestBookForm'
import AppLayout from '@/components/ui/AppLayout'

interface Props {
  params: Promise<{ token: string }>
}

export default async function PhotoPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()
  const role = await getRole()

  return (
    <AppLayout role={role} token={token}>
      <GuestBookForm />
    </AppLayout>
  )
}