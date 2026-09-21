import type { Companhia, Estilo } from './schema-tipos'

export interface Opcao<T extends string = string> {
  valor: T
  icone: string
  rotulo: string
  descricao?: string
}

export const TOTAL_ETAPAS = 7

export const OPCOES_PERFIL: Opcao[] = [
  { valor: 'relaxar', icone: '🏖️', rotulo: 'Quero relaxar' },
  { valor: 'explorar', icone: '🗺️', rotulo: 'Quero explorar' },
  { valor: 'fotos', icone: '📸', rotulo: 'Quero tirar fotos' },
  { valor: 'comida', icone: '🍴', rotulo: 'Sou apaixonado por comida' },
  { valor: 'natureza', icone: '🌿', rotulo: 'Amo natureza' },
  { valor: 'noite', icone: '🎉', rotulo: 'Gosto de sair à noite' },
  { valor: 'cultura', icone: '🏛️', rotulo: 'Gosto de cultura' },
  { valor: 'compras', icone: '🛍️', rotulo: 'Gosto de compras' },
  { valor: 'romance', icone: '💑', rotulo: 'Quero uma viagem romântica' },
  { valor: 'familia', icone: '👨‍👩‍👧', rotulo: 'Estou viajando com a família' },
  { valor: 'aventura', icone: '🎒', rotulo: 'Quero aventura' },
  { valor: 'economizar', icone: '💰', rotulo: 'Quero economizar' },
  { valor: 'conforto', icone: '✨', rotulo: 'Quero conforto' },
]

export const OPCOES_COMPANHIA: Opcao[] = [
  { valor: 'sozinho', icone: '🚶', rotulo: 'Sozinho' },
  { valor: 'casal', icone: '💑', rotulo: 'Casal' },
  { valor: 'amigos', icone: '🎉', rotulo: 'Amigos' },
  { valor: 'familia', icone: '👨‍👩‍👧', rotulo: 'Família' },
  { valor: 'criancas', icone: '🧒', rotulo: 'Crianças' },
  { valor: 'grupo', icone: '👥', rotulo: 'Grupo' },
]

export const OPCOES_ESTILO: Opcao[] = [
  { valor: 'economico', icone: '💰', rotulo: 'Econômico', descricao: 'Quero gastar pouco e aproveitar bastante.' },
  { valor: 'equilibrado', icone: '⚖️', rotulo: 'Equilibrado', descricao: 'Quero conforto sem exagerar nos gastos.' },
  { valor: 'confortavel', icone: '✨', rotulo: 'Confortável', descricao: 'Prefiro pagar um pouco mais pela comodidade.' },
  { valor: 'premium', icone: '💎', rotulo: 'Premium', descricao: 'Quero experiências diferenciadas.' },
]

export const OPCOES_TRANSPORTE: Opcao[] = [
  { valor: 'a_pe', icone: '🚶', rotulo: 'A pé' },
  { valor: 'publico', icone: '🚌', rotulo: 'Transporte público' },
  { valor: 'carro', icone: '🚗', rotulo: 'Carro próprio' },
  { valor: 'app', icone: '🚕', rotulo: 'Aplicativos' },
  { valor: 'transfer', icone: '🚐', rotulo: 'Transfer' },
  { valor: 'carro_publico', icone: '🚗', rotulo: 'Carro + transporte público' },
  { valor: 'nao_sei', icone: '🤷', rotulo: 'Ainda não sei' },
]

export const OPCOES_INTERESSE: Opcao[] = [
  { valor: 'praias', icone: '🏖️', rotulo: 'Praias' },
  { valor: 'natureza', icone: '🌿', rotulo: 'Natureza' },
  { valor: 'trilhas', icone: '🏞️', rotulo: 'Trilhas' },
  { valor: 'vinhos', icone: '🍷', rotulo: 'Vinhos' },
  { valor: 'gastronomia', icone: '🍴', rotulo: 'Gastronomia' },
  { valor: 'cafes', icone: '☕', rotulo: 'Cafés' },
  { valor: 'museus', icone: '🏛️', rotulo: 'Museus' },
  { valor: 'historia', icone: '⛪', rotulo: 'História' },
  { valor: 'fotografia', icone: '📸', rotulo: 'Fotografia' },
  { valor: 'por_do_sol', icone: '🌅', rotulo: 'Pôr do sol' },
  { valor: 'vida_noturna', icone: '🎉', rotulo: 'Vida noturna' },
  { valor: 'compras', icone: '🛍️', rotulo: 'Compras' },
  { valor: 'aventura', icone: '🎢', rotulo: 'Aventura' },
  { valor: 'familia', icone: '👨‍👩‍👧', rotulo: 'Família' },
  { valor: 'romance', icone: '💑', rotulo: 'Romance' },
  { valor: 'pontos_famosos', icone: '⭐', rotulo: 'Pontos turísticos famosos' },
  { valor: 'fora_do_obvio', icone: '💎', rotulo: 'Lugares menos conhecidos' },
]

export const TITULOS_ETAPA: Record<number, { titulo: string; subtitulo?: string }> = {
  1: { titulo: 'Qual combina mais com você?', subtitulo: 'Pode escolher quantas quiser.' },
  2: { titulo: 'Com quem você vai viajar?' },
  3: { titulo: 'Quantos dias você terá?' },
  4: { titulo: 'Qual é o seu estilo de viagem?' },
  5: { titulo: 'Como você vai se locomover?', subtitulo: 'Pode escolher mais de uma.' },
  6: { titulo: 'O que você quer conhecer?', subtitulo: 'Escolha tudo que te interessa.' },
  7: { titulo: 'Tem algum lugar que você faz questão de conhecer?', subtitulo: 'Pode pular se não tiver.' },
}

/** Reexport de tipos para manter os componentes desacoplados do Zod. */
export type { Companhia, Estilo }
