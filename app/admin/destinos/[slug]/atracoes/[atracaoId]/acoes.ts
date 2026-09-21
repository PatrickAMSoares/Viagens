'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

/** Campo numérico opcional vindo de <input>: '' vira null. */
const numeroOpcional = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().nullable(),
)

const atracaoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome'),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen'),
  categoria: z.string().trim().min(2, 'Informe a categoria'),
  descricao: z.string().trim().min(10, 'Descreva em pelo menos uma frase'),
  subcategorias: z.string().default(''),
  perfisIndicados: z.string().default(''),
  endereco: z.string().trim().default(''),
  bairro: z.string().trim().default(''),
  lat: numeroOpcional,
  lng: numeroOpcional,
  precoMin: numeroOpcional,
  precoMax: numeroOpcional,
  precoObs: z.string().trim().default(''),
  gratuito: z.coerce.boolean().default(false),
  duracaoRecomendadaMin: numeroOpcional,
  prioridadeBase: z.coerce.number().int().min(1).max(5).default(3),
  adequadoCriancas: z.coerce.boolean().default(true),
  requerReserva: z.coerce.boolean().default(false),
  indoor: z.coerce.boolean().default(false),
  infoSeguranca: z.string().trim().default(''),
  dicas: z.string().trim().default(''),
  fonteUrl: z.string().trim().url('Informe uma URL válida').or(z.literal('')).default(''),
  confianca: z.enum(['alta', 'media', 'baixa']).default('baixa'),
  marcarVerificado: z.coerce.boolean().default(false),
  ativo: z.coerce.boolean().default(true),
})

export interface EstadoForm {
  erro?: string
  campos?: Record<string, string>
}

function listaDe(texto: string) {
  return texto.split(',').map((s) => s.trim()).filter(Boolean)
}

export async function salvarAtracao(
  slugDestino: string,
  atracaoId: string | null,
  _anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const bruto = Object.fromEntries(formData) as Record<string, string>
  // Checkboxes ausentes no FormData significam "false".
  for (const campo of ['gratuito', 'adequadoCriancas', 'requerReserva', 'indoor', 'ativo', 'marcarVerificado']) {
    bruto[campo] = formData.get(campo) === 'on' ? 'true' : ''
  }

  const analise = atracaoSchema.safeParse(bruto)
  if (!analise.success) {
    const campos: Record<string, string> = {}
    for (const issue of analise.error.issues) campos[String(issue.path[0])] = issue.message
    return { erro: 'Confira os campos destacados.', campos }
  }
  const d = analise.data

  // Marcar como verificado exige fonte — é a regra que protege o catálogo.
  if (d.marcarVerificado && !d.fonteUrl) {
    return {
      erro: 'Para marcar como verificado, informe a URL da fonte oficial.',
      campos: { fonteUrl: 'Obrigatória para verificar' },
    }
  }

  const destino = await prisma.destino.findUnique({ where: { slug: slugDestino } })
  if (!destino) return { erro: 'Destino não encontrado.' }

  const dados = {
    nome: d.nome,
    slug: d.slug,
    categoria: d.categoria,
    subcategorias: listaDe(d.subcategorias),
    descricao: d.descricao,
    perfisIndicados: listaDe(d.perfisIndicados),
    endereco: d.endereco || null,
    bairro: d.bairro || null,
    lat: d.lat,
    lng: d.lng,
    precoMin: d.precoMin,
    precoMax: d.precoMax,
    precoObs: d.precoObs || null,
    gratuito: d.gratuito,
    duracaoRecomendadaMin: d.duracaoRecomendadaMin,
    prioridadeBase: d.prioridadeBase,
    adequadoCriancas: d.adequadoCriancas,
    requerReserva: d.requerReserva,
    indoor: d.indoor,
    infoSeguranca: d.infoSeguranca || null,
    dicas: d.dicas || null,
    fonteUrl: d.fonteUrl || null,
    confianca: d.confianca,
    ativo: d.ativo,
    ...(d.marcarVerificado ? { verificadoEm: new Date() } : {}),
  }

  const anterior = atracaoId
    ? await prisma.atracao.findUnique({ where: { id: atracaoId } })
    : null

  const salva = atracaoId
    ? await prisma.atracao.update({ where: { id: atracaoId }, data: dados })
    : await prisma.atracao.create({ data: { destinoId: destino.id, ...dados } })

  // Trilha de auditoria dos campos factuais (docs/03 — fontes_verificacao).
  if (d.marcarVerificado) {
    await prisma.fonteVerificacao.create({
      data: {
        entidade: 'atracao',
        entidadeId: salva.id,
        campo: 'registro',
        valorAnterior: anterior ? resumoFactual(anterior) : null,
        valorNovo: resumoFactual(salva),
        fonteUrl: d.fonteUrl || null,
      },
    })
  }

  revalidatePath(`/admin/destinos/${slugDestino}/atracoes`)
  revalidatePath('/admin')
  redirect(`/admin/destinos/${slugDestino}/atracoes`)
}

/** Snapshot só dos campos que o produto promete como verdade factual. */
function resumoFactual(a: {
  endereco: string | null
  precoMin: unknown
  precoMax: unknown
  duracaoRecomendadaMin: number | null
}) {
  return JSON.stringify({
    endereco: a.endereco,
    precoMin: a.precoMin?.toString() ?? null,
    precoMax: a.precoMax?.toString() ?? null,
    duracao: a.duracaoRecomendadaMin,
  })
}

export async function excluirAtracao(slugDestino: string, atracaoId: string) {
  await prisma.atracao.delete({ where: { id: atracaoId } })
  revalidatePath(`/admin/destinos/${slugDestino}/atracoes`)
  redirect(`/admin/destinos/${slugDestino}/atracoes`)
}
