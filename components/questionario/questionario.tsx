'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { BarraProgresso } from './barra-progresso'
import { Chip } from './chip'
import {
  OPCOES_COMPANHIA, OPCOES_ESTILO, OPCOES_INTERESSE, OPCOES_PERFIL,
  OPCOES_TRANSPORTE, TITULOS_ETAPA, TOTAL_ETAPAS,
} from '@/lib/questionario/perguntas'
import { RESPOSTAS_INICIAIS, etapaValida, type Respostas } from '@/lib/questionario/schema'
import type { Destino } from '@/lib/catalogo/tipos'
import { cn } from '@/lib/utils'

const CHAVE_RASCUNHO = 'meu-roteiro:rascunho'

/** Alterna um valor dentro de um array de seleção múltipla. */
function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
}

export function Questionario({ destino }: { destino: Destino }) {
  const [etapa, setEtapa] = useState(1)
  const [direcao, setDirecao] = useState(1)
  const [r, setR] = useState<Respostas>({ ...RESPOSTAS_INICIAIS, destino: destino.slug })
  const [hidratado, setHidratado] = useState(false)

  // Retoma o rascunho do mesmo destino, se existir.
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_RASCUNHO)
      if (bruto) {
        const salvo = JSON.parse(bruto) as { respostas: Respostas; etapa: number }
        if (salvo?.respostas?.destino === destino.slug) {
          setR(salvo.respostas)
          setEtapa(Math.min(salvo.etapa ?? 1, TOTAL_ETAPAS))
        }
      }
    } catch {
      // localStorage indisponível (aba anônima, cookies bloqueados) — segue sem rascunho.
    }
    setHidratado(true)
  }, [destino.slug])

  useEffect(() => {
    if (!hidratado) return
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ respostas: r, etapa }))
    } catch {
      // Persistência é conveniência, não requisito.
    }
  }, [r, etapa, hidratado])

  const definir = <K extends keyof Respostas>(campo: K, valor: Respostas[K]) =>
    setR((atual) => ({ ...atual, [campo]: valor }))

  const podeAvancar = etapaValida(etapa, r)

  function avancar() {
    if (!podeAvancar) return
    setDirecao(1)
    if (etapa < TOTAL_ETAPAS) {
      setEtapa(etapa + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // TODO(sprint-3): criar `viagem` e disparar a geração da prévia.
      console.info('Respostas completas', r)
    }
  }

  function voltar() {
    setDirecao(-1)
    if (etapa > 1) setEtapa(etapa - 1)
  }

  const { titulo, subtitulo } = TITULOS_ETAPA[etapa]

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-32 pt-6">
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-600 font-display">
            ✈️ Meu Roteiro
          </Link>
          <span className="rounded-full bg-tinta-100 px-3 py-1 text-xs font-medium text-tinta-600 dark:bg-tinta-800 dark:text-tinta-200">
            📍 {destino.nome}
          </span>
        </div>
        <BarraProgresso etapa={etapa} />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={etapa}
          initial={{ opacity: 0, x: direcao * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direcao * -24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <h1 className="font-display text-2xl font-700 leading-tight sm:text-3xl">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-sm texto-suave">{subtitulo}</p>}

          <div className="mt-7">
            {etapa === 1 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {OPCOES_PERFIL.map((o) => (
                  <Chip
                    key={o.valor}
                    {...o}
                    ativo={r.perfil.includes(o.valor as never)}
                    onClick={() => definir('perfil', alternar(r.perfil, o.valor as never))}
                  />
                ))}
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-6">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {OPCOES_COMPANHIA.map((o) => (
                    <Chip
                      key={o.valor}
                      {...o}
                      ativo={r.companhia === o.valor}
                      onClick={() => definir('companhia', o.valor as never)}
                    />
                  ))}
                </div>

                {(r.companhia === 'familia' || r.companhia === 'criancas' || r.companhia === 'grupo') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="superficie grid grid-cols-2 gap-4 rounded-2xl border p-4"
                  >
                    <Contador rotulo="Adultos" valor={r.adultos} min={1} max={20} aoMudar={(v) => definir('adultos', v)} />
                    <Contador rotulo="Crianças" valor={r.criancas} min={0} max={10} aoMudar={(v) => definir('criancas', v)} />
                  </motion.div>
                )}
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => definir('dias', d)}
                      aria-pressed={r.dias === d}
                      className={cn(
                        'flex min-h-[56px] flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition active:scale-[.98]',
                        r.dias === d
                          ? 'border-azul-500 bg-azul-50 text-azul-600 ring-2 ring-azul-500/25 dark:bg-azul-900/50 dark:text-azul-200'
                          : 'superficie hover:border-azul-300',
                      )}
                    >
                      {d}
                      <span className="text-[11px] font-normal texto-suave">{d === 1 ? 'dia' : 'dias'}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => definir('dias', 8)}
                    aria-pressed={r.dias > 7}
                    className={cn(
                      'flex min-h-[56px] items-center justify-center rounded-2xl border px-2 text-xs font-semibold transition active:scale-[.98]',
                      r.dias > 7
                        ? 'border-azul-500 bg-azul-50 text-azul-600 ring-2 ring-azul-500/25 dark:bg-azul-900/50 dark:text-azul-200'
                        : 'superficie hover:border-azul-300',
                    )}
                  >
                    Mais de 7
                  </button>
                </div>

                {r.dias > 7 && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">Quantos dias exatamente?</span>
                    <input
                      type="number"
                      min={8}
                      max={14}
                      value={r.dias}
                      onChange={(e) => definir('dias', Math.min(14, Math.max(8, Number(e.target.value) || 8)))}
                      className="superficie w-full rounded-2xl border px-4 py-3 text-base"
                    />
                    <span className="mt-1.5 block text-xs texto-suave">No MVP, roteiros de até 14 dias.</span>
                  </label>
                )}
              </div>
            )}

            {etapa === 4 && (
              <div className="space-y-6">
                <div className="grid gap-2.5">
                  {OPCOES_ESTILO.map((o) => (
                    <Chip
                      key={o.valor}
                      {...o}
                      ativo={r.estilo === o.valor}
                      onClick={() => definir('estilo', o.valor as never)}
                    />
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    Quanto pretende gastar por pessoa? <span className="texto-suave">(opcional)</span>
                  </span>
                  <div className="superficie flex items-center gap-2 rounded-2xl border px-4 py-3">
                    <span className="text-sm texto-suave">R$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="1.500"
                      value={r.orcamentoPessoa ?? ''}
                      onChange={(e) =>
                        definir('orcamentoPessoa', e.target.value === '' ? null : Number(e.target.value))
                      }
                      className="w-full bg-transparent text-base outline-none"
                    />
                  </div>
                  <span className="mt-1.5 block text-xs texto-suave">
                    Sem contar passagem e hospedagem — só o que você vai gastar durante os passeios.
                  </span>
                </label>
              </div>
            )}

            {etapa === 5 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {OPCOES_TRANSPORTE.map((o) => (
                  <Chip
                    key={o.valor}
                    {...o}
                    ativo={r.transportes.includes(o.valor as never)}
                    onClick={() => definir('transportes', alternar(r.transportes, o.valor as never))}
                  />
                ))}
              </div>
            )}

            {etapa === 6 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {OPCOES_INTERESSE.map((o) => (
                  <Chip
                    key={o.valor}
                    {...o}
                    ativo={r.interesses.includes(o.valor as never)}
                    onClick={() => definir('interesses', alternar(r.interesses, o.valor as never))}
                  />
                ))}
              </div>
            )}

            {etapa === 7 && (
              <div className="space-y-3">
                <textarea
                  rows={5}
                  maxLength={500}
                  value={r.desejosTexto}
                  onChange={(e) => definir('desejosTexto', e.target.value)}
                  placeholder="Quero conhecer as Cataratas, jantar em algum restaurante bom e fazer um passeio de barco."
                  className="superficie w-full resize-none rounded-2xl border p-4 text-base leading-relaxed outline-none focus:border-azul-400"
                />
                <p className="text-right text-xs texto-suave">{r.desejosTexto.length}/500</p>
                <p className="rounded-2xl bg-azul-50 p-4 text-sm leading-relaxed text-azul-700 dark:bg-azul-900/40 dark:text-azul-100">
                  💡 Escreva do seu jeito. A gente entende o texto e encaixa seus pedidos no roteiro —
                  ou avisa, com sinceridade, quando algo não existe no destino.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Barra de ação fixa — ações primárias ao alcance do polegar. */}
      <div className="fixed inset-x-0 bottom-0 border-t superficie px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {etapa > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="rounded-2xl border px-5 py-3.5 text-sm font-semibold transition hover:bg-tinta-50 dark:hover:bg-tinta-800"
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={avancar}
            disabled={!podeAvancar}
            className="flex-1 rounded-2xl bg-azul-500 px-6 py-3.5 text-base font-semibold text-white transition enabled:hover:bg-azul-600 enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {etapa === TOTAL_ETAPAS ? '✨ Montar meu roteiro' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Contador({
  rotulo, valor, min, max, aoMudar,
}: {
  rotulo: string; valor: number; min: number; max: number; aoMudar: (v: number) => void
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium">{rotulo}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => aoMudar(Math.max(min, valor - 1))}
          aria-label={`Diminuir ${rotulo.toLowerCase()}`}
          className="h-11 w-11 rounded-xl border text-lg font-semibold transition hover:bg-tinta-50 dark:hover:bg-tinta-800"
        >
          −
        </button>
        <span className="min-w-[2ch] text-center text-lg font-600 tabular-nums">{valor}</span>
        <button
          type="button"
          onClick={() => aoMudar(Math.min(max, valor + 1))}
          aria-label={`Aumentar ${rotulo.toLowerCase()}`}
          className="h-11 w-11 rounded-xl border text-lg font-semibold transition hover:bg-tinta-50 dark:hover:bg-tinta-800"
        >
          +
        </button>
      </div>
    </div>
  )
}
