'use client'

import { TOTAL_ETAPAS } from '@/lib/questionario/perguntas'

export function BarraProgresso({ etapa }: { etapa: number }) {
  const percentual = (etapa / TOTAL_ETAPAS) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium texto-suave">
        <span aria-live="polite">
          Etapa {etapa} de {TOTAL_ETAPAS}
        </span>
        <span>{Math.round(percentual)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={etapa}
        aria-valuemin={1}
        aria-valuemax={TOTAL_ETAPAS}
        aria-label={`Etapa ${etapa} de ${TOTAL_ETAPAS}`}
        className="h-1.5 overflow-hidden rounded-full bg-tinta-200 dark:bg-tinta-700"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-azul-500 to-[#6E56CF] transition-[width] duration-500 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  )
}
