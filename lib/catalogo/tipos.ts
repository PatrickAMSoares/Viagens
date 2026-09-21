/** Tipos compartilhados do catálogo. Espelham prisma/schema.prisma. */

export type Confianca = 'alta' | 'media' | 'baixa'

export type Estilo = 'economico' | 'equilibrado' | 'confortavel' | 'premium'

export type Companhia = 'sozinho' | 'casal' | 'amigos' | 'familia' | 'criancas' | 'grupo'

export type PeriodoDia = 'manha' | 'almoco' | 'tarde' | 'fim_tarde' | 'noite'

export type Prioridade = 'imperdivel' | 'recomendado' | 'se_der_tempo'

/** Tags de experiência exibidas nos cards da home. */
export interface Tag {
  icone: string
  rotulo: string
}

export interface Destino {
  slug: string
  nome: string
  estado: string
  uf: string
  pais: string
  descricaoCurta: string
  descricaoLonga: string
  tags: Tag[]
  /**
   * Foto licenciada do destino. Fica nula até a curadoria subir a imagem
   * para o R2 com a licença comprovada (ver docs/10-juridico-compliance.md).
   * Sem foto, o card usa o gradiente de marca — nunca um link externo não verificado.
   */
  imagem: { url: string; alt: string; credito: string } | null
  centro: { lat: number; lng: number }
  /** Insumo da seção "🚦 Antes de sair" do roteiro. */
  notasTransito: string
  climaNotas: string
  melhorEpoca: string
  /** Desafio logístico do destino — orienta a curadoria e o motor de IA. */
  desafioRoteiro: string
  ativo: boolean
}
