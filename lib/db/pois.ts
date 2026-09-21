import 'server-only'
import { prisma } from './prisma'
import type { Poi } from '@/lib/selecao/tipos'

const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000

/** Verificado = tem data de verificação, dentro de 90 dias, e confiança não-baixa. */
function estaVerificado(verificadoEm: Date | null, confianca: string): boolean {
  if (verificadoEm === null) return false
  if (Date.now() - verificadoEm.getTime() > NOVENTA_DIAS) return false
  return confianca !== 'baixa'
}

/**
 * Carrega o catálogo de um destino no formato que o motor consome.
 *
 * Converte Decimal do Prisma para number aqui, na fronteira — nenhuma camada
 * acima precisa saber que o banco usa Decimal.
 */
export async function carregarPois(destinoSlug: string): Promise<Poi[]> {
  const destino = await prisma.destino.findUnique({
    where: { slug: destinoSlug },
    include: {
      atracoes: { where: { ativo: true } },
      restaurantes: { where: { ativo: true } },
    },
  })

  if (!destino) return []

  const atracoes: Poi[] = destino.atracoes.map((a) => ({
    id: a.id,
    tipo: 'atracao',
    nome: a.nome,
    categoria: a.categoria,
    subcategorias: a.subcategorias,
    descricao: a.descricao,
    perfisIndicados: a.perfisIndicados,
    lat: a.lat === null ? null : Number(a.lat),
    lng: a.lng === null ? null : Number(a.lng),
    precoMin: a.precoMin === null ? null : Number(a.precoMin),
    precoMax: a.precoMax === null ? null : Number(a.precoMax),
    gratuito: a.gratuito,
    faixaPreco: null,
    duracaoRecomendadaMin: a.duracaoRecomendadaMin,
    adequadoCriancas: a.adequadoCriancas,
    requerReserva: a.requerReserva,
    indoor: a.indoor,
    melhorHorario: a.melhorHorario,
    prioridadeBase: a.prioridadeBase,
    verificado: estaVerificado(a.verificadoEm, a.confianca),
  }))

  const restaurantes: Poi[] = destino.restaurantes.map((r) => ({
    id: r.id,
    tipo: 'restaurante',
    nome: r.nome,
    categoria: r.categoria,
    subcategorias: [],
    descricao: r.dicas ?? r.categoria,
    perfisIndicados: r.perfisIndicados,
    lat: r.lat === null ? null : Number(r.lat),
    lng: r.lng === null ? null : Number(r.lng),
    precoMin: r.ticketMedio === null ? null : Number(r.ticketMedio),
    precoMax: r.ticketMedio === null ? null : Number(r.ticketMedio),
    gratuito: false,
    faixaPreco: r.faixaPreco,
    duracaoRecomendadaMin: 90,
    adequadoCriancas: r.adequadoCriancas,
    requerReserva: r.requerReserva,
    indoor: true,
    melhorHorario: r.tipos,
    prioridadeBase: 3,
    verificado: estaVerificado(r.verificadoEm, r.confianca),
  }))

  return [...atracoes, ...restaurantes]
}
