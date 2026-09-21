import type { PoiPontuado } from './tipos'

/**
 * Agrupamento geográfico por dia.
 *
 * Isto é o que evita o clássico "café no centro, praia no norte, almoço no
 * sul, museu no centro de novo". Rodar ANTES da IA é deliberado: distância é
 * geometria, não julgamento — e geometria a gente calcula, não pede ao modelo.
 */

const RAIO_TERRA_KM = 6371

export function distanciaKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * k-means simples sobre lat/lng, com sementes determinísticas (os k POIs mais
 * bem pontuados e distantes entre si). Determinismo importa: o mesmo
 * questionário precisa produzir a mesma base de roteiro.
 */
export function agruparPorRegiao(pois: PoiPontuado[], k: number): PoiPontuado[][] {
  const comCoordenada = pois.filter(
    (p) => p.poi.lat !== null && p.poi.lng !== null,
  ) as Array<PoiPontuado & { poi: { lat: number; lng: number } }>

  const semCoordenada = pois.filter((p) => p.poi.lat === null || p.poi.lng === null)

  if (k <= 1 || comCoordenada.length <= k) {
    return [[...pois]]
  }

  // Sementes: o melhor pontuado, depois os mais distantes dos já escolhidos.
  const sementes: Array<{ lat: number; lng: number }> = [
    { lat: comCoordenada[0].poi.lat, lng: comCoordenada[0].poi.lng },
  ]
  while (sementes.length < k) {
    let melhor = comCoordenada[0]
    let maiorDistancia = -1
    for (const c of comCoordenada) {
      const ponto = { lat: c.poi.lat, lng: c.poi.lng }
      const maisProxima = Math.min(...sementes.map((s) => distanciaKm(ponto, s)))
      if (maisProxima > maiorDistancia) {
        maiorDistancia = maisProxima
        melhor = c
      }
    }
    sementes.push({ lat: melhor.poi.lat, lng: melhor.poi.lng })
  }

  let centros = sementes
  let grupos: typeof comCoordenada[] = []

  for (let iteracao = 0; iteracao < 20; iteracao++) {
    grupos = Array.from({ length: k }, () => [])
    for (const c of comCoordenada) {
      const ponto = { lat: c.poi.lat, lng: c.poi.lng }
      let indice = 0
      let menor = Number.POSITIVE_INFINITY
      centros.forEach((centro, i) => {
        const d = distanciaKm(ponto, centro)
        if (d < menor) {
          menor = d
          indice = i
        }
      })
      grupos[indice].push(c)
    }

    const novos = grupos.map((grupo, i) =>
      grupo.length === 0
        ? centros[i]
        : {
            lat: grupo.reduce((s, c) => s + c.poi.lat, 0) / grupo.length,
            lng: grupo.reduce((s, c) => s + c.poi.lng, 0) / grupo.length,
          },
    )

    const estavel = novos.every((n, i) => distanciaKm(n, centros[i]) < 0.05)
    centros = novos
    if (estavel) break
  }

  // POIs sem coordenada não podem ser agrupados: vão para o maior grupo,
  // onde a IA tem mais liberdade de encaixe.
  const resultado: PoiPontuado[][] = grupos.map((g) => [...g])
  if (semCoordenada.length > 0) {
    const maior = resultado.reduce(
      (melhorIndice, grupo, i, todos) =>
        grupo.length > todos[melhorIndice].length ? i : melhorIndice,
      0,
    )
    resultado[maior].push(...semCoordenada)
  }

  return resultado.filter((g) => g.length > 0)
}
