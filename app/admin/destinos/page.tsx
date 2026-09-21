import Link from 'next/link'
import { Cartao, Titulo } from '@/components/admin/ui'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDestinos() {
  const destinos = await prisma.destino.findMany({
    orderBy: [{ estado: 'asc' }, { nome: 'asc' }],
    select: {
      slug: true, nome: true, estado: true, descricaoCurta: true, ativo: true,
      _count: { select: { atracoes: true, restaurantes: true } },
    },
  })

  return (
    <>
      <Titulo>Destinos</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        {destinos.map((d) => (
          <Cartao key={d.slug}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-600">{d.nome}</h2>
                <p className="text-xs texto-suave">{d.estado}</p>
              </div>
              {!d.ativo && (
                <span className="rounded-full bg-tinta-100 px-2 py-0.5 text-xs dark:bg-tinta-800">
                  Inativo
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed texto-suave">{d.descricaoCurta}</p>
            <p className="mt-3 text-xs texto-suave">
              {d._count.atracoes} atrações · {d._count.restaurantes} restaurantes
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/admin/destinos/${d.slug}/atracoes`}
                className="rounded-xl bg-azul-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-azul-600"
              >
                Curar atrações
              </Link>
              <Link
                href={`/roteiro/novo?destino=${d.slug}`}
                className="rounded-xl border px-3 py-1.5 text-sm font-semibold hover:bg-tinta-50 dark:hover:bg-tinta-800"
              >
                Ver no site ↗
              </Link>
            </div>
          </Cartao>
        ))}
      </div>
    </>
  )
}
