/**
 * Mapeamentos entre o vocabulário do questionário e o do catálogo.
 * Ficam isolados aqui porque são a regra de negócio que mais muda quando
 * entra destino novo — e a que mais merece teste.
 */

/** Interesse declarado → categorias e subcategorias do catálogo. */
export const INTERESSE_PARA_CATEGORIA: Record<string, string[]> = {
  praias: ['praia', 'praias', 'balneario'],
  natureza: ['parque', 'natureza', 'reserva', 'jardim', 'cachoeira'],
  trilhas: ['trilha', 'trilhas', 'caminhada', 'mirante'],
  vinhos: ['vinicola', 'vinho', 'vinhos', 'enoturismo'],
  gastronomia: ['restaurante', 'gastronomia', 'mercado'],
  cafes: ['cafe', 'cafeteria', 'confeitaria'],
  museus: ['museu', 'galeria', 'centro_cultural'],
  historia: ['historia', 'igreja', 'patrimonio', 'centro_historico'],
  fotografia: ['mirante', 'paisagem', 'arquitetura'],
  por_do_sol: ['mirante', 'praia', 'paisagem'],
  vida_noturna: ['bar', 'balada', 'noite', 'centro_urbano'],
  compras: ['compras', 'shopping', 'feira', 'centro_urbano'],
  aventura: ['aventura', 'esporte', 'mergulho', 'rapel', 'parque_tematico'],
  familia: ['atracao_tematica', 'parque', 'zoologico'],
  romance: ['mirante', 'vinicola', 'restaurante', 'paisagem'],
  pontos_famosos: [],
  fora_do_obvio: [],
}

/** Perfil declarado → perfis indicados no catálogo. */
export const PERFIL_PARA_INDICADO: Record<string, string[]> = {
  relaxar: ['relaxar', 'tranquilo', 'casal'],
  explorar: ['explorar', 'aventura', 'cultura'],
  fotos: ['fotos', 'paisagem'],
  comida: ['comida', 'gastronomia'],
  natureza: ['natureza', 'ecoturismo'],
  noite: ['noite', 'jovens'],
  cultura: ['cultura', 'historia'],
  compras: ['compras'],
  romance: ['casal', 'romance'],
  familia: ['familia', 'criancas'],
  aventura: ['aventura'],
  economizar: ['economico'],
  conforto: ['conforto', 'sofisticado'],
}

/** Teto de gasto por atração, por estilo de viagem (R$). */
export const TETO_POR_ESTILO: Record<string, number> = {
  economico: 60,
  equilibrado: 150,
  confortavel: 300,
  premium: Number.POSITIVE_INFINITY,
}

/** Quantas atividades principais cabem num dia, por perfil. */
export function atividadesPorDia(perfil: string[], criancas: number): number {
  if (criancas > 0) return 3
  if (perfil.includes('relaxar')) return 3
  if (perfil.includes('explorar') || perfil.includes('aventura')) return 5
  return 4
}
