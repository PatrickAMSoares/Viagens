import { agruparPorRegiao } from '@/lib/selecao/agrupar'
import { selecionarCandidatos } from '@/lib/selecao/pontuar'
import type { PerfilViagem, Poi } from '@/lib/selecao/tipos'
import { gerarDia, type ChamarModelo, type Uso } from './gerar-dia'
import { hidratarDia, type DiaHidratado } from './hidratar'

export interface RoteiroGerado {
  dias: DiaHidratado[]
  uso: Uso
  /** POIs que o viajante pediu e não estão no catálogo do destino. */
  desejosNaoAtendidos: string[]
}

export interface ProgressoDia {
  dia: number
  total: number
  tentativas: number
}

/**
 * Orquestra o roteiro completo (docs/07-motor-de-ia.md §2).
 *
 * Seleção e agrupamento rodam UMA vez para a viagem inteira; a IA é chamada
 * uma vez por dia, recebendo o mesmo catálogo (bom para o prompt caching) e o
 * histórico do que já foi usado.
 */
export async function gerarRoteiro(
  opcoes: {
    destino: string
    pois: Poi[]
    viagem: PerfilViagem
    desejosTexto: string
    aoConcluirDia?: (p: ProgressoDia) => void
  },
  chamar?: ChamarModelo,
): Promise<RoteiroGerado> {
  const { destino, pois, viagem, desejosTexto } = opcoes

  const idsExistentes = new Set(pois.map((p) => p.id))
  const desejosNaoAtendidos = viagem.poiIdsDesejados.filter((id) => !idsExistentes.has(id))

  const candidatos = selecionarCandidatos(pois, viagem)
  // Uma região por dia, no máximo — com muitos dias, regiões se repetem.
  const regioes = agruparPorRegiao(candidatos, Math.min(viagem.dias, 4))

  const dias: DiaHidratado[] = []
  const uso: Uso = { tokensEntrada: 0, tokensSaida: 0, custoUsd: 0 }
  const jaUsados: string[] = []

  for (let numero = 1; numero <= viagem.dias; numero++) {
    const resultado = await gerarDia(
      {
        destino,
        numeroDoDia: numero,
        candidatos,
        regioes,
        regiaoDoDia: (numero - 1) % regioes.length,
        viagem,
        desejosTexto,
        jaUsados: [...jaUsados],
      },
      chamar,
    )

    uso.tokensEntrada += resultado.uso.tokensEntrada
    uso.tokensSaida += resultado.uso.tokensSaida
    uso.custoUsd = Number((uso.custoUsd + resultado.uso.custoUsd).toFixed(6))

    jaUsados.push(...resultado.dia.blocos.map((b) => b.poiId))

    dias.push(hidratarDia(resultado.dia, pois, { transportes: viagem.transportes }))
    opcoes.aoConcluirDia?.({ dia: numero, total: viagem.dias, tentativas: resultado.tentativas })
  }

  return { dias, uso, desejosNaoAtendidos }
}
