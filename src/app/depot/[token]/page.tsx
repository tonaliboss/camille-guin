import { notFound } from 'next/navigation'
import { isValidToken } from '@/lib/tokens'
import Depot from '@/components/depot/Depot'

interface Props {
  params: Promise<{ token: string }>
}

export default async function DepotPage({ params }: Props) {
  const { token } = await params
  if (!isValidToken('depot', token)) notFound()

  return <Depot token={token} />
}