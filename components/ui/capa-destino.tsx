import Image from 'next/image'
import type { Destino } from '@/lib/catalogo/tipos'

/** Gradientes de marca usados enquanto o destino não tem foto licenciada. */
const GRADIENTES = [
  'from-azul-500 via-azul-600 to-[#6E56CF]',
  'from-[#0E9F6E] via-[#128E8A] to-azul-600',
  'from-coral-400 via-coral-500 to-[#B0327A]',
  'from-[#6E56CF] via-azul-600 to-tinta-900',
] as const

/** Escolhe um gradiente estável por slug — o mesmo destino tem sempre a mesma capa. */
function gradienteDe(slug: string) {
  const soma = [...slug].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTES[soma % GRADIENTES.length]
}

export function CapaDestino({ destino, prioridade }: { destino: Destino; prioridade?: boolean }) {
  if (destino.imagem) {
    return (
      <Image
        src={destino.imagem.url}
        alt={destino.imagem.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={prioridade}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 bg-gradient-to-br ${gradienteDe(destino.slug)} transition-transform duration-500 group-hover:scale-105`}
    >
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(70%_60%_at_75%_15%,rgba(255,255,255,.4),transparent_65%)]" />
      <span className="absolute left-4 top-4 flex flex-wrap gap-1.5 text-2xl">
        {destino.tags.slice(0, 3).map((t) => (
          <span key={t.rotulo} className="drop-shadow">{t.icone}</span>
        ))}
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
        {destino.uf}
      </span>
    </div>
  )
}
