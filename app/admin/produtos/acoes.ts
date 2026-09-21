'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

const schema = z.object({
  id: z.string().uuid(),
  preco: z.coerce.number().min(0).max(100_000),
  precoRiscado: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).max(100_000).nullable(),
  ),
  destaque: z.coerce.boolean(),
  ativo: z.coerce.boolean(),
})

export async function salvarProduto(_anterior: { ok?: boolean; erro?: string }, formData: FormData) {
  const analise = schema.safeParse({
    id: formData.get('id'),
    preco: formData.get('preco'),
    precoRiscado: formData.get('precoRiscado'),
    destaque: formData.get('destaque') === 'on',
    ativo: formData.get('ativo') === 'on',
  })

  if (!analise.success) return { erro: 'Valor inválido.' }
  const d = analise.data

  await prisma.produto.update({
    where: { id: d.id },
    data: {
      // Reais na interface, centavos no banco — dinheiro nunca é float.
      precoCentavos: Math.round(d.preco * 100),
      precoRiscadoCentavos: d.precoRiscado === null ? null : Math.round(d.precoRiscado * 100),
      destaque: d.destaque,
      ativo: d.ativo,
    },
  })

  revalidatePath('/admin/produtos')
  return { ok: true }
}
