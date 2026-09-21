import type { Dia } from './schema'
import type { Poi } from '@/lib/selecao/tipos'

/**
 * Hidratação — a etapa que torna a alucinação de fato estruturalmente
 * impossível (docs/07-motor-de-ia.md §3).
 *
 * O modelo devolve apenas `poiId` e texto. Endereço, preço, duração e o aviso
 * de verificação são escritos AQUI, a partir do banco. Não é validação: é
 * substituição. O modelo não tem como errar um preço porque nunca escreve um.
 */

export interface BlocoHidratado {
  periodo: string
  hora: string
  titulo: string
  poiId: string
  poiTipo: 'atracao' | 'restaurante'
  nome: string
  descricao: string
  porQueCombina: string
  prioridade: string
  duracaoMin: number
  /** Do banco, nunca do modelo. */
  endereco: string | null
  coordenada: { lat: number; lng: number } | null
  preco: { min: number | null; max: number | null; gratuito: boolean } | null
  /** true quando o dado factual não tem fonte verificada. */
  verificarAntes: boolean
}

export interface DiaHidratado extends Omit<Dia, 'blocos' | 'planoB'> {
  blocos: BlocoHidratado[]
  planoB: {
    chuva: AlternativaHidratada[]
    cansaco: AlternativaHidratada[]
    transito: AlternativaHidratada[]
    lotado: AlternativaHidratada[]
  }
  orcamento: Orcamento
}

export interface AlternativaHidratada {
  poiId: string
  nome: string
  motivo: string
  verificarAntes: boolean
}

export interface Orcamento {
  alimentacao: number
  passeios: number
  transporte: number
  outros: number
  total: number
  observacao: string
  /** Quantos itens do dia não tinham preço no banco. */
  itensSemPreco: number
}

const OBSERVACAO_ORCAMENTO =
  'Valores estimados a partir dos preços cadastrados — podem variar. Confirme no dia.'

/** Custo médio de deslocamento por dia, por modal (R$ por pessoa). */
const TRANSPORTE_POR_DIA: Record<string, number> = {
  a_pe: 0,
  publico: 12,
  carro: 40,
  app: 60,
  transfer: 90,
  carro_publico: 45,
  nao_sei: 40,
}

export function hidratarDia(
  dia: Dia,
  pois: Poi[],
  opcoes: { transportes: string[] },
): DiaHidratado {
  const porId = new Map(pois.map((p) => [p.id, p]))

  const blocos: BlocoHidratado[] = dia.blocos.map((b) => {
    // validarDia já garantiu que o POI existe; isto é rede de segurança.
    const poi = porId.get(b.poiId)
    if (!poi) throw new Error(`hidratarDia: POI "${b.poiId}" não encontrado no conjunto.`)

    return {
      periodo: b.periodo,
      hora: b.hora,
      titulo: b.titulo,
      poiId: b.poiId,
      poiTipo: poi.tipo,
      nome: poi.nome,
      descricao: b.descricao,
      porQueCombina: b.porQueCombina,
      prioridade: b.prioridade,
      // Duração do banco tem precedência sobre a sugerida pelo modelo.
      duracaoMin: poi.duracaoRecomendadaMin ?? b.duracaoMin,
      endereco: null,
      coordenada: poi.lat !== null && poi.lng !== null ? { lat: poi.lat, lng: poi.lng } : null,
      preco:
        poi.gratuito || poi.precoMin !== null
          ? { min: poi.precoMin, max: poi.precoMax, gratuito: poi.gratuito }
          : null,
      verificarAntes: !poi.verificado,
    }
  })

  const hidratarAlternativas = (lista: Dia['planoB']['chuva']): AlternativaHidratada[] =>
    lista.flatMap((a) => {
      const poi = porId.get(a.poiId)
      if (!poi) return []
      return [{ poiId: a.poiId, nome: poi.nome, motivo: a.motivo, verificarAntes: !poi.verificado }]
    })

  return {
    ...dia,
    blocos,
    planoB: {
      chuva: hidratarAlternativas(dia.planoB.chuva),
      cansaco: hidratarAlternativas(dia.planoB.cansaco),
      transito: hidratarAlternativas(dia.planoB.transito),
      lotado: hidratarAlternativas(dia.planoB.lotado),
    },
    orcamento: calcularOrcamento(blocos, opcoes.transportes),
  }
}

/**
 * Orçamento somado a partir do banco. Só entra no total o que tem preço
 * cadastrado; o que falta vira contagem explícita, não um chute silencioso.
 */
export function calcularOrcamento(blocos: BlocoHidratado[], transportes: string[]): Orcamento {
  let alimentacao = 0
  let passeios = 0
  let itensSemPreco = 0

  for (const bloco of blocos) {
    if (bloco.preco === null) {
      itensSemPreco++
      continue
    }
    if (bloco.preco.gratuito) continue

    // Faixa de preço vira o ponto médio — é a leitura honesta de "de X a Y".
    const valor =
      bloco.preco.max !== null && bloco.preco.min !== null
        ? (bloco.preco.min + bloco.preco.max) / 2
        : (bloco.preco.min ?? 0)

    if (bloco.poiTipo === 'restaurante') alimentacao += valor
    else passeios += valor
  }

  const transporte = Math.max(
    ...transportes.map((t) => TRANSPORTE_POR_DIA[t] ?? 0),
    0,
  )

  const arredondar = (n: number) => Math.round(n)
  const totalBruto = alimentacao + passeios + transporte

  return {
    alimentacao: arredondar(alimentacao),
    passeios: arredondar(passeios),
    transporte: arredondar(transporte),
    outros: 0,
    total: arredondar(totalBruto),
    observacao:
      itensSemPreco > 0
        ? `${OBSERVACAO_ORCAMENTO} ${itensSemPreco} item(ns) do dia ainda não têm preço cadastrado e não entraram nesta conta.`
        : OBSERVACAO_ORCAMENTO,
    itensSemPreco,
  }
}
