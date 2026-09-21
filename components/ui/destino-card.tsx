import Link from 'next/link'
import { CapaDestino } from './capa-destino'
import type { Destino } from '@/lib/catalogo/tipos'

/**
 * Card de destino da home. Toda a superfície é clicável (alvo de toque
 * generoso no mobile); o botão é visual, não um segundo link aninhado.
 */
export function DestinoCard({ destino, prioridade = false }: { destino: Destino; prioridade?: boolean }) {
  return (
    <Link
      href={`/roteiro/novo?destino=${destino.slug}`}
      className="group superficie flex flex-col overflow-hidden rounded-2xl border shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
        <CapaDestino destino={destino} prioridade={prioridade} />
        <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/75 via-tinta-900/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-600 text-white drop-shadow-sm">{destino.nome}</h3>
          <p className="text-sm text-white/80">{destino.estado}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-sm leading-relaxed texto-suave">{destino.descricaoCurta}</p>

        <ul className="flex flex-wrap gap-1.5">
          {destino.tags.map((tag) => (
            <li
              key={tag.rotulo}
              className="rounded-full bg-tinta-100 px-2.5 py-1 text-xs font-medium text-tinta-600 dark:bg-tinta-800 dark:text-tinta-200"
            >
              <span aria-hidden="true">{tag.icone}</span> {tag.rotulo}
            </li>
          ))}
        </ul>

        <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-azul-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-azul-600">
          Criar roteiro
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
