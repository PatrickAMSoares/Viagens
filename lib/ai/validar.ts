import type { Dia } from './schema'
import type { Poi } from '@/lib/selecao/tipos'

/**
 * Validação pós-geração (docs/07-motor-de-ia.md §2, etapa 5).
 *
 * Nada chega ao cliente sem passar por aqui. Cada problema vira uma mensagem
 * que volta ao modelo no retry — dizer o que está errado funciona melhor que
 * só pedir "tente de novo".
 */

export interface Problema {
  codigo:
    | 'poi_inexistente'
    | 'poi_repetido'
    | 'horario_fora_de_ordem'
    | 'dia_sobrecarregado'
    | 'plano_b_invalido'
    | 'sem_refeicao'
    | 'categoria_repetida'
  mensagem: string
}

const LIMITE_HORAS_DIA = 14

function paraMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function validarDia(
  dia: Dia,
  disponiveis: Poi[],
  opcoes: { restaurantesNoDia?: number } = {},
): Problema[] {
  const problemas: Problema[] = []
  const porId = new Map(disponiveis.map((p) => [p.id, p]))

  // 1. Referencial: todo POI citado precisa existir no conjunto enviado.
  //    Esta é a checagem que torna alucinação de lugar impossível.
  for (const bloco of dia.blocos) {
    const poi = porId.get(bloco.poiId)
    if (!poi) {
      problemas.push({
        codigo: 'poi_inexistente',
        mensagem: `Dia ${dia.numero}, ${bloco.hora}: "${bloco.poiId}" não está na lista fornecida. Use apenas os IDs enviados.`,
      })
      continue
    }
    if (poi.tipo !== bloco.poiTipo) {
      problemas.push({
        codigo: 'poi_inexistente',
        mensagem: `Dia ${dia.numero}: "${poi.nome}" é ${poi.tipo}, mas foi usado como ${bloco.poiTipo}.`,
      })
    }
  }

  // 2. Nenhum POI repetido no mesmo dia.
  const vistos = new Set<string>()
  for (const bloco of dia.blocos) {
    if (vistos.has(bloco.poiId)) {
      problemas.push({
        codigo: 'poi_repetido',
        mensagem: `Dia ${dia.numero}: ${porId.get(bloco.poiId)?.nome ?? bloco.poiId} aparece duas vezes.`,
      })
    }
    vistos.add(bloco.poiId)
  }

  // 3. Horários em ordem crescente.
  for (let i = 1; i < dia.blocos.length; i++) {
    if (paraMinutos(dia.blocos[i].hora) <= paraMinutos(dia.blocos[i - 1].hora)) {
      problemas.push({
        codigo: 'horario_fora_de_ordem',
        mensagem: `Dia ${dia.numero}: ${dia.blocos[i].hora} vem depois de ${dia.blocos[i - 1].hora} na lista, mas não no relógio.`,
      })
    }
  }

  // 4. O dia precisa caber num dia.
  const primeiro = paraMinutos(dia.blocos[0]?.hora ?? '09:00')
  const ultimo = dia.blocos.at(-1)
  const fim = ultimo ? paraMinutos(ultimo.hora) + ultimo.duracaoMin : primeiro
  const horas = (fim - primeiro) / 60
  if (horas > LIMITE_HORAS_DIA) {
    problemas.push({
      codigo: 'dia_sobrecarregado',
      mensagem: `Dia ${dia.numero} ocupa ${horas.toFixed(1)}h. Reduza para no máximo ${LIMITE_HORAS_DIA}h — o viajante precisa descansar.`,
    })
  }

  // 5. Plano B também só pode citar POIs reais, e não pode repetir o que já
  //    está no dia (não é alternativa se já estava no roteiro).
  const alternativas = [
    ...dia.planoB.chuva, ...dia.planoB.cansaco,
    ...dia.planoB.transito, ...dia.planoB.lotado,
  ]
  for (const alt of alternativas) {
    if (!porId.has(alt.poiId)) {
      problemas.push({
        codigo: 'plano_b_invalido',
        mensagem: `Dia ${dia.numero}, plano B: "${alt.poiId}" não está na lista fornecida.`,
      })
    } else if (vistos.has(alt.poiId)) {
      problemas.push({
        codigo: 'plano_b_invalido',
        mensagem: `Dia ${dia.numero}: ${porId.get(alt.poiId)?.nome} já está no roteiro do dia — não serve de alternativa.`,
      })
    }
  }

  // 6. Um dia sem refeição é um dia que ninguém consegue seguir.
  const esperadas = opcoes.restaurantesNoDia ?? 1
  const refeicoes = dia.blocos.filter((b) => b.poiTipo === 'restaurante').length
  if (refeicoes < esperadas) {
    problemas.push({
      codigo: 'sem_refeicao',
      mensagem: `Dia ${dia.numero} tem ${refeicoes} refeição(ões); inclua pelo menos ${esperadas}.`,
    })
  }

  // 7. Variedade: nada de duas trilhas seguidas ou três museus no mesmo dia.
  const contagem = new Map<string, number>()
  for (const bloco of dia.blocos) {
    const poi = porId.get(bloco.poiId)
    if (!poi || poi.tipo === 'restaurante') continue
    const n = (contagem.get(poi.categoria) ?? 0) + 1
    contagem.set(poi.categoria, n)
    if (n === 3) {
      problemas.push({
        codigo: 'categoria_repetida',
        mensagem: `Dia ${dia.numero}: três atividades de "${poi.categoria}". Varie o tipo de experiência.`,
      })
    }
  }

  return problemas
}

/** Monta a instrução de correção que volta ao modelo no retry. */
export function instrucaoDeCorrecao(problemas: Problema[]): string {
  return [
    'A versão anterior do roteiro tem os problemas abaixo. Corrija TODOS mantendo o que já estava bom:',
    ...problemas.map((p) => `- ${p.mensagem}`),
  ].join('\n')
}
