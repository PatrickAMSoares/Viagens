import { notFound } from 'next/navigation'
import { Titulo } from '@/components/admin/ui'
import { prisma } from '@/lib/db/prisma'
import { FormularioAtracao } from './formulario'

export const dynamic = 'force-dynamic'

const VAZIO = {
  id: null, nome: '', slug: '', categoria: '', subcategorias: '', descricao: '',
  perfisIndicados: '', endereco: '', bairro: '', lat: '', lng: '',
  precoMin: '', precoMax: '', precoObs: '', gratuito: false,
  duracaoRecomendadaMin: '', prioridadeBase: 3, adequadoCriancas: true,
  requerReserva: false, indoor: false, infoSeguranca: '', dicas: '',
  fonteUrl: '', confianca: 'baixa' as const, verificadoEm: null, ativo: true,
}

export default async function EditarAtracao({
  params,
}: {
  params: Promise<{ slug: string; atracaoId: string }>
}) {
  const { slug, atracaoId } = await params

  if (atracaoId === 'nova') {
    return (
      <>
        <Titulo>Nova atração</Titulo>
        <FormularioAtracao slugDestino={slug} valores={VAZIO} />
      </>
    )
  }

  const a = await prisma.atracao.findUnique({ where: { id: atracaoId } })
  if (!a) notFound()

  return (
    <>
      <Titulo>{a.nome}</Titulo>
      <FormularioAtracao
        slugDestino={slug}
        valores={{
          id: a.id,
          nome: a.nome,
          slug: a.slug,
          categoria: a.categoria,
          subcategorias: a.subcategorias.join(', '),
          descricao: a.descricao,
          perfisIndicados: a.perfisIndicados.join(', '),
          endereco: a.endereco ?? '',
          bairro: a.bairro ?? '',
          lat: a.lat?.toString() ?? '',
          lng: a.lng?.toString() ?? '',
          precoMin: a.precoMin?.toString() ?? '',
          precoMax: a.precoMax?.toString() ?? '',
          precoObs: a.precoObs ?? '',
          gratuito: a.gratuito,
          duracaoRecomendadaMin: a.duracaoRecomendadaMin?.toString() ?? '',
          prioridadeBase: a.prioridadeBase,
          adequadoCriancas: a.adequadoCriancas,
          requerReserva: a.requerReserva,
          indoor: a.indoor,
          infoSeguranca: a.infoSeguranca ?? '',
          dicas: a.dicas ?? '',
          fonteUrl: a.fonteUrl ?? '',
          confianca: a.confianca,
          verificadoEm: a.verificadoEm?.toLocaleDateString('pt-BR') ?? null,
          ativo: a.ativo,
        }}
      />
    </>
  )
}
