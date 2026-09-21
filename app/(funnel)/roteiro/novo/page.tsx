import { notFound } from 'next/navigation'
import { Questionario } from '@/components/questionario/questionario'
import { buscarDestino } from '@/lib/catalogo/destinos'

export const metadata = { title: 'Monte seu roteiro' }

export default async function NovoRoteiroPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>
}) {
  const { destino: slug } = await searchParams
  const destino = slug ? buscarDestino(slug) : undefined

  if (!destino) notFound()

  return <Questionario destino={destino} />
}
