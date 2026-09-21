import { z } from 'zod'

/**
 * Contrato de saída do modelo (docs/07-motor-de-ia.md §3).
 *
 * Regra central: o modelo devolve `poiId`, texto e organização — NUNCA fato.
 * Endereço, preço, horário e tempo de deslocamento são preenchidos pelo
 * servidor a partir do banco depois da geração (ver lib/ai/hidratar.ts).
 * Por isso eles não existem neste schema: o modelo não tem como inventá-los
 * porque não tem onde escrevê-los.
 */

export const prioridadeSchema = z.enum(['imperdivel', 'recomendado', 'se_der_tempo'])

export const periodoSchema = z.enum(['manha', 'almoco', 'tarde', 'fim_tarde', 'noite'])

export const blocoSchema = z.object({
  periodo: periodoSchema,
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM'),
  titulo: z.string().min(3).max(80),
  poiId: z.string().min(1).describe('ID exato de um POI da lista fornecida'),
  poiTipo: z.enum(['atracao', 'restaurante']),
  descricao: z.string().min(20).max(600),
  porQueCombina: z
    .string()
    .min(15)
    .max(300)
    .describe('Uma frase ligando esta escolha ao perfil declarado pelo viajante'),
  duracaoMin: z.number().int().min(15).max(600),
  prioridade: prioridadeSchema,
})

export const alternativaSchema = z.object({
  poiId: z.string().min(1),
  poiTipo: z.enum(['atracao', 'restaurante']),
  motivo: z.string().min(10).max(200),
})

export const planoBSchema = z.object({
  chuva: z.array(alternativaSchema).min(1).max(3),
  cansaco: z.array(alternativaSchema).max(3),
  transito: z.array(alternativaSchema).max(3),
  lotado: z.array(alternativaSchema).max(3),
})

export const diaSchema = z.object({
  numero: z.number().int().min(1).max(14),
  titulo: z.string().min(3).max(80).describe('Ex.: "Hoje é dia de desacelerar"'),
  abertura: z.string().min(30).max(500).describe('Duas ou três frases dando o tom do dia'),
  antesDeSair: z.object({
    transito: z.string().max(400),
    estacionamento: z.string().max(400),
    recomendacaoModal: z.enum(['a_pe', 'publico', 'carro', 'app', 'transfer', 'misto']),
  }),
  blocos: z.array(blocoSchema).min(3).max(8),
  planoB: planoBSchema,
  encerramento: z.string().max(300),
})

export const roteiroSchema = z.object({
  perfilIdentificado: z.string().min(10).max(200),
  resumo: z.string().min(30).max(600),
  destaques: z.array(z.string().min(5).max(120)).min(3).max(6),
  dias: z.array(diaSchema).min(1).max(14),
  seguranca: z.array(z.object({ contexto: z.string(), texto: z.string().max(400) })).max(10),
  transporteResumo: z.string().max(800),
  dicasFinais: z.array(z.string().max(300)).max(8),
  avisos: z.array(z.string().max(300)).max(6),
})

/** A prévia gratuita: barata, sem os dias completos. */
export const previaSchema = z.object({
  perfilIdentificado: z.string().min(10).max(200),
  resumo: z.string().min(30).max(600),
  destaques: z.array(z.string().min(5).max(120)).min(3).max(6),
  primeiroPeriodo: z.object({
    titulo: z.string().min(3).max(80),
    abertura: z.string().min(30).max(500),
    blocos: z.array(blocoSchema).min(1).max(3),
  }),
})

export type Bloco = z.infer<typeof blocoSchema>
export type Dia = z.infer<typeof diaSchema>
export type Roteiro = z.infer<typeof roteiroSchema>
export type Previa = z.infer<typeof previaSchema>
export type Prioridade = z.infer<typeof prioridadeSchema>
