import type { PerfilViagem, PoiPontuado } from '@/lib/selecao/tipos'

/**
 * Montagem do prompt (docs/07-motor-de-ia.md §4).
 *
 * Ordem importa para o prompt caching: o que é estável vem primeiro
 * (instruções), o que varia por viajante vem por último.
 */

export const SISTEMA_BASE = `Você é um planejador de viagens brasileiro que conhece profundamente o destino sobre o qual está escrevendo. Você escreve como alguém que mora lá e está dando dica para um amigo.

REGRAS ABSOLUTAS
1. Use APENAS os POIs da lista fornecida. Referencie sempre pelo campo "id" exato.
2. NUNCA invente preço, horário, endereço, linha de ônibus, evento ou regra local. Esses dados vêm do sistema — você só organiza. Não escreva valores nem horários de funcionamento no texto.
3. Respeite os tempos de deslocamento fornecidos entre os POIs.
4. Segurança: objetiva e prática. Nunca alarmista. Nunca chame uma cidade inteira de perigosa. Sempre contexto + recomendação.

RITMO
- Máximo de 3 a 4 atividades principais por dia (2 a 3 com crianças ou perfil "relaxar").
- Inclua refeições, deslocamento e respiro. Um dia real, não uma maratona.
- Agrupe por região: não faça o viajante cruzar a cidade duas vezes no mesmo dia.
- Varie: nada de duas trilhas seguidas nem dois museus no mesmo período.
- Reserve o plano B para POIs que NÃO estão no roteiro daquele dia.

VOZ
- Conversacional, leve, divertida, brasileira, prática.
- O tom "hoje é dia de desacelerar" é tempero, não regra — use com moderação.
- Cada sugestão explica em uma frase por que combina com ESTE viajante, citando algo que ele declarou.
- Sem clichê de folheto: nada de "terra encantada", "paraíso escondido", "joia rara".`

/** Bloco estável por destino — é o que o prompt caching reaproveita. */
export function blocoCatalogo(destino: string, candidatos: PoiPontuado[]): string {
  const linhas = candidatos.map(({ poi }) => {
    const partes = [
      `id=${poi.id}`,
      `tipo=${poi.tipo}`,
      `nome=${poi.nome}`,
      `categoria=${poi.categoria}`,
    ]
    if (poi.subcategorias.length) partes.push(`tags=${poi.subcategorias.join('|')}`)
    if (poi.duracaoRecomendadaMin) partes.push(`duracao_min=${poi.duracaoRecomendadaMin}`)
    if (poi.perfisIndicados.length) partes.push(`perfis=${poi.perfisIndicados.join('|')}`)
    if (poi.indoor) partes.push('coberto=sim')
    if (poi.requerReserva) partes.push('reserva=sim')
    if (!poi.adequadoCriancas) partes.push('criancas=nao')
    partes.push(`desc=${poi.descricao.replace(/\s+/g, ' ').slice(0, 180)}`)
    return partes.join(' · ')
  })

  return `CATÁLOGO DISPONÍVEL — ${destino}
Estes são os ÚNICOS lugares que você pode usar. Referencie pelo id exato.
Repare que não há preço nem horário aqui: é proposital, o sistema preenche depois.

${linhas.join('\n')}`
}

/** Bloco volátil — vai por último para não invalidar o cache. */
export function blocoViajante(v: PerfilViagem, desejosTexto: string): string {
  const companhia = v.criancas > 0 ? `${v.companhia} (com ${v.criancas} criança(s))` : v.companhia

  return `ESTE VIAJANTE
- Dias: ${v.dias}
- Companhia: ${companhia}
- Estilo: ${v.estilo}${v.orcamentoPessoa ? ` (orçamento aproximado: R$ ${v.orcamentoPessoa} por pessoa)` : ''}
- Perfil declarado: ${v.perfil.join(', ') || 'não informado'}
- Interesses: ${v.interesses.join(', ') || 'não informado'}
- Como vai se locomover: ${v.transportes.join(', ') || 'não informado'}
${desejosTexto ? `- Pediu explicitamente: "${desejosTexto}"` : ''}

Escreva citando o que ele declarou. "Você marcou que ama natureza, então..." vale mais que qualquer adjetivo.`
}

/** Agrupamento geográfico sugerido — a IA pode ajustar, mas não ignorar. */
export function blocoRegioes(grupos: PoiPontuado[][]): string {
  const descricao = grupos
    .map((grupo, i) => `Região ${i + 1}: ${grupo.map((p) => p.poi.id).join(', ')}`)
    .join('\n')

  return `AGRUPAMENTO GEOGRÁFICO
Os POIs foram agrupados por proximidade real. Concentre cada dia em uma região.

${descricao}`
}
