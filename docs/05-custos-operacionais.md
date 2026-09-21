# 05 — Estimativa de custos operacionais

> Câmbio de referência: **US$ 1 = R$ 5,40**. Preços de API conferidos em 2026-09.
> Tudo aqui é estimativa de planejamento — revisar com números reais após 30 dias.

---

## 1. Custo de IA por roteiro

Composição de uma geração de **roteiro completo de 4 dias** com `claude-opus-5`
(US$ 5,00 / milhão de tokens de entrada · US$ 25,00 / milhão de saída;
leitura de cache = 10% do preço de entrada):

| Componente | Tokens | Custo |
|---|---|---|
| Catálogo do destino + system (em **cache**) | ~12.000 | US$ 0,006 |
| Perfil do viajante + matriz de distâncias (entrada nova) | ~2.600 | US$ 0,013 |
| Saída: roteiro + raciocínio | ~24.000 | US$ 0,600 |
| **Total** | | **US$ 0,62 ≈ R$ 3,35** |

| Cenário | Modelo | Custo por roteiro |
|---|---|---|
| Prévia gratuita (todo visitante) | `claude-haiku-4-5` | US$ 0,015 ≈ **R$ 0,08** |
| Parse do texto livre | `claude-haiku-4-5` | ≈ **R$ 0,01** |
| Roteiro 3 dias | `claude-opus-5` | ≈ **R$ 2,70** |
| Roteiro 4 dias | `claude-opus-5` | ≈ **R$ 3,35** |
| Roteiro 7 dias | `claude-opus-5` | ≈ **R$ 5,55** |
| Roteiro 4 dias (modo econômico) | `claude-sonnet-5` | ≈ **R$ 1,35** |

**Média ponderada adotada no modelo: R$ 4,00 por roteiro pago.**

Três decisões que seguram esse custo:
1. **Prévia com modelo barato** — visitante que não compra custa R$ 0,08, não R$ 3,35.
2. **Prompt caching** do catálogo — reduz ~90% do custo de entrada.
3. **Rate limit + Turnstile** — impede que alguém gere 500 prévias de graça.

---

## 2. Custo fixo mensal de infraestrutura

| Serviço | Início (0–100 vendas/mês) | Escala (300–1.000/mês) |
|---|---|---|
| Netlify / Vercel | US$ 0 (Free) | US$ 19–20 |
| Supabase | US$ 0 (Free) | US$ 25 |
| Resend | US$ 0 (3k e-mails) | US$ 20 |
| Inngest | US$ 0 | US$ 0–20 |
| Cloudflare R2 | US$ 0 | US$ 1–3 |
| Google Routes API | US$ 0 (crédito de US$ 200) | US$ 0 |
| Sentry / PostHog / Upstash / Turnstile | US$ 0 | US$ 0–26 |
| Domínio (.com.br) | ~R$ 4/mês | ~R$ 4/mês |
| **Total** | **≈ R$ 5/mês** | **≈ US$ 65–115 → R$ 350–620/mês** |

> Dá para lançar o MVP com **custo fixo de infraestrutura praticamente zero**.
> O gasto relevante no início é **curadoria de conteúdo**, não servidor.

---

## 3. Custo de aquisição (o número que realmente decide o negócio)

| Item | Estimativa |
|---|---|
| Taxa do gateway — PIX | ~0,99% |
| Taxa do gateway — cartão à vista | ~4,98% |
| Mix esperado (60% PIX / 40% cartão) | **~2,6% do faturamento** |
| Tráfego pago (Meta) — CPC Brasil, nicho viagem | R$ 0,80 – R$ 2,00 |
| Conversão visitante → pagante (meta) | 2% – 4% |
| **CAC via tráfego pago resultante** | **R$ 25 – R$ 90** |

⚠️ **Este é o maior risco financeiro do produto.** Com ticket médio de R$ 52 e CAC
de R$ 70, o negócio não fecha. O plano precisa priorizar canais de CAC baixo:
SEO por destino, Instagram/TikTok orgânico, parcerias com pousadas e guias locais
(ver [06](06-estrategia-mvp.md)), e só depois escalar mídia paga com dados reais.

---

## 4. Investimento inicial (uma vez)

| Item | Estimativa | Observação |
|---|---|---|
| **Curadoria dos 8 destinos** (≈ 480 POIs + restaurantes + transporte + segurança) | 80–120 h | Terceirizado: R$ 8.000–15.000. Próprio: 3–4 semanas |
| Banco de imagens licenciadas | R$ 0 – 1.500 | Unsplash/Pexels com crédito, ou banco pago |
| Identidade visual (logo, paleta, tipografia) | R$ 0 – 3.000 | Pode ser feito com IA + ajuste |
| Abertura de MEI/PJ + contador (ano 1) | R$ 1.000 – 2.500 | Necessário para o gateway |
| Termos de uso e política de privacidade | R$ 0 – 1.500 | Modelo + revisão jurídica |
| Domínio + e-mail profissional | ~R$ 150 | |
| **Total** | **R$ 1.200 (enxuto) – R$ 23.000 (terceirizado)** | |

---

## 5. Unit economics

**Preços sugeridos:** Essencial **R$ 29** · Completo **R$ 49** · Premium **R$ 89**
Mix estimado 25% / 55% / 20% → **ticket médio R$ 52**.

### Por venda

| | R$ |
|---|---|
| Receita | 52,00 |
| (−) IA do roteiro | 4,00 |
| (−) IA de prévias (≈ 25 prévias por venda a R$ 0,08) | 2,00 |
| (−) Gateway (2,6%) | 1,35 |
| (−) E-mail, storage, PDF | 0,15 |
| **= Margem de contribuição** | **R$ 44,50 (86%)** |

### Cenários mensais

| | 50 vendas | 300 vendas | 1.000 vendas |
|---|---|---|---|
| Receita | R$ 2.600 | R$ 15.600 | R$ 52.000 |
| Custos variáveis | R$ 375 | R$ 2.250 | R$ 7.500 |
| Custo fixo de infra | R$ 50 | R$ 450 | R$ 700 |
| **Resultado antes de marketing/impostos** | **R$ 2.175** | **R$ 12.900** | **R$ 43.800** |
| Marketing a CAC R$ 25 | R$ 1.250 | R$ 7.500 | R$ 25.000 |
| Impostos (Simples ~6%) | R$ 156 | R$ 936 | R$ 3.120 |
| **Resultado líquido** | **R$ 769** | **R$ 4.464** | **R$ 15.680** |

**Ponto de equilíbrio (só infra, sem marketing pago): ~10 vendas/mês.**
**Com marketing pago a CAC R$ 25: ~18 vendas/mês.**

---

## 6. Alavancas de custo, se necessário

| Alavanca | Economia | Custo da decisão |
|---|---|---|
| `claude-sonnet-5` no plano Essencial | −60% do custo de IA | Texto um pouco menos rico — testar antes |
| `effort: medium` em roteiros de 1–2 dias | −20–30% | Baixo para roteiros simples |
| Cachear roteiros "genéricos" por destino+perfil+dias | até −40% | Reduz personalização — **não recomendado**, é o valor do produto |
| Batch API para regerações não urgentes | −50% | Só serve para trabalho assíncrono |
| Prévia 100% determinística (sem IA) | −R$ 2,00/venda | Prévia pior → menos conversão. Testar A/B |

A alavanca **errada** seria cortar qualidade do roteiro pago: ele custa R$ 4 e
sustenta um ticket de R$ 52. Cortar aí é economizar 8% para arriscar 100%.
