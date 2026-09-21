import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cartao, SeloConfianca, Titulo } from '@/components/admin/ui'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export default async function ListaAtracoes({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const destino = await prisma.destino.findUnique({
    where: { slug },
    include: { atracoes: { orderBy: [{ verificadoEm: 'asc' }, { nome: 'asc' }] } },
  })

  if (!destino) notFound()

  const pendentes = destino.atracoes.filter((a) => a.verificadoEm === null).length

  return (
    <>
      <Titulo
        acao={
          <Link
            href={`/admin/destinos/${slug}/atracoes/nova`}
            className="rounded-xl bg-azul-500 px-4 py-2 text-sm font-semibold text-white hover:bg-azul-600"
          >
            + Nova atração
          </Link>
        }
      >
        {destino.nome} · atrações
      </Titulo>

      <p className="mb-5 text-sm texto-suave">
        {destino.atracoes.length} cadastradas · {pendentes} aguardando verificação.
        Ordenadas por quem precisa de atenção primeiro.
      </p>

      <Cartao className="overflow-hidden p-0">
        {destino.atracoes.length === 0 ? (
          <p className="p-8 text-center text-sm texto-suave">
            Nenhuma atração ainda. Comece por uma que você conhece bem.
          </p>
        ) : (
          <ul>
            {destino.atracoes.map((a) => (
              <li key={a.id} className="border-b last:border-0">
                <Link
                  href={`/admin/destinos/${slug}/atracoes/${a.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3.5 transition hover:bg-tinta-50 dark:hover:bg-tinta-800/50"
                >
                  <span className="font-medium">{a.nome}</span>
                  <span className="rounded-full bg-tinta-100 px-2 py-0.5 text-xs texto-suave dark:bg-tinta-800">
                    {a.categoria}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    {!a.endereco && <span className="text-xs texto-suave">sem endereço</span>}
                    {a.precoMin === null && !a.gratuito && (
                      <span className="text-xs texto-suave">sem preço</span>
                    )}
                    <SeloConfianca confianca={a.confianca} verificadoEm={a.verificadoEm} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </>
  )
}
