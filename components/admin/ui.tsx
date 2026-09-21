import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Cartao({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('superficie rounded-2xl border p-5 shadow-card', className)}>{children}</div>
}

export function Metrica({
  rotulo, valor, detalhe, alerta,
}: {
  rotulo: string; valor: number | string; detalhe?: string; alerta?: boolean
}) {
  return (
    <Cartao>
      <p className="text-xs font-medium uppercase tracking-wider texto-suave">{rotulo}</p>
      <p
        className={cn(
          'mt-1.5 font-display text-3xl font-700 tabular-nums',
          alerta && 'text-coral-500',
        )}
      >
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-xs texto-suave">{detalhe}</p>}
    </Cartao>
  )
}

export function Titulo({ children, acao }: { children: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-700">{children}</h1>
      {acao}
    </div>
  )
}

export function Campo({
  rotulo, dica, children,
}: {
  rotulo: string; dica?: string; children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-xs texto-suave">{dica}</span>}
    </label>
  )
}

export const entrada =
  'superficie w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-azul-400'

export function Botao({
  children, variante = 'primario', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'neutro' }) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50',
        variante === 'primario'
          ? 'bg-azul-500 text-white hover:bg-azul-600'
          : 'superficie border hover:bg-tinta-50 dark:hover:bg-tinta-800',
      )}
    >
      {children}
    </button>
  )
}

/** Selo de confiança do dado — o sinal mais importante do painel de curadoria. */
export function SeloConfianca({
  confianca, verificadoEm,
}: {
  confianca: 'alta' | 'media' | 'baixa'; verificadoEm: Date | null
}) {
  const vencido =
    verificadoEm !== null &&
    Date.now() - verificadoEm.getTime() > 90 * 24 * 60 * 60 * 1000

  if (verificadoEm === null) {
    return <Selo cor="coral">⚠️ Nunca verificado</Selo>
  }
  if (vencido) {
    return <Selo cor="coral">⏳ Vencido ({formatar(verificadoEm)})</Selo>
  }
  if (confianca === 'alta') {
    return <Selo cor="mata">✓ Verificado ({formatar(verificadoEm)})</Selo>
  }
  return <Selo cor="neutro">◐ Confiança {confianca}</Selo>
}

function Selo({ cor, children }: { cor: 'coral' | 'mata' | 'neutro'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        cor === 'coral' && 'bg-coral-100 text-coral-700 dark:bg-coral-700/30 dark:text-coral-100',
        cor === 'mata' && 'bg-mata-400/15 text-mata-600 dark:text-mata-400',
        cor === 'neutro' && 'bg-tinta-100 text-tinta-600 dark:bg-tinta-800 dark:text-tinta-200',
      )}
    >
      {children}
    </span>
  )
}

function formatar(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function LinkLinha({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block transition hover:bg-tinta-50 dark:hover:bg-tinta-800/50">
      {children}
    </Link>
  )
}
