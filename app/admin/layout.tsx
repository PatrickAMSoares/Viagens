import Link from 'next/link'

export const metadata = { title: 'Admin' }

const MENU = [
  { href: '/admin', rotulo: '📊 Visão geral' },
  { href: '/admin/destinos', rotulo: '🌎 Destinos' },
  { href: '/admin/produtos', rotulo: '💳 Produtos' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[rgb(var(--fundo-suave))]">
      <header className="sticky top-0 z-10 border-b superficie">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-display text-sm font-600">
            ✈️ Meu Roteiro <span className="texto-suave">· admin</span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 transition hover:bg-tinta-100 dark:hover:bg-tinta-800"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>
          <Link href="/" className="ml-auto text-sm texto-suave hover:underline">
            Ver site ↗
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
