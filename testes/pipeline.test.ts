import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { FalhaDeGeracao, gerarDia, montarInstrucoes, type ChamarModelo } from '../lib/ai/gerar-dia'
import { diaSchema } from '../lib/ai/schema'
import { selecionarCandidatos } from '../lib/selecao/pontuar'
import { agruparPorRegiao } from '../lib/selecao/agrupar'
import type { PerfilViagem, Poi } from '../lib/selecao/tipos'

function poi(id: string, over: Partial<Poi> = {}): Poi {
  return {
    id, tipo: 'atracao', nome: `Nome de ${id}`, categoria: 'parque', subcategorias: [],
    descricao: 'Descrição do lugar', perfisIndicados: ['casal'],
    lat: -29.37, lng: -50.87, precoMin: 40, precoMax: 60, gratuito: false,
    faixaPreco: null, duracaoRecomendadaMin: 90, adequadoCriancas: true,
    requerReserva: false, indoor: false, melhorHorario: ['manha'],
    prioridadeBase: 4, verificado: true, ...over,
  }
}

const POIS = [
  poi('atr-1'), poi('atr-2', { categoria: 'museu' }), poi('atr-3', { categoria: 'mirante' }),
  poi('alt-1', { categoria: 'museu', indoor: true }),
  poi('res-1', { tipo: 'restaurante' }), poi('res-2', { tipo: 'restaurante' }),
]

const VIAGEM: PerfilViagem = {
  dias: 2, perfil: ['comida', 'romance'], interesses: ['gastronomia', 'natureza'],
  companhia: 'casal', criancas: 0, estilo: 'equilibrado', orcamentoPessoa: 800,
  transportes: ['carro'], poiIdsDesejados: [],
}

const candidatos = selecionarCandidatos(POIS, VIAGEM)
const regioes = agruparPorRegiao(candidatos, 2)

const OPCOES = {
  destino: 'Gramado', numeroDoDia: 1, candidatos, regioes, regiaoDoDia: 0,
  viagem: VIAGEM, desejosTexto: 'Quero jantar bem', jaUsados: [],
}

function bloco(over: Record<string, unknown> = {}) {
  return {
    periodo: 'manha', hora: '09:00', titulo: 'Atividade', poiId: 'atr-1', poiTipo: 'atracao',
    descricao: 'Uma descrição suficientemente longa para passar no schema sem erro.',
    porQueCombina: 'Você marcou que é apaixonado por comida.',
    duracaoMin: 90, prioridade: 'imperdivel', ...over,
  }
}

function diaValido(over: Record<string, unknown> = {}) {
  return diaSchema.parse({
    numero: 1, titulo: 'Dia de chegar com calma',
    abertura: 'Uma abertura com tamanho suficiente para o schema aceitar sem reclamar nada.',
    antesDeSair: { transito: 'Tranquilo', estacionamento: 'Fácil', recomendacaoModal: 'carro' },
    blocos: [
      bloco({ poiId: 'atr-1', hora: '09:00' }),
      bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30', periodo: 'almoco' }),
      bloco({ poiId: 'atr-2', hora: '15:00', periodo: 'tarde' }),
      bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00', periodo: 'noite' }),
    ],
    planoB: {
      chuva: [{ poiId: 'alt-1', poiTipo: 'atracao', motivo: 'é coberto e fica logo ali' }],
      cansaco: [], transito: [], lotado: [],
    },
    encerramento: 'Durma bem.',
    ...over,
  })
}

const USO = { tokensEntrada: 12000, tokensSaida: 4000, custoUsd: 0.12 }

describe('montarInstrucoes', () => {
  it('inclui apenas IDs do catálogo selecionado', () => {
    const texto = montarInstrucoes(OPCOES)
    for (const c of candidatos) assert.ok(texto.includes(`id=${c.poi.id}`))
  })

  it('não expõe preço nem horário ao modelo', () => {
    const texto = montarInstrucoes(OPCOES)
    assert.ok(!texto.includes('preco='), 'o modelo não pode ver preço — ele não escreve preço')
    assert.ok(!texto.includes('horario='))
  })

  it('injeta o perfil declarado pelo viajante', () => {
    const texto = montarInstrucoes(OPCOES)
    assert.ok(texto.includes('gastronomia'))
    assert.ok(texto.includes('Quero jantar bem'))
  })

  it('avisa o que já foi usado nos dias anteriores', () => {
    const texto = montarInstrucoes({ ...OPCOES, numeroDoDia: 2, jaUsados: ['atr-1', 'res-1'] })
    assert.ok(texto.includes('JÁ USADOS'))
    assert.ok(texto.includes('atr-1'))
  })
})

