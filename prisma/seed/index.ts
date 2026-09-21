import { PrismaClient } from '@prisma/client'
import { DESTINOS } from '../../lib/catalogo/destinos'
import { PRODUTOS } from './produtos'
import { ATRACOES_EXEMPLO } from './atracoes-exemplo'

const prisma = new PrismaClient()

/** Idempotente: pode rodar quantas vezes quiser sem duplicar nada. */
async function main() {
  console.log('🌎 Semeando destinos...')
  for (const d of DESTINOS) {
    const dados = {
      nome: d.nome,
      estado: d.uf,
      pais: d.pais,
      descricaoCurta: d.descricaoCurta,
      descricaoLonga: d.descricaoLonga,
      // Categorias guardam ícone + rótulo no mesmo campo: "🏖️ Praias".
      categorias: d.tags.map((t) => `${t.icone} ${t.rotulo}`),
      imagens: d.imagem ? [d.imagem] : [],
      centroLat: d.centro.lat,
      centroLng: d.centro.lng,
      notasTransito: d.notasTransito,
      climaNotas: d.climaNotas,
      melhorEpoca: d.melhorEpoca,
      ativo: d.ativo,
    }

    await prisma.destino.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...dados },
      update: dados,
    })
  }
  console.log(`   ${DESTINOS.length} destinos prontos.`)

  console.log('💳 Semeando produtos...')
  for (const p of PRODUTOS) {
    const dados = {
      nome: p.nome,
      descricao: p.descricao,
      beneficios: [...p.beneficios],
      precoCentavos: p.precoCentavos,
      precoRiscadoCentavos: 'precoRiscadoCentavos' in p ? p.precoRiscadoCentavos : null,
      secoesIncluidas: [...p.secoesIncluidas],
      destaque: p.destaque,
      ordem: p.ordem,
      ativo: true,
    }

    await prisma.produto.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...dados },
      update: dados,
    })
  }
  console.log(`   ${PRODUTOS.length} produtos prontos.`)

  console.log('📍 Semeando atrações de exemplo (não curadas)...')
  let total = 0
  for (const [slugDestino, atracoes] of Object.entries(ATRACOES_EXEMPLO)) {
    const destino = await prisma.destino.findUnique({ where: { slug: slugDestino } })
    if (!destino) continue

    for (const a of atracoes) {
      const dados = {
        nome: a.nome,
        categoria: a.categoria,
        subcategorias: a.subcategorias,
        descricao: a.descricao,
        perfisIndicados: a.perfisIndicados,
        melhorHorario: a.melhorHorario,
        adequadoCriancas: a.adequadoCriancas,
        indoor: a.indoor,
        prioridadeBase: a.prioridadeBase,
        // Tudo que é afirmação factual fica pendente de curadoria — de propósito.
        endereco: null,
        lat: null,
        lng: null,
        horarios: undefined,
        precoMin: null,
        precoMax: null,
        duracaoRecomendadaMin: null,
        fonteUrl: null,
        verificadoEm: null,
        confianca: 'baixa' as const,
        ativo: true,
      }

      await prisma.atracao.upsert({
        where: { destinoId_slug: { destinoId: destino.id, slug: a.slug } },
        create: { destinoId: destino.id, slug: a.slug, ...dados },
        update: dados,
      })
      total++
    }
  }
  console.log(`   ${total} atrações de exemplo — todas com confiança baixa e sem dado factual.`)

  const pendentes = await prisma.atracao.count({ where: { verificadoEm: null } })
  console.log(`\n⚠️  ${pendentes} atrações aguardando curadoria no /admin.`)
  console.log('   Preço, horário e endereço precisam de fonte e data antes de ir ao ar.\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
