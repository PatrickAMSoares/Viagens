# 01 — Arquitetura técnica

## 1. Resumo da stack

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend + Backend | **Next.js 15 (App Router) + TypeScript** | SSR para SEO das páginas de destino, Server Actions para o questionário, um só deploy |
| UI | **Tailwind CSS + shadcn/ui + Framer Motion** | Velocidade de construção, microanimações, mobile-first |
| Hospedagem | **Netlify** (ou Vercel) | Conta já conectada; runtime Next nativo, preview por PR, CDN global |
| Banco | **PostgreSQL gerenciado (Supabase)** | Relacional (o domínio é relacional), `jsonb` para o roteiro, PostGIS opcional para geo |
| ORM | **Prisma** | Migrations versionadas, tipos gerados, produtividade |
| Auth | **Supabase Auth — magic link (e-mail)** | "Login simples" do briefing; sem senha = menos atrito pós-compra |
| IA | **Claude API (`claude-opus-5`)** + `claude-haiku-4-5` para tarefas baratas | Qualidade do texto longo é o produto; structured outputs + prompt caching |
| Fila / jobs | **Inngest** | Geração leva 60–180s — acima do limite de função serverless. Retry, idempotência, observabilidade |
| Pagamento | **Mercado Pago (Checkout Pro)** | PIX + cartão + confirmação automática por webhook, padrão do mercado BR |
| E-mail | **Resend + React Email** | Templates em React, ótima entregabilidade, DX simples |
| PDF | **@react-pdf/renderer** (Node runtime) | Gera PDF bonito sem headless browser; roda em serverless |
| Storage | **Cloudflare R2** (ou Supabase Storage) | PDFs e fotos dos destinos; egress gratuito no R2 |
| Mapas/distâncias | **Google Routes API** (pré-computado e cacheado) | Tempos reais de deslocamento sem custo por requisição de usuário |
| Observabilidade | **Sentry** + **PostHog** | Erros + funil do questionário |
| Admin | Rotas `/admin` no mesmo app (RBAC) | MVP não justifica painel separado |

> **Alternativas consideradas:** Stripe (excelente, mas PIX no BR exige conta BR e a experiência
> de checkout PIX do Mercado Pago é superior para o público brasileiro); Vercel (equivalente —
> use se preferir); Trigger.dev (equivalente ao Inngest); Puppeteer para PDF (mais bonito,
> porém pesado e frágil em serverless — reavaliar na v2).

---

