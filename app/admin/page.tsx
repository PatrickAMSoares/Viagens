import Link from 'next/link'
import { Cartao, Metrica, Titulo } from '@/components/admin/ui'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

const NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000

export default async function AdminDashboard() {
  const limite = new Date(Date.now() - NOVENTA_DIAS)

  const [
    destinos, atracoes, restaurantes, produtos,
    nuncaVerificadas, vencidas, viagens, pedidosPagos, receita,
    porDestino,
  ] = await Promise.all([
    prisma.destino.count({ where: { ativo: true } }),
    prisma.atracao.count({ where: { ativo: true } }),
    prisma.restaurante.count({ where: { ativo: true } }),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.atracao.count({ where: { verificadoEm: null } }),
    prisma.atracao.count({ where: { verificadoEm: { lt: limite } } }),
    prisma.viagem.count(),
    prisma.pedido.count({ where: { status: 'pago' } }),
    prisma.pedido.aggregate({ where: { status: 'pago' }, _sum: { valorCentavos: true } }),
    prisma.destino.findMany({
      where: { ativo: true },
      orderBy: [{ estado: 'asc' }, { nome: 'asc' }],
      select: {
        slug: true, nome: true, estado: true,
        _count: { select: { atracoes: true, restaurantes: true, transportes: true, dicasSeguranca: true } },
      },
    }),
  ])

  const pendentes = nuncaVerificadas + vencidas

  return (
    <>
      <Titulo>Visão geral</Titulo>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica rotulo="Roteiros gerados" valor={viagens} />
        <Metrica rotulo="Vendas" valor={pedidosPagos} />
        <Metrica
          rotulo="Receita"
          valor={`R$ ${((receita._sum.valorCentavos ?? 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
        <Metrica rotulo="Produtos ativos" valor={produtos} />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica rotulo="Destinos" valor={destinos} />
        <Metrica rotulo="Atrações" valor={atracoes} />
        <Metrica rotulo="Restaurantes" valor={restaurantes} />
        <Metrica
          rotulo="Aguardando verificação"
          valor={pendentes}
          detalhe={`${nuncaVerificadas} nunca verificadas · ${vencidas} vencidas (90 dias)`}
          alerta={pendentes > 0}
        />
      </section>

      {pendentes > 0 && (
        <Cartao className="mt-6 border-coral-300 bg-coral-50 dark:bg-coral-700/15">
          <p className="text-sm leading-relaxed">
            <strong>⚠️ {pendentes} atrações com dado factual não verificado.</strong> Elas aparecem
            no roteiro com o aviso <em>&ldquo;Verifique esta informação antes de sair&rdquo;</em>.
            Preço, horário e endereço precisam de <code>fonte</code> e <code>data</code> antes de
            contarem como confiáveis.
          </p>
        </Cartao>
      )}

      <h2 className="mb-4 mt-10 font-display text-lg font-600">Destinos e cobertura do catálogo</h2>
      <Cartao className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-[rgb(var(--fundo-suave))] text-left text-xs uppercase tracking-wider texto-suave">
            <tr>
              <th className="px-5 py-3 font-medium">Destino</th>
              <th className="px-3 py-3 font-medium">Atrações</th>
              <th className="px-3 py-3 font-medium">Restaurantes</th>
              <th className="px-3 py-3 font-medium">Transporte</th>
              <th className="px-3 py-3 font-medium">Segurança</th>
              <th className="px-5 py-3 font-medium">Pronto?</th>
            </tr>
          </thead>
          <tbody>
            {porDestino.map((d) => {
              const pronto =
                d._count.atracoes >= 45 && d._count.restaurantes >= 25 &&
                d._count.transportes >= 6 && d._count.dicasSeguranca >= 8
              return (
                <tr key={d.slug} className="border-b last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/admin/destinos/${d.slug}/atracoes`} className="font-medium hover:underline">
                      {d.nome}
                    </Link>
                    <span className="ml-1.5 texto-suave">{d.estado}</span>
                  </td>
                  <Celula valor={d._count.atracoes} minimo={45} />
                  <Celula valor={d._count.restaurantes} minimo={25} />
                  <Celula valor={d._count.transportes} minimo={6} />
                  <Celula valor={d._count.dicasSeguranca} minimo={8} />
                  <td className="px-5 py-3">{pronto ? '✅' : '🚧'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Cartao>
      <p className="mt-3 text-xs texto-suave">
        Mínimos por destino conforme o checklist de docs/08-destinos-mvp.md.
      </p>
    </>
  )
}

function Celula({ valor, minimo }: { valor: number; minimo: number }) {
  return (
    <td className="px-3 py-3 tabular-nums">
      <span className={valor >= minimo ? '' : 'texto-suave'}>{valor}</span>
      <span className="texto-suave"> / {minimo}</span>
    </td>
  )
}
