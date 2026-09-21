import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proteção do /admin por HTTP Basic.
 *
 * Solução temporária e deliberada: o Sprint 4 traz o Supabase Auth com magic
 * link e RBAC por `usuarios.role`. Até lá, Basic evita expor o painel de
 * curadoria sem adicionar dependência que vai ser jogada fora.
 */
export function middleware(req: NextRequest) {
  const usuario = process.env.ADMIN_USER
  const senha = process.env.ADMIN_PASSWORD

  if (!usuario || !senha) {
    return new NextResponse(
      'Painel desabilitado: defina ADMIN_USER e ADMIN_PASSWORD no ambiente.',
      { status: 503 },
    )
  }

  const header = req.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    const [recebidoUsuario, recebidaSenha] = atob(header.slice(6)).split(':')
    if (seguroIgual(recebidoUsuario, usuario) && seguroIgual(recebidaSenha, senha)) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Autenticacao necessaria.', {
    status: 401,
    // Cabeçalho HTTP é ByteString: só ASCII. Um travessão aqui derruba a resposta.
    headers: { 'WWW-Authenticate': 'Basic realm="Meu Roteiro Admin", charset="UTF-8"' },
  })
}

/** Comparação em tempo constante — evita distinguir senhas pelo tempo de resposta. */
function seguroIgual(a = '', b = '') {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diferenca === 0
}

export const config = { matcher: '/admin/:path*' }
