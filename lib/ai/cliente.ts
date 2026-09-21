import Anthropic from '@anthropic-ai/sdk'

/**
 * Cliente da Claude API. Só server-side — a chave nunca vai ao navegador.
 */
export const anthropic = new Anthropic({
  maxRetries: 2,
  timeout: 10 * 60 * 1000,
})

/** Modelos por etapa do pipeline — ver docs/05-custos-operacionais.md §1. */
export const MODELOS = {
  /** O produto pago: qualidade do texto longo e do encaixe logístico. */
  roteiro: 'claude-opus-5',
  /** Roda para todo visitante — precisa ser barato. */
  previa: 'claude-haiku-4-5',
  /** Extração simples do texto livre da etapa 7. */
  parse: 'claude-haiku-4-5',
} as const

/** Preço por milhão de tokens (USD), para registrar custo real por roteiro. */
const PRECOS: Record<string, { entrada: number; saida: number; cache: number }> = {
  'claude-opus-5': { entrada: 5, saida: 25, cache: 0.5 },
  'claude-haiku-4-5': { entrada: 1, saida: 5, cache: 0.1 },
}

export function calcularCustoUsd(
  modelo: string,
  uso: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null },
): number {
  const p = PRECOS[modelo]
  if (!p) return 0
  const cache = uso.cache_read_input_tokens ?? 0
  const entradaNova = Math.max(0, uso.input_tokens - cache)
  const total =
    (entradaNova * p.entrada + cache * p.cache + uso.output_tokens * p.saida) / 1_000_000
  return Number(total.toFixed(6))
}
