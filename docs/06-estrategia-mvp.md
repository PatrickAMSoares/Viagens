# 06 — Estratégia de lançamento do MVP

## Princípio

> O MVP não é "o site com menos funcionalidades".
> É **o menor caminho até alguém pagar por um roteiro que realmente usou na viagem.**

Por isso a sequência abaixo começa por 1 destino, não por 8.

---

## 1. Escopo congelado do MVP

✅ **Entra:** 8 destinos · questionário de 7 etapas · IA · geração de roteiro ·
prévia gratuita · checkout · pagamento (PIX + cartão) · e-mail · PDF ·
área do cliente · banco de dados · painel administrativo.

❌ **Fica fora (v2+):** hotéis, passagens, reservas, cupons, pacotes, afiliados,
marketplace, app nativo, roteiro colaborativo, mapa interativo, multi-idioma,
compartilhamento social, programa de indicação.

A arquitetura já contempla todos os itens da lista de fora
(ver [01 §8](01-arquitetura-tecnica.md)) — eles são adição, não reescrita.

---

## 2. Roadmap em 6 sprints (~10 semanas, 1–2 devs)

| Sprint | Duração | Entrega | Critério de pronto |
|---|---|---|---|
| **0 — Fundação** | 1 sem | Repo, Next.js, Tailwind, Prisma, Supabase, CI, Sentry, design tokens | `main` faz deploy sozinho |
| **1 — Catálogo + Admin** | 2 sem | Schema completo, seed dos 8 destinos, CRUD admin de destinos/atrações/restaurantes/transporte/segurança, upload de imagem | Curador consegue cadastrar POI sem ajuda de dev |
| **2 — Funil** | 2 sem | Home, cards, landings de destino (SEO), questionário de 7 etapas, tela de processamento | Questionário completo em < 3 min no celular |
| **3 — Motor de IA** | 2 sem | Scoring, matriz de distâncias, prompts, structured output, validação, prévia + roteiro completo, leitor mobile | 40 perfis do eval passam nos verificadores |
| **4 — Comercial** | 2 sem | Produtos com preço editável, checkout Mercado Pago, webhook, PDF, e-mails, área do cliente | Compra real de ponta a ponta com PIX |
| **5 — Lançamento** | 1 sem | Dashboard admin, LGPD/termos, analytics, testes de carga, conteúdo de lançamento | Beta fechado rodando |

> **Curadoria de conteúdo roda em paralelo desde o Sprint 0.** É o caminho crítico
> do projeto — 480 POIs não se cadastram na última semana.

---

## 3. Estratégia de conteúdo (o verdadeiro caminho crítico)

Ordem de curadoria — **um destino totalmente pronto vale mais que oito pela metade**:

1. **Gramado** — maior volume de busca, ticket alto, viajante já decidido
2. **Florianópolis** — maior volume absoluto
3. **Foz do Iguaçu** — intenção altíssima, logística complexa (onde o produto mais brilha)
4. **Bento Gonçalves** — enoturismo, alto valor percebido
5. Canela · 6. Balneário Camboriú · 7. Bombinhas · 8. Curitiba

**Por destino (mínimo para vender):**
- 45–70 atrações · 25–35 restaurantes (todas as faixas de preço)
- 6–10 registros de transporte · 8–12 dicas de segurança contextuais
- Notas de trânsito e estacionamento por região
- Matriz de distâncias gerada
- **1 roteiro de 3 dias revisado manualmente ponta a ponta** ← portão de qualidade

**Fontes aceitas:** sites oficiais de atrações e prefeituras, secretarias de turismo,
concessionárias de transporte, redes sociais oficiais dos estabelecimentos.
**Toda linha tem `fonte_url` e `verificado_em`.** Sem exceção.

---

## 4. Lançamento em 4 ondas

### 🔒 Onda 1 — Beta fechado (semanas 11–12)
- **1 destino** (Gramado), 20–30 pessoas convidadas, **roteiro gratuito**
- Toda geração é revisada por humano antes de enviar
- Objetivo: descobrir onde a IA erra e onde o questionário confunde
- **Portão:** ≥ 8 de 10 avaliadores dizem "eu pagaria por isso"

### 💸 Onda 2 — Venda limitada (semanas 13–14)
- 3 destinos (Gramado, Floripa, Foz), preço de lançamento **−40%**
- Tráfego: Instagram orgânico + grupos de viagem + amigos
- **Portão:** 20 vendas reais e ≥ 5 pessoas confirmando que usaram na viagem

