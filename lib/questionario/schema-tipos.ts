import type { COMPANHIAS, ESTILOS, INTERESSES, PERFIS, TRANSPORTES } from './schema'

export type Perfil = (typeof PERFIS)[number]
export type Companhia = (typeof COMPANHIAS)[number]
export type Estilo = (typeof ESTILOS)[number]
export type Transporte = (typeof TRANSPORTES)[number]
export type Interesse = (typeof INTERESSES)[number]
