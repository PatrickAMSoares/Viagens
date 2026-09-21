/**
 * Os três produtos comerciais (docs/06-estrategia-mvp.md §6).
 * Preços são editáveis pelo administrador — estes são apenas os valores iniciais.
 */
export const PRODUTOS = [
  {
    slug: 'essencial',
    nome: 'Roteiro Essencial',
    descricao: 'O caminho pronto, dia a dia, com as principais atrações do destino.',
    beneficios: [
      'Roteiro personalizado para o seu perfil',
      'Organização por dia',
      'Principais atrações',
      'Dicas básicas',
    ],
    precoCentavos: 2900,
    secoesIncluidas: ['roteiro', 'dicas_basicas'],
    destaque: false,
    ordem: 1,
  },
  {
    slug: 'completo',
    nome: 'Roteiro Completo',
    descricao: 'Tudo que você precisa para abrir no celular durante a viagem e não pensar em nada.',
    beneficios: [
      'Tudo do Essencial',
      'Transporte entre cada passeio',
      'Onde comer em cada refeição',
      'Estimativa de gastos por dia',
      'Dicas de segurança',
      'Plano B para chuva, cansaço e lotação',
      'Dicas personalizadas',
    ],
    precoCentavos: 4900,
    precoRiscadoCentavos: 6900,
    secoesIncluidas: [
      'roteiro', 'dicas_basicas', 'transporte', 'gastronomia',
      'orcamento', 'seguranca', 'plano_b',
    ],
    destaque: true,
    ordem: 2,
  },
  {
    slug: 'premium',
    nome: 'Roteiro Premium',
    descricao: 'Para quem quer a viagem desenhada nos detalhes, com experiências fora do óbvio.',
    beneficios: [
      'Tudo do Completo',
      'Maior nível de personalização',
      'Experiências diferenciadas',
      'Alternativas adicionais em cada dia',
      'Sugestões gastronômicas mais específicas',
      'Organização mais detalhada',
    ],
    precoCentavos: 8900,
    secoesIncluidas: [
      'roteiro', 'dicas_basicas', 'transporte', 'gastronomia',
      'orcamento', 'seguranca', 'plano_b',
      'experiencias_diferenciadas', 'gastronomia_detalhada', 'alternativas_extras',
    ],
    destaque: false,
    ordem: 3,
  },
] as const
