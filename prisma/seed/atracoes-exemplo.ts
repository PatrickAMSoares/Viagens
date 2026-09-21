/**
 * Amostra de estrutura para o piloto de Gramado e Canela.
 *
 * ⚠️ IMPORTANTE — ISTO NÃO É CATÁLOGO CURADO.
 *
 * Aqui entram apenas os campos que não são afirmações factuais verificáveis:
 * nome, categoria, perfis indicados e uma descrição neutra. Preço, horário,
 * endereço, coordenada e duração ficam `null` de propósito, com
 * `confianca: 'baixa'` e `verificadoEm: null`.
 *
 * Por que: a regra do produto (docs/07-motor-de-ia.md) é que nenhum dado
 * factual entra no sistema sem fonte e data de verificação. Preencher esses
 * campos "de cabeça" aqui contaminaria exatamente o que a arquitetura existe
 * para proteger. O admin (Sprint 1) é a ferramenta onde o curador preenche
 * cada um deles com `fonteUrl` e `verificadoEm`.
 *
 * Enquanto estiverem assim, o motor de IA trata estes POIs como incompletos
 * e o roteiro exibe o aviso de verificação.
 */

export interface AtracaoSemente {
  slug: string
  nome: string
  categoria: string
  subcategorias: string[]
  descricao: string
  perfisIndicados: string[]
  melhorHorario: Array<'manha' | 'almoco' | 'tarde' | 'fim_tarde' | 'noite'>
  adequadoCriancas: boolean
  indoor: boolean
  prioridadeBase: number
}

export const ATRACOES_EXEMPLO: Record<string, AtracaoSemente[]> = {
  gramado: [
    {
      slug: 'lago-negro',
      nome: 'Lago Negro',
      categoria: 'parque',
      subcategorias: ['lago', 'caminhada', 'pedalinho'],
      descricao: 'Lago cercado por mata e trilha no entorno, no centro de Gramado.',
      perfisIndicados: ['casal', 'familia', 'relaxar', 'fotos'],
      melhorHorario: ['manha', 'fim_tarde'],
      adequadoCriancas: true,
      indoor: false,
      prioridadeBase: 4,
    },
    {
      slug: 'rua-coberta',
      nome: 'Rua Coberta',
      categoria: 'centro_urbano',
      subcategorias: ['gastronomia', 'compras', 'eventos'],
      descricao: 'Trecho coberto no centro, concentrando restaurantes, cafés e eventos.',
      perfisIndicados: ['casal', 'familia', 'comida', 'noite'],
      melhorHorario: ['tarde', 'noite'],
      adequadoCriancas: true,
      indoor: true,
      prioridadeBase: 4,
    },
    {
      slug: 'mini-mundo',
      nome: 'Mini Mundo',
      categoria: 'atracao_tematica',
      subcategorias: ['miniaturas', 'familia'],
      descricao: 'Parque de miniaturas com reproduções em escala reduzida.',
      perfisIndicados: ['familia', 'criancas', 'fotos'],
      melhorHorario: ['manha', 'tarde'],
      adequadoCriancas: true,
      indoor: false,
      prioridadeBase: 3,
    },
    {
      slug: 'avenida-borges-de-medeiros',
      nome: 'Avenida Borges de Medeiros',
      categoria: 'centro_urbano',
      subcategorias: ['compras', 'arquitetura', 'chocolate'],
      descricao: 'Principal avenida do centro, com lojas de chocolate, malharias e cafés.',
      perfisIndicados: ['compras', 'casal', 'comida'],
      melhorHorario: ['tarde'],
      adequadoCriancas: true,
      indoor: false,
      prioridadeBase: 3,
    },
  ],
  canela: [
    {
      slug: 'parque-do-caracol',
      nome: 'Parque do Caracol',
      categoria: 'parque',
      subcategorias: ['cachoeira', 'mirante', 'trilha'],
      descricao: 'Parque com mirante para a cascata do Caracol e trilhas no entorno.',
      perfisIndicados: ['natureza', 'familia', 'fotos', 'casal'],
      melhorHorario: ['manha', 'tarde'],
      adequadoCriancas: true,
      indoor: false,
      prioridadeBase: 5,
    },
    {
      slug: 'catedral-de-pedra',
      nome: 'Catedral de Pedra',
      categoria: 'historia',
      subcategorias: ['arquitetura', 'igreja'],
      descricao: 'Igreja em estilo gótico no centro de Canela, cartão-postal da cidade.',
      perfisIndicados: ['cultura', 'fotos', 'casal'],
      melhorHorario: ['manha', 'fim_tarde'],
      adequadoCriancas: true,
      indoor: true,
      prioridadeBase: 4,
    },
  ],
}
