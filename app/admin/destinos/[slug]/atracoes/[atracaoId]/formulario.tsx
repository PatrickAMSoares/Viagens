'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Botao, Campo, Cartao, entrada } from '@/components/admin/ui'
import { salvarAtracao, type EstadoForm } from './acoes'

interface Valores {
  id: string | null
  nome: string
  slug: string
  categoria: string
  subcategorias: string
  descricao: string
  perfisIndicados: string
  endereco: string
  bairro: string
  lat: string
  lng: string
  precoMin: string
  precoMax: string
  precoObs: string
  gratuito: boolean
  duracaoRecomendadaMin: string
  prioridadeBase: number
  adequadoCriancas: boolean
  requerReserva: boolean
  indoor: boolean
  infoSeguranca: string
  dicas: string
  fonteUrl: string
  confianca: 'alta' | 'media' | 'baixa'
  verificadoEm: string | null
  ativo: boolean
}

export function FormularioAtracao({
  slugDestino, valores,
}: {
  slugDestino: string; valores: Valores
}) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(
    salvarAtracao.bind(null, slugDestino, valores.id),
    {},
  )
  const erro = (campo: string) => estado.campos?.[campo]

  return (
    <form action={acao} className="space-y-6">
      {estado.erro && (
        <p className="rounded-xl bg-coral-100 px-4 py-3 text-sm text-coral-700 dark:bg-coral-700/25 dark:text-coral-100">
          {estado.erro}
        </p>
      )}

      {/* ---------- Identificação ---------- */}
      <Cartao className="space-y-4">
        <h2 className="font-display text-sm font-600 uppercase tracking-wider texto-suave">
          Identificação
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome" dica={erro('nome')}>
            <input name="nome" defaultValue={valores.nome} className={entrada} required />
          </Campo>
          <Campo rotulo="Slug" dica={erro('slug') ?? 'Identificador na URL, sem acento'}>
            <input name="slug" defaultValue={valores.slug} className={entrada} required />
          </Campo>
          <Campo rotulo="Categoria" dica={erro('categoria') ?? 'praia, parque, museu, mirante...'}>
            <input name="categoria" defaultValue={valores.categoria} className={entrada} required />
          </Campo>
          <Campo rotulo="Subcategorias" dica="Separadas por vírgula">
            <input name="subcategorias" defaultValue={valores.subcategorias} className={entrada} />
          </Campo>
        </div>
        <Campo rotulo="Descrição" dica={erro('descricao') ?? 'Texto original — não copie de outro site'}>
          <textarea name="descricao" defaultValue={valores.descricao} rows={3} className={entrada} required />
        </Campo>
        <Campo rotulo="Perfis indicados" dica="casal, familia, aventura, relaxar... separados por vírgula">
          <input name="perfisIndicados" defaultValue={valores.perfisIndicados} className={entrada} />
        </Campo>
      </Cartao>

      {/* ---------- Dados factuais ---------- */}
      <Cartao className="space-y-4 border-azul-200 dark:border-azul-800">
        <div>
          <h2 className="font-display text-sm font-600 uppercase tracking-wider texto-suave">
            Dados factuais
          </h2>
          <p className="mt-1 text-xs texto-suave">
            A IA nunca inventa estes campos — ela só repete o que está aqui. Em branco é melhor
            que errado: campo vazio vira &ldquo;confirme antes de sair&rdquo; no roteiro.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Endereço">
            <input name="endereco" defaultValue={valores.endereco} className={entrada} />
          </Campo>
          <Campo rotulo="Bairro / região">
            <input name="bairro" defaultValue={valores.bairro} className={entrada} />
          </Campo>
          <Campo rotulo="Latitude" dica="Ex.: -29.3788">
            <input name="lat" defaultValue={valores.lat} className={entrada} inputMode="decimal" />
          </Campo>
          <Campo rotulo="Longitude" dica="Ex.: -50.8739">
            <input name="lng" defaultValue={valores.lng} className={entrada} inputMode="decimal" />
          </Campo>
          <Campo rotulo="Preço mínimo (R$)">
            <input name="precoMin" defaultValue={valores.precoMin} className={entrada} inputMode="decimal" />
          </Campo>
          <Campo rotulo="Preço máximo (R$)">
            <input name="precoMax" defaultValue={valores.precoMax} className={entrada} inputMode="decimal" />
          </Campo>
          <Campo rotulo="Observação de preço" dica="Ex.: meia-entrada para estudantes">
            <input name="precoObs" defaultValue={valores.precoObs} className={entrada} />
          </Campo>
          <Campo rotulo="Duração recomendada (min)">
            <input
              name="duracaoRecomendadaMin"
              defaultValue={valores.duracaoRecomendadaMin}
              className={entrada}
              inputMode="numeric"
            />
          </Campo>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
          <Caixa nome="gratuito" rotulo="Gratuito" padrao={valores.gratuito} />
          <Caixa nome="adequadoCriancas" rotulo="Adequado para crianças" padrao={valores.adequadoCriancas} />
          <Caixa nome="requerReserva" rotulo="Requer reserva" padrao={valores.requerReserva} />
          <Caixa nome="indoor" rotulo="Coberto (serve de plano B de chuva)" padrao={valores.indoor} />
        </div>
      </Cartao>

      {/* ---------- Roteirização ---------- */}
      <Cartao className="space-y-4">
        <h2 className="font-display text-sm font-600 uppercase tracking-wider texto-suave">
          Roteirização
        </h2>
        <Campo rotulo={`Prioridade base: ${valores.prioridadeBase}`} dica="1 = complementar · 5 = imperdível no destino">
          <input
            type="range"
            name="prioridadeBase"
            min={1}
            max={5}
            defaultValue={valores.prioridadeBase}
            className="w-full accent-azul-500"
          />
        </Campo>
        <Campo rotulo="Informação de segurança" dica="Objetiva e não alarmista. Contexto + recomendação prática.">
          <textarea name="infoSeguranca" defaultValue={valores.infoSeguranca} rows={2} className={entrada} />
        </Campo>
        <Campo rotulo="Dicas" dica="O que alguém que conhece o lugar diria — melhor horário, o que evitar.">
          <textarea name="dicas" defaultValue={valores.dicas} rows={2} className={entrada} />
        </Campo>
      </Cartao>

      {/* ---------- Verificação ---------- */}
      <Cartao className="space-y-4">
        <div>
          <h2 className="font-display text-sm font-600 uppercase tracking-wider texto-suave">
            Verificação
          </h2>
          <p className="mt-1 text-xs texto-suave">
            {valores.verificadoEm
              ? `Última verificação: ${valores.verificadoEm}`
              : 'Nunca verificada — os dados acima aparecem com aviso no roteiro.'}
          </p>
        </div>
        <Campo rotulo="URL da fonte" dica={erro('fonteUrl') ?? 'Site oficial da atração, prefeitura ou secretaria de turismo'}>
          <input
            name="fonteUrl"
            type="url"
            defaultValue={valores.fonteUrl}
            placeholder="https://"
            className={entrada}
          />
        </Campo>
        <Campo rotulo="Confiança">
          <select name="confianca" defaultValue={valores.confianca} className={entrada}>
            <option value="alta">Alta — conferido na fonte oficial</option>
            <option value="media">Média — fonte secundária confiável</option>
            <option value="baixa">Baixa — precisa conferir</option>
          </select>
        </Campo>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Caixa
            nome="marcarVerificado"
            rotulo="Marcar como verificada hoje"
            padrao={false}
            dica="Exige URL da fonte"
          />
          <Caixa nome="ativo" rotulo="Ativa (pode entrar em roteiros)" padrao={valores.ativo} />
        </div>
      </Cartao>

      <div className="flex items-center gap-3">
        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar atração'}
        </Botao>
        <Link
          href={`/admin/destinos/${slugDestino}/atracoes`}
          className="text-sm texto-suave hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

function Caixa({
  nome, rotulo, padrao, dica,
}: {
  nome: string; rotulo: string; padrao: boolean; dica?: string
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={nome} defaultChecked={padrao} className="h-4 w-4 accent-azul-500" />
      <span>
        {rotulo}
        {dica && <span className="ml-1 text-xs texto-suave">({dica})</span>}
      </span>
    </label>
  )
}
