'use client'

import { cn } from '@/lib/utils'

/**
 * Chip de seleção do questionário. Alvo de toque >= 44px, estado visual
 * claro e `aria-pressed` para leitores de tela.
 */
export function Chip({
  icone,
  rotulo,
  descricao,
  ativo,
  onClick,
}: {
  icone: string
  rotulo: string
  descricao?: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-150 active:scale-[.98]',
        ativo
          ? 'border-azul-500 bg-azul-50 ring-2 ring-azul-500/25 dark:bg-azul-900/50'
          : 'superficie hover:border-azul-300',
      )}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {icone}
      </span>
      <span className="flex-1">
        <span className={cn('block text-sm font-medium', ativo && 'text-azul-600 dark:text-azul-200')}>
          {rotulo}
        </span>
        {descricao && <span className="mt-0.5 block text-xs leading-snug texto-suave">{descricao}</span>}
      </span>
      {ativo && (
        <span aria-hidden="true" className="text-sm font-bold text-azul-500">
          ✓
        </span>
      )}
    </button>
  )
}
