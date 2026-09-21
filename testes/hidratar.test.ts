import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calcularOrcamento, hidratarDia, type BlocoHidratado } from '../lib/ai/hidratar'
import { diaSchema } from '../lib/ai/schema'
import type { Poi } from '../lib/selecao/tipos'

function poi(id: string, over: Partial<Poi> = {}): Poi {
  return {
    id, tipo: 'atracao', nome: `Nome de ${id}`, categoria: 'parque', subcategorias: [],
    descricao: 'x', perfisIndicados: [], lat: null, lng: null,
    precoMin: null, precoMax: null, gratuito: false, faixaPreco: null,
    duracaoRecomendadaMin: 60, adequadoCriancas: true, requerReserva: false,
    indoor: false, melhorHorario: [], prioridadeBase: 3, verificado: true,
    ...over,
  }
}

function bloco(over: Record<string, unknown> = {}) {
  return {
    periodo: 'manha', hora: '09:00', titulo: 'Atividade', poiId: 'atr-1', poiTipo: 'atracao',
    descricao: 'Uma descrição suficientemente longa para o schema aceitar.',
    porQueCombina: 'Você marcou que ama natureza.',
    duracaoMin: 90, prioridade: 'imperdivel', ...over,
  }
}

const DIA = diaSchema.parse({
  numero: 1, titulo: 'Dia um',
  abertura: 'Abertura com tamanho suficiente para passar pelo schema sem reclamar.',
  antesDeSair: { transito: '', estacionamento: '', recomendacaoModal: 'carro' },
  blocos: [
    bloco({ poiId: 'atr-1', hora: '09:00' }),
    bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30', periodo: 'almoco' }),
    bloco({ poiId: 'atr-2', hora: '15:00', periodo: 'tarde' }),
  ],
  planoB: {
    chuva: [{ poiId: 'alt-1', poiTipo: 'atracao', motivo: 'coberto e fica a cinco minutos' }],
    cansaco: [], transito: [], lotado: [],
  },
  encerramento: 'Boa noite.',
})

describe('hidratarDia — o servidor manda no fato', () => {
  const pois = [
    poi('atr-1', { precoMin: 50, precoMax: 70, lat: -29.37, lng: -50.87, duracaoRecomendadaMin: 120 }),
    poi('res-1', { tipo: 'restaurante', precoMin: 80, precoMax: 120 }),
    poi('atr-2', { gratuito: true }),
    poi('alt-1'),
  ]

  it('preenche nome, preço e coordenada a partir do banco', () => {
    const d = hidratarDia(DIA, pois, { transportes: ['carro'] })
    assert.equal(d.blocos[0].nome, 'Nome de atr-1')
    assert.deepEqual(d.blocos[0].preco, { min: 50, max: 70, gratuito: false })
    assert.deepEqual(d.blocos[0].coordenada, { lat: -29.37, lng: -50.87 })
  })

  it('a duração do banco tem precedência sobre a sugerida pelo modelo', () => {
    const d = hidratarDia(DIA, pois, { transportes: ['carro'] })
    assert.equal(DIA.blocos[0].duracaoMin, 90, 'o modelo sugeriu 90')
    assert.equal(d.blocos[0].duracaoMin, 120, 'o banco diz 120 e é o que vale')
  })

  it('marca verificarAntes quando o POI não está verificado', () => {
    const naoVerificados = pois.map((p) => ({ ...p, verificado: false }))
    const d = hidratarDia(DIA, naoVerificados, { transportes: ['carro'] })
    assert.ok(d.blocos.every((b) => b.verificarAntes))
  })

  it('não inventa preço para POI sem preço cadastrado', () => {
    const semPreco = pois.map((p) => ({ ...p, precoMin: null, precoMax: null, gratuito: false }))
    const d = hidratarDia(DIA, semPreco, { transportes: ['carro'] })
    assert.ok(d.blocos.every((b) => b.preco === null))
  })

  it('hidrata o plano B com o nome real do POI', () => {
    const d = hidratarDia(DIA, pois, { transportes: ['carro'] })
    assert.equal(d.planoB.chuva[0].nome, 'Nome de alt-1')
  })
})

describe('calcularOrcamento', () => {
  function b(over: Partial<BlocoHidratado>): BlocoHidratado {
    return {
      periodo: 'manha', hora: '09:00', titulo: 't', poiId: 'p', poiTipo: 'atracao',
      nome: 'n', descricao: 'd', porQueCombina: 'p', prioridade: 'imperdivel',
      duracaoMin: 60, endereco: null, coordenada: null, preco: null,
      verificarAntes: false, ...over,
    }
  }

  it('usa o ponto médio da faixa de preço', () => {
    const o = calcularOrcamento([b({ preco: { min: 50, max: 70, gratuito: false } })], ['a_pe'])
    assert.equal(o.passeios, 60)
  })

  it('separa alimentação de passeios', () => {
    const o = calcularOrcamento([
      b({ poiTipo: 'restaurante', preco: { min: 100, max: 100, gratuito: false } }),
      b({ poiTipo: 'atracao', preco: { min: 40, max: 40, gratuito: false } }),
    ], ['a_pe'])
    assert.equal(o.alimentacao, 100)
    assert.equal(o.passeios, 40)
  })

  it('não soma item sem preço — conta e avisa', () => {
    const o = calcularOrcamento([
      b({ preco: { min: 40, max: 40, gratuito: false } }),
      b({ preco: null }),
      b({ preco: null }),
    ], ['a_pe'])
    assert.equal(o.passeios, 40)
    assert.equal(o.itensSemPreco, 2)
    assert.ok(o.observacao.includes('2 item(ns)'))
  })

  it('gratuito não soma mas também não conta como faltante', () => {
    const o = calcularOrcamento([b({ preco: { min: null, max: null, gratuito: true } })], ['a_pe'])
    assert.equal(o.total, 0)
    assert.equal(o.itensSemPreco, 0)
  })

  it('usa o transporte mais caro entre os escolhidos', () => {
    const so = calcularOrcamento([], ['a_pe'])
    const app = calcularOrcamento([], ['a_pe', 'app'])
    assert.equal(so.transporte, 0)
    assert.equal(app.transporte, 60)
  })

  it('o total fecha com as parcelas', () => {
    const o = calcularOrcamento([
      b({ poiTipo: 'restaurante', preco: { min: 80, max: 120, gratuito: false } }),
      b({ poiTipo: 'atracao', preco: { min: 30, max: 50, gratuito: false } }),
    ], ['publico'])
    assert.equal(o.total, o.alimentacao + o.passeios + o.transporte + o.outros)
  })
})