## 2. Diagrama de alto nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (mobile-first)                 │
│  Home · Destinos · Questionário (7 etapas) · Prévia · Checkout  │
│                  Área do cliente · Roteiro                      │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼─────────────────────────────────────────────────┐
│                   NEXT.JS (Netlify / Vercel)                    │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Páginas SSR  │  │ Server Actions│  │ Route Handlers (API) │  │
│  │ /destinos/*  │  │ questionário  │  │ /webhooks/mercadopago│  │
│  │ /roteiro/*   │  │ checkout      │  │ /webhooks/inngest    │  │
│  └──────────────┘  └───────┬───────┘  └──────────┬───────────┘  │
└──────────────────────────┬─┴─────────────────────┴──────────────┘
                           │
        ┌──────────────────┼────────────────────┬──────────────────┐
        ▼                  ▼                    ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL   │  │    INNGEST    │  │ Mercado Pago │  │   Resend     │
│  (Supabase)   │  │  (workflows)  │  │  (checkout)  │  │  (e-mail)    │
│               │  │               │  └──────────────┘  └──────────────┘
│ destinos      │  │ gerar-previa  │
│ atracoes      │  │ gerar-roteiro │         ┌──────────────────────┐
│ restaurantes  │  │ gerar-pdf     │────────▶│    CLAUDE API        │
│ transportes   │  │ enviar-email  │         │ claude-opus-5        │
│ usuarios      │  └───────────────┘         │ claude-haiku-4-5     │
│ viagens       │                            └──────────────────────┘
│ roteiros      │         ┌──────────────────────┐
│ pedidos       │         │  Cloudflare R2       │
│ poi_distancias│◀────────│  PDFs · imagens      │
└───────────────┘         └──────────────────────┘
        ▲
        │ (job semanal / manual)
┌───────┴──────────────────────────────────────┐
│  PIPELINE DE CURADORIA                       │
│  admin edita · fontes oficiais · verificação │
│  matriz de distâncias (Google Routes)        │
└──────────────────────────────────────────────┘
```

---

## 3. Decisão central: **catálogo curado + IA compositora**

Esta é a decisão mais importante da arquitetura e atende ao item 28 do briefing
("a IA nunca deverá inventar preços, horários, endereços...").

```
❌ Modelo ingênuo:  "IA, monte um roteiro de 3 dias em Gramado"
                    → alucina preços, horários e endereços. Inutilizável.

✅ Nosso modelo:    Banco curado de POIs (atrações, restaurantes, transporte)
                    ↓ seleção por afinidade com o perfil (código, não IA)
                    ↓ matriz de distâncias real (pré-computada)
                    ↓ IA recebe SÓ esses dados e COMPÕE a experiência
                    ↓ validação: todo POI citado precisa existir no banco
```

A IA é responsável por **sequência, ritmo, encaixe de horários, justificativa
personalizada e voz**. Ela **não** é responsável por fatos.

Todo dado factual (preço, horário, endereço, coordenada, linha de ônibus) tem no banco:
`fonte_url`, `verificado_em`, `confianca` (`alta|media|baixa`).
Dado com `confianca = baixa` ou `verificado_em` > 90 dias aparece no roteiro com o selo:

> ⚠️ *Verifique esta informação antes de sair, pois pode sofrer alterações.*

Detalhes completos em [07-motor-de-ia.md](07-motor-de-ia.md).

---

## 4. Pipeline de geração (Inngest)

```
[questionário concluído]
        │
        ▼
 ┌─────────────────────┐
 │ 1. PARSE            │  claude-haiku-4-5 + structured output
 │ texto livre etapa 7 │  → { desejos: [...], restricoes: [...], poi_ids_sugeridos: [...] }
 └──────────┬──────────┘
            ▼
 ┌─────────────────────┐
 │ 2. SELEÇÃO (código) │  score(POI, perfil) → top N por categoria
 │ sem IA, determinístico │  + POIs "faz questão" forçados
 └──────────┬──────────┘
            ▼
 ┌─────────────────────┐
 │ 3. PRÉVIA (grátis)  │  claude-haiku-4-5 → perfil identificado, destaques,
 │ ~2k tokens de saída │  Dia 1 manhã. Custo ≈ R$ 0,05
 └──────────┬──────────┘
            ▼
      [ PAGAMENTO ]  ◀── gate comercial. Nada caro roda antes daqui.
            │
            ▼
 ┌─────────────────────┐
 │ 4. ROTEIRO COMPLETO │  claude-opus-5, structured output (JSON validado por Zod),
 │ streaming, 1 dia por│  prompt caching do catálogo do destino
 │ chamada se > 4 dias │  → RoteiroJSON
 └──────────┬──────────┘
            ▼
 ┌─────────────────────┐
 │ 5. VALIDAÇÃO        │  Zod + checagem referencial (todo poi_id existe?)
 │                     │  + sanidade (deslocamentos possíveis? soma de horas < 16h?)
 │                     │  falhou → 1 retry com o erro no prompt → falhou → fallback humano
 └──────────┬──────────┘
            ▼
 ┌──────────┴──────────┬───────────────┬──────────────┐
 ▼                     ▼               ▼              ▼
 persistir roteiro   gerar PDF      enviar e-mail   liberar na conta
 (jsonb versionado)  (R2)           (Resend)        (RLS por user)
```

**Por que fila e não request/response:** um roteiro de 5–7 dias com todas as seções
(transporte, orçamento, plano B, segurança) gera 20–40k tokens de saída → 2 a 4 minutos.
Serverless tem limite de 10–60s. O Inngest também dá retry automático, idempotência por
`pedido_id` e dashboard de falhas.

---

## 5. Estrutura de pastas proposta

```
/
├── app/
│   ├── (marketing)/              # home, destinos, sobre, termos
│   │   ├── page.tsx              # hero + 8 cards
│   │   └── destinos/[slug]/      # landing SEO por destino
│   ├── (funnel)/
│   │   ├── roteiro/novo/         # questionário 7 etapas (state em URL + localStorage)
│   │   ├── gerando/[viagemId]/   # animação "Estamos montando sua viagem..."
│   │   ├── previa/[viagemId]/
│   │   └── checkout/[pedidoId]/
│   ├── (app)/conta/              # área do cliente (auth)
│   │   ├── minhas-viagens/
│   │   ├── roteiro/[id]/         # leitor mobile do roteiro
│   │   └── perfil/
│   ├── admin/                    # RBAC: role = admin
│   │   ├── page.tsx              # dashboard: vendas, receita, destinos
│   │   ├── destinos/             # CRUD destinos, atrações, restaurantes
│   │   ├── produtos/             # preços configuráveis
│   │   └── pedidos/
│   └── api/
│       ├── webhooks/mercadopago/route.ts
│       └── inngest/route.ts
├── lib/
│   ├── ai/                       # prompts, schemas Zod, cliente Anthropic
│   ├── scoring/                  # seleção de POIs por perfil (puro, testável)
│   ├── payments/                 # Mercado Pago
│   ├── pdf/                      # templates @react-pdf
│   ├── email/                    # React Email
│   └── db/                       # Prisma client, queries
├── inngest/functions/            # gerar-previa, gerar-roteiro, gerar-pdf, enviar-email
├── prisma/
│   ├── schema.prisma
│   └── seed/                     # os 8 destinos + POIs curados
└── docs/
```

---

## 6. Decisões arquiteturais (ADRs resumidos)

| # | Decisão | Alternativa rejeitada | Motivo |
|---|---|---|---|
| 1 | Catálogo curado, IA só compõe | IA gera tudo do zero | Alucinação de preço/horário/endereço mata o produto |
| 2 | Prévia com modelo barato, roteiro completo só após pagar | Gerar completo e esconder | Evita custo de IA em visitante que não compra |
| 3 | Roteiro salvo como `jsonb` versionado + renderizado no cliente | Salvar HTML/Markdown pronto | Permite reestilizar, reordenar, gerar PDF e futuros formatos sem regerar |
| 4 | Matriz de distâncias pré-computada | Chamar Google a cada geração | Custo ~zero, latência zero, funciona offline no prompt |
| 5 | Fila (Inngest) para geração | Server Action síncrona | Timeout de serverless; retry e idempotência de graça |
| 6 | Next.js monolito (front+back+admin) | Front separado + API dedicada | MVP de 1–2 devs; separar depois se necessário |
| 7 | Magic link | Senha | Compra é one-shot; senha é atrito e suporte |
| 8 | Preço em tabela `produtos` (admin edita) | Preço hardcoded / só no gateway | Requisito do briefing (item 21) e permite testes A/B de preço |
| 9 | Multi-tenant por `destino` desde o dia 1 | Hardcode dos 8 destinos | Adicionar cidade = inserir linhas, não fazer deploy |

---

## 7. Segurança e proteção do produto

| Risco | Mitigação |
|---|---|
| Abuso da prévia gratuita (custo de IA) | Rate limit por IP + e-mail (Upstash Redis); prévia usa modelo barato; captcha invisível (Turnstile) |
| Webhook de pagamento forjado | Validação de assinatura HMAC do Mercado Pago + reconsulta da ordem na API antes de liberar |
| Vazamento de roteiro pago | Row Level Security no Postgres; PDF em R2 com **URL assinada de 24h**, nunca público |
| Chave da Claude API no cliente | Toda chamada de IA é server-side (Inngest / Route Handler) |
| Scraping do catálogo curado | Catálogo nunca é exposto por API pública; só o roteiro final do usuário |
| Dados pessoais (LGPD) | Coleta mínima, consentimento explícito, exclusão via área do cliente — ver [10](10-juridico-compliance.md) |
| Chargeback / reembolso | Regra clara de 7 dias (CDC art. 49) antes do download — ver [10](10-juridico-compliance.md) |

---

## 8. Escalabilidade e evolução

A arquitetura já contempla, **sem refatoração do núcleo**:

- **Mais cidades/estados/países** → inserir em `destinos` + curar POIs. Zero código.
- **Hotéis / passagens / ingressos** → nova tabela `ofertas` + bloco opcional no roteiro;
  os campos `link_afiliado` e `parceiro_id` já estão previstos no schema.
- **Cupons e pacotes** → tabelas `cupons` e `pedido_itens` já desenhadas (não usadas no MVP).
- **Marketplace de experiências** → `ofertas` com `fornecedor_id` + split de pagamento.
- **App nativo** → o roteiro é JSON; o leitor pode ser reimplementado em React Native
  consumindo a mesma API.
- **Idiomas** → campos de texto do catálogo com sufixo de locale + parâmetro de idioma no prompt.
