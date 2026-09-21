import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { MODELOS, anthropic, calcularCustoUsd } from './cliente'
import { SISTEMA_BASE, blocoCatalogo, blocoRegioes, blocoViajante } from './prompts'
import { diaSchema, type Dia } from './schema'
import { instrucaoDeCorrecao, validarDia } from './validar'
import type { PerfilViagem, PoiPontuado } from '@/lib/selecao/tipos'

export interface Uso {
  tokensEntrada: number
  tokensSaida: number
  custoUsd: number
}

export interface RespostaModelo {
  dia: Dia | null
  recusou: boolean
  uso: Uso
}

/**
 * Chamada ao modelo, isolada do laço de validação para poder ser substituída
 * nos testes. É a única função deste módulo que toca a rede.
 */
export type ChamarModelo = (instrucoes: string) => Promise<RespostaModelo>

export interface ResultadoDia {
  dia: Dia
  uso: Uso
  tentativas: number
}

export class FalhaDeGeracao extends Error {
  constructor(message: string, readonly problemas: string[]) {
    super(message)
    this.name = 'FalhaDeGeracao'
  }
}

export interface OpcoesDia {
  destino: string
  numeroDoDia: number
  candidatos: PoiPontuado[]
  regioes: PoiPontuado[][]
  regiaoDoDia: number
  viagem: PerfilViagem
  desejosTexto: string
  /** POIs já usados nos dias anteriores, para não repetir. */
  jaUsados: string[]
}

export function montarInstrucoes(o: OpcoesDia): string {
  const historico =
    o.jaUsados.length > 0
      ? `\nJÁ USADOS NOS DIAS ANTERIORES (não repita): ${o.jaUsados.join(', ')}`
      : ''

  return [
    blocoCatalogo(o.destino, o.candidatos),
    blocoRegioes(o.regioes),
    blocoViajante(o.viagem, o.desejosTexto),
    `TAREFA
Monte o DIA ${o.numeroDoDia} de ${o.viagem.dias}, concentrado na Região ${o.regiaoDoDia + 1}.${historico}`,
  ].join('\n\n')
}

/**
 * Gera UM dia do roteiro, com um retry guiado pelos problemas encontrados.
 *
 * Um dia por chamada — e não o roteiro inteiro — porque a saída cabe folgada
 * em `max_tokens` sem streaming, a tela pode mostrar progresso, e um dia ruim
 * é regerado sozinho sem refazer a viagem toda.
 */
export async function gerarDia(
  opcoes: OpcoesDia,
  chamar: ChamarModelo = chamarClaude,
): Promise<ResultadoDia> {
  const disponiveis = opcoes.candidatos.map((c) => c.poi)
  const instrucoes = montarInstrucoes(opcoes)
  const uso: Uso = { tokensEntrada: 0, tokensSaida: 0, custoUsd: 0 }

  let correcao = ''

  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    const resposta = await chamar(correcao ? `${instrucoes}\n\n${correcao}` : instrucoes)

    uso.tokensEntrada += resposta.uso.tokensEntrada
    uso.tokensSaida += resposta.uso.tokensSaida
    uso.custoUsd = Number((uso.custoUsd + resposta.uso.custoUsd).toFixed(6))

    if (resposta.recusou) {
      throw new FalhaDeGeracao('O modelo recusou a geração.', [])
    }

    if (!resposta.dia) {
      correcao = 'A resposta anterior não respeitou o formato exigido. Responda no schema pedido.'
      if (tentativa === 2) {
        throw new FalhaDeGeracao(`Dia ${opcoes.numeroDoDia}: formato inválido após 2 tentativas.`, [])
      }
      continue
    }

    const problemas = validarDia(resposta.dia, disponiveis, {
      restaurantesNoDia: opcoes.viagem.dias === 1 ? 1 : 2,
    })

    if (problemas.length === 0) {
      return { dia: resposta.dia, uso, tentativas: tentativa }
    }

    if (tentativa === 2) {
      throw new FalhaDeGeracao(
        `Dia ${opcoes.numeroDoDia} não passou na validação após 2 tentativas.`,
        problemas.map((p) => p.mensagem),
      )
    }

    // Dizer o que está errado funciona melhor do que só pedir "tente de novo".
    correcao = instrucaoDeCorrecao(problemas)
  }

  throw new FalhaDeGeracao(`Dia ${opcoes.numeroDoDia} não pôde ser gerado.`, [])
}

/** Implementação real: Claude API com structured output e prompt caching. */
export const chamarClaude: ChamarModelo = async (instrucoes) => {
  const resposta = await anthropic.messages.parse({
    model: MODELOS.roteiro,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: zodOutputFormat(diaSchema) },
    // Cacheia o prefixo estável (sistema + catálogo); o perfil vem depois.
    cache_control: { type: 'ephemeral' },
    system: SISTEMA_BASE,
    messages: [{ role: 'user', content: instrucoes }],
  })

  return {
    dia: resposta.parsed_output ?? null,
    recusou: resposta.stop_reason === 'refusal',
    uso: {
      tokensEntrada: resposta.usage.input_tokens,
      tokensSaida: resposta.usage.output_tokens,
      custoUsd: calcularCustoUsd(MODELOS.roteiro, resposta.usage),
    },
  }
}
