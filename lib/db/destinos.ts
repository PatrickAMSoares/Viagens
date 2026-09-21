import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma, temBanco } from './prisma'
import { DESTINOS_ATIVOS, buscarDestino as buscarEstatico } from '@/lib/catalogo/destinos'
import type { Destino } from '@/lib/catalogo/tipos'

/**
 * Leitura de destinos para a área pública.
 *
 * Enquanto `DATABASE_URL` não existe, cai para o catálogo tipado — assim a
 * home e o questionário continuam funcionando em um clone limpo, sem infra.
 */

type LinhaDestino = Awaited<ReturnType<typeof prisma.destino.findMany>>[number]

function daLinha(d: LinhaDestino): Destino {
  return {
    slug: d.slug,
    nome: d.nome,
    estado: nomeDoEstado(d.estado),
    uf: d.estado,
    pais: d.pais,
    descricaoCurta: d.descricaoCurta,
    descricaoLonga: d.descricaoLonga ?? '',
    tags: (d.categorias ?? []).map(paraTag),
    imagem: primeiraImagem(d.imagens),
    centro: { lat: Number(d.centroLat ?? 0), lng: Number(d.centroLng ?? 0) },
    notasTransito: d.notasTransito ?? '',
    climaNotas: d.climaNotas ?? '',
    melhorEpoca: typeof d.melhorEpoca === 'string' ? d.melhorEpoca : '',
    desafioRoteiro: '',
    ativo: d.ativo,
  }
}

const UFS: Record<string, string> = {
  SC: 'Santa Catarina',
  PR: 'Paraná',
  RS: 'Rio Grande do Sul',
}

function nomeDoEstado(uf: string) {
  return UFS[uf] ?? uf
}

/** As categorias são gravadas como "🏖️ Praias" — ícone e rótulo no mesmo campo. */
function paraTag(categoria: string) {
  const [primeiro, ...resto] = categoria.trim().split(' ')
  return resto.length > 0
    ? { icone: primeiro, rotulo: resto.join(' ') }
    : { icone: '📍', rotulo: categoria }
}

function primeiraImagem(imagens: unknown): Destino['imagem'] {
  if (!Array.isArray(imagens) || imagens.length === 0) return null
  const img = imagens[0] as { url?: string; alt?: string; credito?: string }
  if (!img?.url) return null
  return { url: img.url, alt: img.alt ?? '', credito: img.credito ?? '' }
}

/**
 * Banco indisponível não pode derrubar a vitrine.
 *
 * O catálogo estático cobre exatamente os mesmos 8 destinos, então servir a
 * home a partir dele durante uma indisponibilidade é correto, não um
 * paliativo. O erro é registrado para não passar despercebido — o /admin,
 * que precisa do dado real, continua falhando alto de propósito.
 */
async function comFallback<T>(consulta: () => Promise<T>, reserva: T, ondeFalhou: string): Promise<T> {
  if (!temBanco) return reserva
  try {
    return await consulta()
  } catch (erro) {
    console.error(`[catalogo] banco indisponível em ${ondeFalhou}, usando catálogo estático:`, erro)
    return reserva
  }
}

export const listarDestinos = unstable_cache(
  async (): Promise<Destino[]> =>
    comFallback(
      async () => {
        const linhas = await prisma.destino.findMany({
          where: { ativo: true },
          orderBy: [{ estado: 'asc' }, { nome: 'asc' }],
        })
        return linhas.length > 0 ? linhas.map(daLinha) : DESTINOS_ATIVOS
      },
      DESTINOS_ATIVOS,
      'listarDestinos',
    ),
  ['destinos-ativos'],
  { revalidate: 300, tags: ['destinos'] },
)

export async function obterDestino(slug: string): Promise<Destino | undefined> {
  return comFallback(
    async () => {
      const linha = await prisma.destino.findUnique({ where: { slug } })
      return !linha || !linha.ativo ? buscarEstatico(slug) : daLinha(linha)
    },
    buscarEstatico(slug),
    `obterDestino(${slug})`,
  )
}
