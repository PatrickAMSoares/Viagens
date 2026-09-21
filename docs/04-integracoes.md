# 04 — Integrações necessárias

| # | Serviço | Função | Plano inicial | Criticidade |
|---|---|---|---|---|
| 1 | **Mercado Pago** | PIX, cartão, checkout, webhook | Conta MEI/PJ | 🔴 Bloqueante |
| 2 | **Claude API (Anthropic)** | Geração dos roteiros | Pré-pago | 🔴 Bloqueante |
| 3 | **Supabase** | Postgres + Auth + Storage | Free → Pro ($25) | 🔴 Bloqueante |
| 4 | **Netlify / Vercel** | Hospedagem e CI | Free → Pro (~$20) | 🔴 Bloqueante |
| 5 | **Resend** | E-mail transacional | Free (3k/mês) | 🔴 Bloqueante |
| 6 | **Inngest** | Fila e workflows | Free (50k execs) | 🟠 Alta |
| 7 | **Cloudflare R2** | PDFs e imagens | Free (10 GB) | 🟠 Alta |
| 8 | **Google Routes API** | Matriz de distâncias | Crédito $200/mês | 🟠 Alta (uso pontual) |
| 9 | **Sentry** | Erros | Free | 🟡 Média |
| 10 | **PostHog** | Funil e produto | Free (1M eventos) | 🟡 Média |
| 11 | **Cloudflare Turnstile** | Anti-abuso na prévia | Free | 🟡 Média |
| 12 | **Upstash Redis** | Rate limit | Free | 🟡 Média |
| 13 | **OpenWeather / Open-Meteo** | Clima (quando há data) | Free | 🟢 Baixa |
| 14 | **Meta / Google Ads** | Aquisição | Variável | 🟡 Média |

---

## 1. Mercado Pago (pagamento)

**Produto:** Checkout Pro (hospedado) — menor esforço de PCI, melhor UX de PIX.

**Fluxo**
```
POST /api/checkout
  → cria `pedidos` (status: criado)
  → MP: cria preference { items, external_reference: pedido.id,
                          notification_url, back_urls, expires: 30min }
  → redireciona para init_point

POST /api/webhooks/mercadopago      (topic: payment)
  → valida assinatura HMAC (header x-signature) ⚠️ obrigatório
  → GET /v1/payments/{id} na API do MP  ⚠️ nunca confiar no corpo do webhook
  → grava em `pagamentos` (unique gateway+eventoId → idempotente)
  → se status = approved e valor confere:
        pedido.status = pago
        inngest.send("roteiro/gerar-completo", { pedidoId })
  → responde 200 rápido (< 5s), processamento é assíncrono
```

**Cuidados**
- Webhook duplicado é regra, não exceção → idempotência por `eventoId`.
- PIX expira: `expires_in = 30min`; job limpa pedidos `expirado`.
- Estorno via API + fluxo de reembolso descrito em [10](10-juridico-compliance.md).
- Taxas (referência, confirmar no contrato): PIX ~0,99%, cartão à vista ~4,98%,
  crédito parcelado maior. **Incentivar PIX com 5–10% de desconto** melhora margem
  e reduz chargeback.
- Sandbox do MP para todo o desenvolvimento; chaves de produção só em variável
  de ambiente do Netlify/Vercel.

> **Alternativas:** Stripe (ótima DX, PIX disponível para conta BR), Asaas, Pagar.me.
> A arquitetura isola o gateway atrás de `lib/payments/gateway.ts` — trocar é localizado.

---

## 2. Claude API

- SDK oficial `@anthropic-ai/sdk`. Chave **apenas server-side** (Inngest/Route Handler).
- Modelos: `claude-opus-5` (roteiro pago), `claude-haiku-4-5` (parse e prévia).
- Recursos usados: structured outputs, adaptive thinking + `effort: high`,
  streaming, prompt caching, `fallbacks: "default"`.
- Controles: timeout 10 min, 2 retries, `max_tokens` folgado, registro de
  `usage` em `roteiros` (tokens e custo por roteiro — essencial para unit economics).
- Alerta de gasto: limite mensal configurado no console + alarme no Sentry se
  o custo médio por roteiro ultrapassar o esperado.

## 3. Supabase
Postgres (+PITR), Auth (magic link) e Storage. RLS ativo em todas as tabelas de usuário.
`service_role key` só no servidor.

## 4. Resend + React Email
Domínio próprio com **SPF, DKIM e DMARC** configurados antes do lançamento
(sem isso, o e-mail com o produto vai para spam — falha crítica de negócio).

**Templates do MVP:** `roteiro-pronto` · `pagamento-confirmado` ·
`magic-link` · `pix-expirando` · `falha-na-geracao` · `recuperacao-carrinho` (D+1).

Assunto principal: **"✈️ Seu roteiro para Gramado está pronto!"**
Corpo: nome, destino, datas, nº de dias, botão **Abrir meu roteiro**, botão **Baixar PDF**
(URL assinada, 7 dias), link de suporte.

## 5. Inngest
Funções: `gerar-previa`, `gerar-roteiro-completo`, `gerar-pdf`, `enviar-email`,
`expirar-pedidos` (cron), `revisar-dados-vencidos` (cron semanal),
`recalcular-matriz-distancias` (manual).
Retry com backoff exponencial, `idempotencyKey = pedidoId`, concorrência limitada
para não estourar rate limit da Claude API.

## 6. Cloudflare R2
Buckets: `roteiros-pdf` (privado, URL assinada 7 dias) e `destinos-img` (público via CDN).
Imagens dos destinos: **licença obrigatória** — Unsplash/Pexels com crédito,
banco pago, ou fotos próprias. Nunca imagem de Google Images (ver [10](10-juridico-compliance.md)).

## 7. Google Routes API
Usada **offline**, não no caminho do usuário: um script gera a matriz de distâncias
entre os POIs de cada destino (carro, a pé, transporte público) e grava em
`poi_distancias`. Reexecutado quando o catálogo muda.
~3.500 pares/destino × 8 destinos ≈ 28 mil elementos → cabe no crédito mensal gratuito
de US$ 200. Custo recorrente ≈ **US$ 0**.

## 8. PDF (@react-pdf/renderer)
Gerado em job Node após o roteiro. Estrutura: Capa → Meu perfil de viagem →
Dia 1..N → 💰 Resumo financeiro → 🚦 Transporte → ⚠️ Segurança → 💡 Dicas finais.
Fontes embutidas, paleta da marca, marca d'água com o nome do viajante
(desincentiva revenda). Tamanho alvo < 5 MB.

---

## Variáveis de ambiente

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
RESEND_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
GOOGLE_MAPS_API_KEY=          # só para o script de matriz
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TURNSTILE_SECRET_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_APP_URL=
```
