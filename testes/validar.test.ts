import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { instrucaoDeCorrecao, validarDia } from '../lib/ai/validar'
import { diaSchema } from '../lib/ai/schema'
import type { Poi } from '../lib/selecao/tipos'

function poi(id: string, over: Partial<Poi> = {}): Poi {
  return {
    id, tipo: 'atracao', nome: id, categoria: 'parque', subcategorias: [],
    descricao: 'x', perfisIndicados: [], lat: null, lng: null,
    precoMin: null, precoMax: null, gratuito: false, faixaPreco: null,
    duracaoRecomendadaMin: 60, adequadoCriancas: true, requerReserva: false,
    indoor: false, melhorHorario: [], prioridadeBase: 3, verificado: true,
    ...over,
  }
}

const DISPONIVEIS = [
  poi('atr-1'), poi('atr-2'), poi('atr-3', { categoria: 'museu' }),
  poi('atr-4', { categoria: 'museu' }), poi('atr-5', { categoria: 'museu' }),
  poi('alt-1'), poi('alt-2'),
  poi('res-1', { tipo: 'restaurante' }), poi('res-2', { tipo: 'restaurante' }),
]

function bloco(over: Record<string, unknown> = {}) {
  return {
    periodo: 'manha', hora: '09:00', titulo: 'Atividade',
    poiId: 'atr-1', poiTipo: 'atracao',
    descricao: 'Uma descrição suficientemente longa para passar no schema.',
    porQueCombina: 'Você marcou que ama natureza.',
    duracaoMin: 90, prioridade: 'imperdivel',
    ...over,
  }
}

function dia(over: Record<string, unknown> = {}) {
  return {
    numero: 1, titulo: 'Primeiro dia',
    abertura: 'Uma abertura com tamanho suficiente para o schema aceitar sem reclamar.',
    antesDeSair: { transito: '', estacionamento: '', recomendacaoModal: 'carro' },
    blocos: [
      bloco({ poiId: 'atr-1', hora: '09:00' }),
      bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30', periodo: 'almoco' }),
      bloco({ poiId: 'atr-2', hora: '15:00', periodo: 'tarde' }),
      bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00', periodo: 'noite' }),
    ],
    planoB: {
      chuva: [{ poiId: 'alt-1', poiTipo: 'atracao', motivo: 'coberto e fica a cinco minutos' }],
      cansaco: [], transito: [], lotado: [],
    },
    encerramento: 'Boa noite.',
    ...over,
  }
}

describe('schema do dia', () => {
  it('aceita um dia bem formado', () => {
    assert.equal(diaSchema.safeParse(dia()).success, true)
  })

  it('recusa hora fora do formato HH:MM', () => {
    const r = diaSchema.safeParse(dia({ blocos: [bloco({ hora: '9h' })] }))
    assert.equal(r.success, false)
  })

  it('recusa dia sem blocos suficientes', () => {
    assert.equal(diaSchema.safeParse(dia({ blocos: [bloco()] })).success, false)
  })
})

describe('validarDia — barreira anti-alucinação', () => {
  it('aprova um dia coerente', () => {
    assert.deepEqual(validarDia(diaSchema.parse(dia()), DISPONIVEIS), [])
  })

  it('rejeita POI que não está no catálogo enviado', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'restaurante-inventado-pela-ia', hora: '09:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
        bloco({ poiId: 'atr-2', hora: '15:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
    )
    const problemas = validarDia(d, DISPONIVEIS)
    assert.ok(problemas.some((p) => p.codigo === 'poi_inexistente'))
    assert.ok(problemas[0].mensagem.includes('restaurante-inventado-pela-ia'))
  })

  it('rejeita restaurante usado como atração', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'res-1', poiTipo: 'atracao', hora: '09:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '12:30' }),
        bloco({ poiId: 'atr-2', hora: '15:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'poi_inexistente'))
  })

  it('rejeita horários fora de ordem', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'atr-1', hora: '15:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
        bloco({ poiId: 'atr-2', hora: '18:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'horario_fora_de_ordem'))
  })

  it('rejeita dia que não cabe num dia', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'atr-1', hora: '06:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:00' }),
        bloco({ poiId: 'atr-2', hora: '18:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '22:00', duracaoMin: 240 }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'dia_sobrecarregado'))
  })

  it('rejeita plano B que repete algo já no roteiro do dia', () => {
    const d = diaSchema.parse(
      dia({ planoB: {
        chuva: [{ poiId: 'atr-1', poiTipo: 'atracao', motivo: 'é coberto e fica perto' }],
        cansaco: [], transito: [], lotado: [],
      } }),
    )
    const problemas = validarDia(d, DISPONIVEIS)
    assert.ok(problemas.some((p) => p.codigo === 'plano_b_invalido'))
  })

  it('rejeita plano B com POI inexistente', () => {
    const d = diaSchema.parse(
      dia({ planoB: {
        chuva: [{ poiId: 'nao-existe', poiTipo: 'atracao', motivo: 'inventado pelo modelo' }],
        cansaco: [], transito: [], lotado: [],
      } }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'plano_b_invalido'))
  })

  it('exige refeição no dia', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'atr-1', hora: '09:00' }),
        bloco({ poiId: 'atr-2', hora: '13:00' }),
        bloco({ poiId: 'alt-1', hora: '17:00' }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS, { restaurantesNoDia: 2 })
      .some((p) => p.codigo === 'sem_refeicao'))
  })

  it('rejeita três atividades da mesma categoria no mesmo dia', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'atr-3', hora: '09:00' }),
        bloco({ poiId: 'atr-4', hora: '11:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '13:00' }),
        bloco({ poiId: 'atr-5', hora: '15:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'categoria_repetida'))
  })

  it('detecta POI repetido no mesmo dia', () => {
    const d = diaSchema.parse(
      dia({ blocos: [
        bloco({ poiId: 'atr-1', hora: '09:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
        bloco({ poiId: 'atr-1', hora: '15:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
    )
    assert.ok(validarDia(d, DISPONIVEIS).some((p) => p.codigo === 'poi_repetido'))
  })
})

describe('instrucaoDeCorrecao', () => {
  it('transforma problemas em instrução acionável para o retry', () => {
    const d = diaSchema.parse(dia({ blocos: [
      bloco({ poiId: 'fantasma', hora: '09:00' }),
      bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
      bloco({ poiId: 'atr-2', hora: '15:00' }),
      bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
    ] }))
    const texto = instrucaoDeCorrecao(validarDia(d, DISPONIVEIS))
    assert.ok(texto.includes('fantasma'))
    assert.ok(texto.includes('Corrija'))
  })
})