### 🚀 Onda 3 — Lançamento público (semanas 15–18)
- 8 destinos ativos, preço cheio
- Landings SEO publicadas, primeiros R$ 500–1.000 em Meta Ads para medir CAC real
- **Portão:** CAC < 50% do ticket médio

### 📈 Onda 4 — Escala (mês 5+)
- Escalar o que funcionou; abrir novos destinos (Serra Gaúcha, Litoral Norte SP, Rio)
- Só então avaliar: cupons, pacotes de múltiplos destinos, afiliados de hospedagem

---

## 5. Aquisição — ordem de prioridade

| Canal | CAC esperado | Esforço | Quando |
|---|---|---|---|
| **SEO por destino** ("o que fazer em Gramado em 3 dias") | Muito baixo | Alto, lento | Desde o dia 1 |
| **Instagram/TikTok orgânico** (roteiro real em vídeo curto) | Baixo | Alto, contínuo | Onda 2 |
| **Parcerias com pousadas e Airbnb hosts** (cupom para o hóspede) | Baixo | Médio | Onda 3 |
| **Grupos de viagem** (Facebook, WhatsApp, Reddit) | Zero | Baixo | Onda 2 |
| **Meta Ads** (retargeting de quem viu a prévia) | Médio | Baixo | Onda 3 |
| **Meta/Google Ads frio** | Alto | Baixo | Só com CAC provado |
| **Afiliados/influencers de viagem** | Médio | Médio | Onda 4 |

O ativo de longo prazo é **SEO + catálogo curado**. Ambos compostos, ambos difíceis
de copiar. Mídia paga é acelerador, não motor.

---

## 6. Precificação

| Plano | Preço | Lançamento (−40%) | Papel |
|---|---|---|---|
| Essencial | R$ 29 | R$ 19 | Âncora baixa / entrada |
| **Completo** ⭐ | **R$ 49** | **R$ 29** | **O que queremos vender** |
| Premium | R$ 89 | R$ 59 | Âncora alta, faz o Completo parecer barato |

Testes A/B previstos (preço é campo de banco, não código):
R$ 39/59/99 · desconto PIX de 10% · preço por dia de viagem (R$ 15/dia).

---

## 7. Métricas do painel administrativo

**Visão geral:** usuários · roteiros gerados · vendas · receita · destinos escolhidos ·
produtos vendidos · **custo de IA no mês** · **margem por roteiro**.

**Funil:** visitou → escolheu destino → iniciou questionário → concluiu →
viu prévia → abriu checkout → pagou.
Metas iniciais: conclusão do questionário > 60%; prévia → pago > 8%.

**Qualidade:** tempo médio de geração · taxa de falha/retry · roteiros regerados ·
pedidos de reembolso · NPS pós-viagem (e-mail em D+3 da volta).

---

## 8. Principais riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| CAC maior que o ticket | 🔴 Alta | Fatal | Começar por canais orgânicos; validar CAC antes de escalar |
| Curadoria atrasa tudo | 🔴 Alta | Alto | Lançar com 1 destino; contratar curador desde o Sprint 1 |
| Roteiro "genérico demais" | 🟠 Média | Alto | Eval set + revisão humana dos 30 primeiros + `por_que_combina` obrigatório |
| Dado desatualizado gera frustração | 🟠 Média | Médio | `verificado_em` + aviso automático + reembolso fácil |
| ChatGPT faz de graça | 🟠 Média | Alto | Diferencial = dado verificado, logística real, PDF pronto para usar na rua. Comunicar isso |
| Sazonalidade (baixa temporada) | 🟢 Baixa | Médio | Sul tem inverno (Gramado) e verão (praias) — carteira já equilibrada |
| Concentração em 1 gateway | 🟢 Baixa | Médio | Camada de abstração `lib/payments` |

---

## 9. Definição de sucesso do MVP (90 dias após a Onda 3)

- ✅ 150+ roteiros pagos
- ✅ CAC < 50% do ticket médio
- ✅ NPS ≥ 50
- ✅ ≥ 40% dos compradores abriram o roteiro **durante** a viagem
- ✅ < 5% de reembolso
- ✅ Custo de IA < 10% da receita

Batendo isso: abrir novos destinos e escalar mídia.
Não batendo: o problema é **produto ou canal** — e os números acima dizem qual.
