import { Cartao, Titulo } from '@/components/admin/ui'
import { prisma } from '@/lib/db/prisma'
import { FormularioProduto } from './formulario'

export const dynamic = 'force-dynamic'

export default async function AdminProdutos() {
  const produtos = await prisma.produto.findMany({ orderBy: { ordem: 'asc' } })

  return (
    <>
      <Titulo>Produtos e preços</Titulo>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed texto-suave">
        Os preços ficam no banco justamente para permitir teste A/B sem deploy. Alterar aqui muda
        o checkout imediatamente — pedidos já criados mantêm o valor que foi cobrado.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {produtos.map((p) => (
          <Cartao key={p.id} className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-600">{p.nome}</h2>
              {p.destaque && (
                <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs font-medium text-coral-700 dark:bg-coral-700/30 dark:text-coral-100">
                  ⭐ destaque
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed texto-suave">{p.descricao}</p>
            <ul className="space-y-1 text-xs texto-suave">
              {(p.beneficios as string[]).map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <FormularioProduto
              id={p.id}
              precoCentavos={p.precoCentavos}
              precoRiscadoCentavos={p.precoRiscadoCentavos}
              destaque={p.destaque}
              ativo={p.ativo}
            />
          </Cartao>
        ))}
      </div>
    </>
  )
}
