/** POI normalizado que entra no motor de seleção e no prompt. */
export interface Poi {
  id: string
  tipo: 'atracao' | 'restaurante'
  nome: string
  categoria: string
  subcategorias: string[]
  descricao: string
  perfisIndicados: string[]
  lat: number | null
  lng: number | null
  precoMin: number | null
  precoMax: number | null
  gratuito: boolean
  faixaPreco: number | null
  duracaoRecomendadaMin: number | null
  adequadoCriancas: boolean
  requerReserva: boolean
  indoor: boolean
  melhorHorario: string[]
  prioridadeBase: number
  verificado: boolean
}

export interface PerfilViagem {
  dias: number
  perfil: string[]
  interesses: string[]
  companhia: string
  criancas: number
  estilo: 'economico' | 'equilibrado' | 'confortavel' | 'premium'
  orcamentoPessoa: number | null
  transportes: string[]
  /** IDs que o viajante pediu explicitamente — entram sempre. */
  poiIdsDesejados: string[]
}

export interface PoiPontuado {
  poi: Poi
  pontos: number
  forcado: boolean
  motivos: string[]
}
