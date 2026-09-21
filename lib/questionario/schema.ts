import { z } from 'zod'

/**
 * Contrato das respostas do questionário (docs/02-fluxo-usuario.md).
 * É a fronteira entre a UI e o motor de IA: o que passa daqui já está validado.
 */

export const PERFIS = [
  'relaxar', 'explorar', 'fotos', 'comida', 'natureza', 'noite', 'cultura',
  'compras', 'romance', 'familia', 'aventura', 'economizar', 'conforto',
] as const

export const COMPANHIAS = ['sozinho', 'casal', 'amigos', 'familia', 'criancas', 'grupo'] as const

export const ESTILOS = ['economico', 'equilibrado', 'confortavel', 'premium'] as const

export const TRANSPORTES = [
  'a_pe', 'publico', 'carro', 'app', 'transfer', 'carro_publico', 'nao_sei',
] as const

export const INTERESSES = [
  'praias', 'natureza', 'trilhas', 'vinhos', 'gastronomia', 'cafes', 'museus',
  'historia', 'fotografia', 'por_do_sol', 'vida_noturna', 'compras', 'aventura',
  'familia', 'romance', 'pontos_famosos', 'fora_do_obvio',
] as const

export const respostasSchema = z.object({
  destino: z.string().min(1, 'Escolha um destino'),
  perfil: z.array(z.enum(PERFIS)).min(1, 'Escolha pelo menos uma opção'),
  companhia: z.enum(COMPANHIAS),
  adultos: z.number().int().min(1).max(20).default(1),
  criancas: z.number().int().min(0).max(10).default(0),
  dias: z.number().int().min(1).max(14),
  estilo: z.enum(ESTILOS),
  orcamentoPessoa: z.number().int().min(0).max(100_000).nullable().default(null),
  transportes: z.array(z.enum(TRANSPORTES)).min(1, 'Escolha pelo menos uma opção'),
  interesses: z.array(z.enum(INTERESSES)).min(1, 'Escolha pelo menos uma opção'),
  desejosTexto: z.string().max(500).default(''),
})

export type Respostas = z.infer<typeof respostasSchema>

export const RESPOSTAS_INICIAIS: Respostas = {
  destino: '',
  perfil: [],
  companhia: 'casal',
  adultos: 2,
  criancas: 0,
  dias: 3,
  estilo: 'equilibrado',
  orcamentoPessoa: null,
  transportes: [],
  interesses: [],
  desejosTexto: '',
}

/** Etapas 1, 5 e 6 exigem seleção; as demais têm default sensato. */
export function etapaValida(etapa: number, r: Respostas): boolean {
  switch (etapa) {
    case 1: return r.perfil.length > 0
    case 2: return r.adultos >= 1
    case 3: return r.dias >= 1 && r.dias <= 14
    case 4: return true
    case 5: return r.transportes.length > 0
    case 6: return r.interesses.length > 0
    case 7: return r.desejosTexto.length <= 500
    default: return false
  }
}
