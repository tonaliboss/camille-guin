import AdminLoginForm from '@/components/ui/AdminLoginForm'

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function ConnexionPage({ searchParams }: Props) {
  const { from } = await searchParams
  return <AdminLoginForm from={from} />
}