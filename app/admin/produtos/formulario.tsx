'use client'

import { useActionState } from 'react'
import { Botao, Campo, entrada } from '@/components/admin/ui'
import { salvarProduto } from './acoes'

export function FormularioProduto({
  id, precoCentavos, precoRiscadoCentavos, destaque, ativo,
}: {
  id: string
  precoCentavos: number
  precoRiscadoCentavos: number | null
  destaque: boolean
  ativo: boolean
}) {
  const [estado, acao, enviando] = useActionState<{ ok?: boolean; erro?: string }, FormData>(
    salvarProduto,
    {},
  )

  return (
    <form action={acao} className="space-y-3 border-t pt-4">
      <input type="hidden" name="id" value={id} />
      <Campo rotulo="Preço (R$)">
        <input
          name="preco"
          defaultValue={(precoCentavos / 100).toFixed(2)}
          className={entrada}
          inputMode="decimal"
        />
      </Campo>
      <Campo rotulo="Preço riscado (R$)" dica="Opcional — mostra o desconto">
        <input
          name="precoRiscado"
          defaultValue={precoRiscadoCentavos === null ? '' : (precoRiscadoCentavos / 100).toFixed(2)}
          className={entrada}
          inputMode="decimal"
        />
      </Campo>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="destaque" defaultChecked={destaque} className="h-4 w-4 accent-azul-500" />
          Destaque
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-4 w-4 accent-azul-500" />
          Ativo
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Botao type="submit" variante="neutro" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar'}
        </Botao>
        {estado.ok && <span className="text-xs text-mata-500">✓ Salvo</span>}
        {estado.erro && <span className="text-xs text-coral-500">{estado.erro}</span>}
      </div>
    </form>
  )
}
