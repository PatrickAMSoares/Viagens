import Link from 'next/link'
import { DestinoCard } from '@/components/ui/destino-card'
import { listarDestinos } from '@/lib/db/destinos'

const COMO_FUNCIONA = [
  {
    icone: '🧭',
    titulo: 'Conte como você viaja',
    texto: 'Sete perguntas rápidas sobre seu estilo, companhia, orçamento e o que te interessa.',
  },
  {
    icone: '✨',
    titulo: 'A IA monta seu roteiro',
    texto: 'Ela organiza dia a dia considerando distância, horário, ritmo e o que combina com você.',
  },
  {
    icone: '📍',
    titulo: 'Use durante a viagem',
    texto: 'No celular ou em PDF: onde ir, como chegar, onde comer, quanto gastar e o plano B.',
  },
]

const INCLUSOS = [
  { icone: '🕐', titulo: 'Organizado por horário', texto: 'Manhã, almoço, tarde, fim de tarde e noite — com tempo recomendado em cada lugar.' },
  { icone: '🚗', titulo: 'Como chegar de verdade', texto: 'Tempo de carro, de ônibus, de app e a pé. Com aviso de estacionamento e trânsito.' },
  { icone: '💰', titulo: 'Estimativa de gastos', texto: 'Alimentação, passeios e transporte somados por dia, para você não se perder no orçamento.' },
  { icone: '🌧️', titulo: 'Plano B para tudo', texto: 'Choveu, cansou, lotou ou o trânsito travou? Cada dia tem uma alternativa pronta.' },
  { icone: '⚠️', titulo: 'Cuidados práticos', texto: 'Informação objetiva sobre pertences, trilhas, praia e período noturno. Sem alarmismo.' },
  { icone: '📄', titulo: 'PDF para levar', texto: 'Roteiro completo em PDF, com capa, resumo financeiro e dicas finais.' },
]

export default async function HomePage() {
  const destinos = await listarDestinos()

  return (
    <main>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-azul-500 via-azul-600 to-[#6E56CF]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(60%_60%_at_80%_10%,rgba(255,107,74,.55),transparent_60%)]"
        />

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
            ✈️ Roteiros personalizados no Sul do Brasil
          </p>

          <h1 className="titulo-fluido max-w-3xl font-display font-700 text-white animate-fade-up">
            Sua viagem.
            <br />
            Seu estilo.
            <br />
            <span className="text-coral-300">Seu roteiro.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Conte como você gosta de viajar e deixe nossa IA montar um roteiro personalizado para você.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#destinos"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-coral-400 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-coral-600/25 transition hover:bg-coral-500 active:scale-[.98]"
            >
              ✈️ Criar meu roteiro
            </Link>
            <span className="text-sm text-white/70">Leva 3 minutos · Prévia gratuita</span>
          </div>
        </div>
      </section>

      {/* ---------- DESTINOS ---------- */}
      <section id="destinos" className="scroll-mt-8 bg-[rgb(var(--fundo-suave))] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-700 tracking-tight sm:text-4xl">Escolha seu destino</h2>
            <p className="mt-3 text-base leading-relaxed texto-suave">
              Começamos pela Região Sul, com destinos que conhecemos a fundo. Cada roteiro é montado a
              partir de um catálogo verificado de atrações, restaurantes e transporte.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinos.map((destino, i) => (
              <DestinoCard key={destino.slug} destino={destino} prioridade={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COMO FUNCIONA ---------- */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 font-display text-3xl font-700 tracking-tight sm:text-4xl">Como funciona</h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            {COMO_FUNCIONA.map((passo, i) => (
              <li key={passo.titulo} className="superficie rounded-2xl border p-6 shadow-card">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-azul-50 text-xl dark:bg-azul-900">
                  <span aria-hidden="true">{passo.icone}</span>
                </span>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-azul-500">
                  Passo {i + 1}
                </p>
                <h3 className="font-display text-lg font-600">{passo.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed texto-suave">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- O QUE VEM NO ROTEIRO ---------- */}
      <section className="bg-[rgb(var(--fundo-suave))] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 max-w-2xl font-display text-3xl font-700 tracking-tight sm:text-4xl">
            O que vem no seu roteiro
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUSOS.map((item) => (
              <li key={item.titulo} className="superficie rounded-2xl border p-6 shadow-card">
                <span aria-hidden="true" className="text-2xl">
                  {item.icone}
                </span>
                <h3 className="mt-3 font-display text-lg font-600">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed texto-suave">{item.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-700 tracking-tight sm:text-4xl">
            Não sabe o que fazer na viagem?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed texto-suave">
            Responda algumas perguntas e a gente monta tudo — do café da manhã ao pôr do sol.
          </p>
          <Link
            href="#destinos"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-azul-500 px-7 py-4 text-base font-semibold text-white transition hover:bg-azul-600 active:scale-[.98]"
          >
            ✈️ Criar meu roteiro
          </Link>
        </div>
      </section>

      {/* ---------- RODAPÉ ---------- */}
      <footer className="border-t superficie py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display font-600 text-[rgb(var(--texto))]">✈️ Meu Roteiro</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/termos" className="hover:underline">Termos de uso</Link>
            <Link href="/privacidade" className="hover:underline">Privacidade</Link>
            <Link href="/suporte" className="hover:underline">Suporte</Link>
          </nav>
          <p className="text-xs">
            Roteiros gerados com apoio de IA a partir de catálogo verificado. Valores são estimativas.
          </p>
        </div>
      </footer>
    </main>
  )
}
