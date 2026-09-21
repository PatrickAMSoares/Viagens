import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { pontuar, selecionarCandidatos } from '../lib/selecao/pontuar'
import { agruparPorRegiao, distanciaKm } from '../lib/selecao/agrupar'
import type { PerfilViagem, Poi } from '../lib/selecao/tipos'

function poi(over: Partial<Poi> = {}): Poi {
  return {
    id: over.id ?? 'p1',
    tipo: 'atracao',
    nome: 'Lugar',
    categoria: 'parque',
    subcategorias: [],
    descricao: 'Descrição',
    perfisIndicados: [],
    lat: null, lng: null,
    precoMin: null, precoMax: null, gratuito: false, faixaPreco: null,
    duracaoRecomendadaMin: 60,
    adequadoCriancas: true, requerReserva: false, indoor: false,
    melhorHorario: [], prioridadeBase: 3, verificado: true,
    ...over,
  }
}

function viagem(over: Partial<PerfilViagem> = {}): PerfilViagem {
  return {
    dias: 3, perfil: [], interesses: [], companhia: 'casal', criancas: 0,
    estilo: 'equilibrado', orcamentoPessoa: null, transportes: ['carro'],
    poiIdsDesejados: [], ...over,
  }
}

describe('pontuar', () => {
  it('premia POI que atende interesse declarado', () => {
    const v = viagem({ interesses: ['natureza'] })
    const comum = pontuar(poi({ categoria: 'museu' }), v)
    const aderente = pontuar(poi({ categoria: 'parque' }), v)
    assert.ok(aderente.pontos > comum.pontos)
  })

  it('penaliza fortemente POI inadequado quando há crianças', () => {
    const v = viagem({ criancas: 2 })
    const p = pontuar(poi({ adequadoCriancas: false }), v)
    assert.ok(p.pontos < 0, `esperado negativo, veio ${p.pontos}`)
    assert.ok(p.motivos.some((m) => m.includes('crianças')))
  })

  it('penaliza preço acima do teto do estilo econômico', () => {
    const v = viagem({ estilo: 'economico' })
    const caro = pontuar(poi({ precoMin: 200 }), v)
    const barato = pontuar(poi({ precoMin: 20 }), v)
    assert.ok(barato.pontos > caro.pontos)
  })

  it('não penaliza preço alto no estilo premium', () => {
    const caro = pontuar(poi({ precoMin: 800 }), viagem({ estilo: 'premium' }))
    assert.ok(!caro.motivos.includes('acima do teto do estilo'))
  })

  it('pedido explícito do viajante domina qualquer outro critério', () => {
    const v = viagem({ criancas: 3, poiIdsDesejados: ['especial'] })
    const forcado = pontuar(poi({ id: 'especial', adequadoCriancas: false }), v)
    const normal = pontuar(poi({ id: 'outro', prioridadeBase: 5 }), v)
    assert.equal(forcado.forcado, true)
    assert.ok(forcado.pontos > normal.pontos)
  })

  it('prefere dado verificado quando o resto empata', () => {
    const v = viagem()
    const a = pontuar(poi({ id: 'a', verificado: true }), v)
    const b = pontuar(poi({ id: 'b', verificado: false }), v)
    assert.ok(a.pontos > b.pontos)
  })
})

describe('selecionarCandidatos', () => {
  const muitos = Array.from({ length: 200 }, (_, i) =>
    poi({ id: `a${i}`, prioridadeBase: (i % 5) + 1 }),
  )

  it('limita o conjunto mas manda bem mais do que cabe no roteiro', () => {
    const escolhidos = selecionarCandidatos(muitos, viagem({ dias: 3 }))
    assert.ok(escolhidos.length >= 12, 'precisa de folga para a IA compor')
    assert.ok(escolhidos.length < muitos.length, 'precisa limitar o prompt')
  })

  it('nunca corta um pedido explícito, mesmo mal pontuado', () => {
    const pedido = poi({ id: 'pedido-especial', prioridadeBase: 1, adequadoCriancas: false })
    const escolhidos = selecionarCandidatos(
      [...muitos, pedido],
      viagem({ criancas: 2, poiIdsDesejados: ['pedido-especial'] }),
    )
    assert.ok(escolhidos.some((c) => c.poi.id === 'pedido-especial'))
  })

  it('é determinístico: mesma entrada, mesma saída', () => {
    const v = viagem({ interesses: ['natureza'] })
    const a = selecionarCandidatos(muitos, v).map((c) => c.poi.id)
    const b = selecionarCandidatos(muitos, v).map((c) => c.poi.id)
    assert.deepEqual(a, b)
  })

  it('reserva espaço para restaurantes sem deixá-los competir com atrações', () => {
    const mistos = [
      ...muitos,
      ...Array.from({ length: 30 }, (_, i) => poi({ id: `r${i}`, tipo: 'restaurante' as const })),
    ]
    const escolhidos = selecionarCandidatos(mistos, viagem({ dias: 2 }))
    const restaurantes = escolhidos.filter((c) => c.poi.tipo === 'restaurante')
    assert.ok(restaurantes.length >= 6, `veio ${restaurantes.length} restaurantes`)
  })
})

describe('agruparPorRegiao', () => {
  // Dois aglomerados reais: centro de Gramado e centro de Canela (~7 km).
  const gramado = [
    poi({ id: 'g1', lat: -29.3788, lng: -50.8739 }),
    poi({ id: 'g2', lat: -29.3795, lng: -50.8750 }),
    poi({ id: 'g3', lat: -29.3801, lng: -50.8721 }),
  ]
  const canela = [
    poi({ id: 'c1', lat: -29.3628, lng: -50.8119 }),
    poi({ id: 'c2', lat: -29.3640, lng: -50.8135 }),
    poi({ id: 'c3', lat: -29.3615, lng: -50.8102 }),
  ]

  it('calcula distância coerente entre Gramado e Canela', () => {
    const d = distanciaKm({ lat: -29.3788, lng: -50.8739 }, { lat: -29.3628, lng: -50.8119 })
    assert.ok(d > 4 && d < 10, `esperado ~6-7 km, veio ${d.toFixed(1)} km`)
  })

  it('separa aglomerados geográficos distintos', () => {
    const pontuados = selecionarCandidatos([...gramado, ...canela], viagem({ dias: 2 }))
    const grupos = agruparPorRegiao(pontuados, 2)
    assert.equal(grupos.length, 2)
    for (const grupo of grupos) {
      const ids = grupo.map((g) => g.poi.id)
      const temGramado = ids.some((i) => i.startsWith('g'))
      const temCanela = ids.some((i) => i.startsWith('c'))
      assert.ok(!(temGramado && temCanela), `grupo misturou regiões: ${ids.join(',')}`)
    }
  })

  it('devolve um grupo só quando não há POIs suficientes', () => {
    const pontuados = selecionarCandidatos(gramado.slice(0, 2), viagem())
    assert.equal(agruparPorRegiao(pontuados, 4).length, 1)
  })

  it('não descarta POI sem coordenada', () => {
    const semCoord = poi({ id: 'sem-coord' })
    const pontuados = selecionarCandidatos([...gramado, ...canela, semCoord], viagem({ dias: 2 }))
    const grupos = agruparPorRegiao(pontuados, 2)
    const todos = grupos.flat().map((g) => g.poi.id)
    assert.ok(todos.includes('sem-coord'))
    assert.equal(todos.length, pontuados.length)
  })
})