describe('gerarDia — laço de validação e retry', () => {
  it('aceita de primeira um dia válido', async () => {
    let chamadas = 0
    const falso: ChamarModelo = async () => {
      chamadas++
      return { dia: diaValido(), recusou: false, uso: USO }
    }
    const r = await gerarDia(OPCOES, falso)
    assert.equal(chamadas, 1)
    assert.equal(r.tentativas, 1)
    assert.equal(r.uso.tokensSaida, 4000)
  })

  it('reclama do POI inventado e aceita a correção na segunda tentativa', async () => {
    const instrucoesRecebidas: string[] = []
    let chamadas = 0

    const falso: ChamarModelo = async (instrucoes) => {
      instrucoesRecebidas.push(instrucoes)
      chamadas++
      if (chamadas === 1) {
        // O modelo inventa um restaurante que não existe no catálogo.
        return {
          dia: diaValido({ blocos: [
            bloco({ poiId: 'cafe-colonial-inventado', hora: '09:00' }),
            bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
            bloco({ poiId: 'atr-2', hora: '15:00' }),
            bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
          ] }),
          recusou: false, uso: USO,
        }
      }
      return { dia: diaValido(), recusou: false, uso: USO }
    }

    const r = await gerarDia(OPCOES, falso)

    assert.equal(r.tentativas, 2)
    assert.ok(
      instrucoesRecebidas[1].includes('cafe-colonial-inventado'),
      'o retry precisa dizer ao modelo exatamente o que ele inventou',
    )
    assert.ok(instrucoesRecebidas[1].includes('Corrija'))
    // O custo das duas tentativas é somado — não se perde de vista o gasto real.
    assert.equal(r.uso.tokensSaida, 8000)
    assert.equal(r.uso.custoUsd, 0.24)
  })

  it('falha explicitamente quando o modelo insiste no erro', async () => {
    const falso: ChamarModelo = async () => ({
      dia: diaValido({ blocos: [
        bloco({ poiId: 'nao-existe', hora: '09:00' }),
        bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
        bloco({ poiId: 'atr-2', hora: '15:00' }),
        bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
      ] }),
      recusou: false, uso: USO,
    })

    await assert.rejects(
      () => gerarDia(OPCOES, falso),
      (e: unknown) => {
        assert.ok(e instanceof FalhaDeGeracao)
        assert.ok(e.problemas.some((p) => p.includes('nao-existe')))
        return true
      },
    )
  })

  it('propaga recusa do modelo sem tentar de novo', async () => {
    let chamadas = 0
    const falso: ChamarModelo = async () => {
      chamadas++
      return { dia: null, recusou: true, uso: USO }
    }
    await assert.rejects(() => gerarDia(OPCOES, falso), FalhaDeGeracao)
    assert.equal(chamadas, 1, 'recusa não é erro de formato: não adianta insistir')
  })

  it('pede o formato de novo quando a resposta não parseia', async () => {
    const recebidas: string[] = []
    let chamadas = 0
    const falso: ChamarModelo = async (i) => {
      recebidas.push(i)
      chamadas++
      return chamadas === 1
        ? { dia: null, recusou: false, uso: USO }
        : { dia: diaValido(), recusou: false, uso: USO }
    }
    const r = await gerarDia(OPCOES, falso)
    assert.equal(r.tentativas, 2)
    assert.ok(recebidas[1].includes('schema'))
  })
})

describe('gerarRoteiro — viagem completa', () => {
  it('gera todos os dias, acumula custo e não repete POI entre dias', async () => {
    const { gerarRoteiro } = await import('../lib/ai/gerar-roteiro')
    const progresso: number[] = []
    const instrucoes: string[] = []

    const falso: ChamarModelo = async (texto) => {
      instrucoes.push(texto)
      const numero = instrucoes.length
      // Alterna os POIs por dia para simular um modelo que respeita o histórico.
      const par = numero % 2 === 0
      return {
        dia: diaValido({
          numero,
          blocos: [
            bloco({ poiId: par ? 'atr-3' : 'atr-1', hora: '09:00' }),
            bloco({ poiId: 'res-1', poiTipo: 'restaurante', hora: '12:30' }),
            bloco({ poiId: par ? 'alt-1' : 'atr-2', hora: '15:00' }),
            bloco({ poiId: 'res-2', poiTipo: 'restaurante', hora: '20:00' }),
          ],
          planoB: {
            chuva: [{ poiId: par ? 'atr-2' : 'alt-1', poiTipo: 'atracao', motivo: 'coberto e pertinho daqui' }],
            cansaco: [], transito: [], lotado: [],
          },
        }),
        recusou: false,
        uso: USO,
      }
    }

    const r = await gerarRoteiro(
      {
        destino: 'Gramado', pois: POIS, viagem: VIAGEM, desejosTexto: '',
        aoConcluirDia: (p) => progresso.push(p.dia),
      },
      falso,
    )

    assert.equal(r.dias.length, 2)
    assert.deepEqual(progresso, [1, 2])
    assert.equal(r.uso.tokensSaida, 8000, 'custo dos dois dias somado')
    assert.ok(
      instrucoes[1].includes('JÁ USADOS'),
      'o segundo dia precisa saber o que o primeiro usou',
    )
  })

  it('hidrata os dias com preço e nome vindos do banco', async () => {
    const { gerarRoteiro } = await import('../lib/ai/gerar-roteiro')
    const falso: ChamarModelo = async () => ({ dia: diaValido(), recusou: false, uso: USO })

    const r = await gerarRoteiro(
      { destino: 'Gramado', pois: POIS, viagem: { ...VIAGEM, dias: 1 }, desejosTexto: '' },
      falso,
    )

    const primeiro = r.dias[0].blocos[0]
    assert.equal(primeiro.nome, 'Nome de atr-1')
    assert.deepEqual(primeiro.preco, { min: 40, max: 60, gratuito: false })
    assert.ok(r.dias[0].orcamento.total > 0)
  })

  it('reporta desejo que não existe no catálogo em vez de silenciar', async () => {
    const { gerarRoteiro } = await import('../lib/ai/gerar-roteiro')
    const falso: ChamarModelo = async () => ({ dia: diaValido(), recusou: false, uso: USO })

    const r = await gerarRoteiro(
      {
        destino: 'Gramado', pois: POIS,
        viagem: { ...VIAGEM, dias: 1, poiIdsDesejados: ['passeio-de-balao'] },
        desejosTexto: 'Quero andar de balão',
      },
      falso,
    )

    assert.deepEqual(r.desejosNaoAtendidos, ['passeio-de-balao'])
  })
})
