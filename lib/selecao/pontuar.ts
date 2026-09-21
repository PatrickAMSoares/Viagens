import {
  INTERESSE_PARA_CATEGORIA, PERFIL_PARA_INDICADO, TETO_POR_ESTILO, atividadesPorDia,
} from './afinidade'
import type { PerfilViagem, Poi, PoiPontuado } from './tipos'

/**
 * Seleção de candidatos — etapa 2 do pipeline (docs/07 §2).
 *
 * Determinística e sem IA de propósito: é auditável, testável e barata.
 * A IA recebe o resultado disto e só compõe a experiência.
 */

export function pontuar(poi: Poi, v: PerfilViagem): PoiPontuado {
  const motivos: string[] = []
  let pontos = 0

  // 1. Interesses declarados — o sinal mais forte.
  const categorias = new Set([poi.categoria, ...poi.subcategorias].map((c) => c.toLowerCase()))
  const interessesAtendidos = v.interesses.filter((i) =>
    (INTERESSE_PARA_CATEGORIA[i] ?? []).some((c) => categorias.has(c)),
  )
  if (interessesAtendidos.length > 0) {
    pontos += 3 * Math.min(interessesAtendidos.length, 2)
    motivos.push(`interesses: ${interessesAtendidos.join(', ')}`)
  }

  // 2. Perfil de viagem.
  const indicados = new Set(poi.perfisIndicados.map((p) => p.toLowerCase()))
  const perfisAtendidos = v.perfil.filter((p) =>
    (PERFIL_PARA_INDICADO[p] ?? []).some((i) => indicados.has(i)),
  )
  if (perfisAtendidos.length > 0) {
    pontos += 2 * Math.min(perfisAtendidos.length, 2)
    motivos.push(`perfil: ${perfisAtendidos.join(', ')}`)
  }

  // 3. Relevância do POI no destino.
  pontos += 1.5 * (poi.prioridadeBase / 5)

  // 4. Orçamento.
  const teto = TETO_POR_ESTILO[v.estilo] ?? 150
  const preco = poi.precoMin ?? 0
  if (poi.gratuito || preco === 0) {
    pontos += v.estilo === 'economico' ? 1.5 : 0.5
  } else if (preco > teto) {
    pontos -= 2
    motivos.push('acima do teto do estilo')
  }

  // 5. Crianças: filtro forte, não preferência.
  if (v.criancas > 0) {
    pontos += poi.adequadoCriancas ? 1 : -5
    if (!poi.adequadoCriancas) motivos.push('não indicado para crianças')
  }

  // 6. Reserva antecipada em viagem curta é atrito real.
  if (poi.requerReserva && v.dias <= 2) {
    pontos -= 2
    motivos.push('exige reserva em viagem curta')
  }

  // 7. Dado não verificado ainda pode entrar, mas perde para o verificado.
  if (!poi.verificado) pontos -= 0.5

  // 8. Pedido explícito do viajante vence tudo.
  const forcado = v.poiIdsDesejados.includes(poi.id)
  if (forcado) {
    pontos += 100
    motivos.push('pedido explicitamente pelo viajante')
  }

  return { poi, pontos: Number(pontos.toFixed(3)), forcado, motivos }
}

/**
 * Seleciona os candidatos que vão ao prompt.
 *
 * Manda ~4x mais POIs do que cabem no roteiro: dá liberdade de composição à
 * IA sem deixá-la escolher fora do catálogo.
 */
export function selecionarCandidatos(pois: Poi[], v: PerfilViagem): PoiPontuado[] {
  const porDia = atividadesPorDia(v.perfil, v.criancas)
  const alvoAtracoes = Math.max(8, porDia * v.dias * 4)
  // Duas refeições por dia (almoço e jantar), com 3 opções para cada.
  const alvoRestaurantes = Math.max(6, v.dias * 2 * 3)

  const pontuados = pois.map((p) => pontuar(p, v))
  const ordenar = (a: PoiPontuado, b: PoiPontuado) =>
    b.pontos - a.pontos || a.poi.nome.localeCompare(b.poi.nome, 'pt-BR')

  const atracoes = pontuados
    .filter((p) => p.poi.tipo === 'atracao')
    .sort(ordenar)
    .slice(0, alvoAtracoes)

  const restaurantes = pontuados
    .filter((p) => p.poi.tipo === 'restaurante')
    .sort(ordenar)
    .slice(0, alvoRestaurantes)

  // Nenhum pedido explícito pode ser cortado pelo limite acima.
  const selecionados = new Map([...atracoes, ...restaurantes].map((p) => [p.poi.id, p]))
  for (const p of pontuados) {
    if (p.forcado) selecionados.set(p.poi.id, p)
  }

  return [...selecionados.values()].sort(ordenar)
}
