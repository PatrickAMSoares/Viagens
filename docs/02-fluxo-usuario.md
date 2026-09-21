# 02 — Fluxo do usuário

```
HOME → ESCOLHA DO DESTINO → QUESTIONÁRIO (7 etapas) → PROCESSAMENTO IA
   → PRÉVIA → PAGAMENTO → ROTEIRO COMPLETO → PDF + E-MAIL → ÁREA DO CLIENTE
```

Tempo alvo do início ao "roteiro pronto": **≤ 5 minutos**, sendo ≤ 3 min de questionário.

---

## 1. Home (`/`)

**Hero** (imagem grande, vídeo curto em loop opcional, gradiente discreto):
- Título: **"Sua viagem. Seu estilo. Seu roteiro."**
- Subtítulo: *"Conte como você gosta de viajar e deixe nossa IA montar um roteiro personalizado para você."*
- CTA primário: **✈️ Criar meu roteiro** → rola para a grade de destinos
- Prova social (quando houver): "X roteiros já criados"

**Escolha seu destino** — grade responsiva (1 col. mobile / 2 tablet / 4 desktop) com 8 cards:

```
┌────────────────────────┐
│   [foto 4:5]           │
│                        │
│ Florianópolis          │
│ Santa Catarina         │
│ "Praia de manhã,       │
│  trilha à tarde..."    │
│ 🏖️ Praias  🌿 Natureza │
│ 🍴 Gastronomia 🌙 Noite│
│  [ Criar roteiro → ]   │
└────────────────────────┘
```

Abaixo: **Como funciona** (3 passos ilustrados) · **O que vem no seu roteiro** ·
**Planos e preços** · **FAQ** · Rodapé com Termos, Privacidade, Suporte.

**SEO:** cada destino tem também uma landing própria `/destinos/florianopolis`
(SSR, conteúdo do catálogo curado) — é o principal canal orgânico.

---

## 2. Questionário (`/roteiro/novo?destino=florianopolis`)

Uma pergunta por tela. Barra de progresso fixa no topo: **`Etapa 2 de 7`**.
Estado salvo em `localStorage` + rascunho em `viagens` (status `rascunho`) a cada etapa,
para retomar depois. Botão "voltar" sempre disponível. Sem scroll longo.

| Etapa | Pergunta | Tipo | Campo |
|---|---|---|---|
| 1 | **Qual combina mais com você?** | Múltipla escolha (chips) — 13 opções do briefing | `perfil[]` |
| 2 | **Com quem você vai viajar?** | Escolha única: Sozinho · Casal · Amigos · Família · Crianças · Grupo. Se **Família** ou **Crianças** → sub-pergunta: nº de adultos / nº de crianças (+ idades) | `companhia`, `adultos`, `criancas`, `idades_criancas[]` |
| 3 | **Quantos dias você terá?** | Botões 1–7 + "Mais de 7" → input numérico (máx. 14 no MVP) | `dias` |
| 4 | **Qual é o seu estilo de viagem?** | Cards: 💰 Econômico · ⚖️ Equilibrado · ✨ Confortável · 💎 Premium. Opcional: "Quanto pretende gastar por pessoa?" (slider + input R$) | `estilo`, `orcamento_pessoa` |
| 5 | **Como você vai se locomover?** | Múltipla: 🚶 A pé · 🚌 Público · 🚗 Carro próprio · 🚕 Apps · 🚐 Transfer · 🚗+🚌 · 🤷 Não sei | `transportes[]` |
| 6 | **O que você quer conhecer?** | Múltipla — 17 categorias do briefing, com ícones | `interesses[]` |
| 7 | **Tem algum lugar que você faz questão de conhecer?** | Texto livre (máx. 500 caracteres) com exemplo como placeholder. **Pode pular.** | `desejos_texto` |

**Regras de UX**
- Etapa 1 e 6 exigem ≥ 1 seleção; as demais têm default sensato.
- Se `transportes` inclui "Carro próprio" → o roteiro passa a considerar estacionamento e trânsito.
- Se `criancas > 0` → filtra POIs com `adequado_criancas = true` e reduz o ritmo (menos paradas/dia).
- Se `dias = 1` → roteiro focado em 1 região, sem deslocamentos longos.
- Ao final: pedir **e-mail** (obrigatório — é a chave do pedido e do magic link) e nome.

---

## 3. Processamento (`/gerando/[viagemId]`)

Animação em tela cheia (avião traçando rota / mapa se preenchendo), com mensagens
rotativas a cada ~3s:

1. "Analisando seu perfil..."
2. "Organizando os passeios..."
3. "Calculando os deslocamentos..."
4. "Encontrando experiências que combinam com você..."
5. "Quase pronto! ✈️"

Tecnicamente: o cliente faz *polling* (ou SSE) no status do job Inngest.
Duração real da prévia: 8–20s. Se passar de 45s → mensagem honesta
("está demorando mais que o normal, já te avisamos por e-mail").

---

## 4. Prévia gratuita (`/previa/[viagemId]`)

O usuário vê, de graça:

- **Seu perfil de viagem identificado** — ex.: *"Casal explorador, ritmo tranquilo,
  apaixonado por gastronomia e pôr do sol"*
- **Destino · nº de dias · estilo**
- **Principais experiências** — 4 a 6 destaques em cards (nome + 1 linha)
- **Dia 1 — Manhã, completo** (com horário, local, preço, tempo recomendado)
- A partir daí: conteúdo **desfocado com overlay**:

```
        🔓 Desbloqueie seu roteiro completo
   Seus 4 dias, hora a hora, com transporte,
   onde comer, quanto gastar e plano B.
              [ Ver planos → ]
```

---

## 5. Checkout (`/checkout/[pedidoId]`)

Três planos lado a lado (ver [06](06-estrategia-mvp.md) para preços):

| ROTEIRO ESSENCIAL | ROTEIRO COMPLETO ⭐ mais escolhido | ROTEIRO PREMIUM |
|---|---|---|
| Roteiro personalizado | Tudo do Essencial | Tudo do Completo |
| Organização por dia | + Transporte detalhado | + Personalização máxima |
| Principais atrações | + Alimentação | + Experiências diferenciadas |
| Dicas básicas | + Estimativa de gastos | + Alternativas adicionais |
| | + Segurança | + Gastronomia mais específica |
| | + Plano B | + Organização mais detalhada |

→ **Mercado Pago Checkout Pro**: PIX (QR + copia e cola) ou cartão.
Confirmação automática via webhook. PIX cai em segundos.

---

## 6. Pós-pagamento

```
webhook aprovado
   → registra pagamento (idempotente)
   → dispara job: gerar roteiro completo (2–4 min)
   → gera PDF → sobe no R2
   → envia e-mail "✈️ Seu roteiro para Gramado está pronto!"
   → libera na conta (magic link no mesmo e-mail)
```

Enquanto gera, a tela mostra **"Pagamento confirmado! Estamos finalizando seu
roteiro completo — você recebe por e-mail em até 5 minutos."**
(e o roteiro aparece sozinho na tela quando fica pronto).

---

## 7. Área do cliente (`/conta`)

Menu (bottom tabs no mobile):

| Item | Conteúdo |
|---|---|
| **Minha viagem** | Destino, datas, dias, companhia, estilo |
| **Meu roteiro** | Leitor mobile: navegação por dia, colapsar períodos, marcar como feito, abrir no Google Maps |
| **PDF** | Download (URL assinada) |
| **Dados da viagem** | Respostas do questionário (permite **1 regeração** por pedido se algo estiver errado) |
| **Editar perfil** | Nome, e-mail, preferências, excluir conta (LGPD) |
| **Suporte** | WhatsApp / e-mail + FAQ |

### Leitor do roteiro (a tela mais importante do produto)

```
┌─────────────────────────────────┐
│ Gramado · 4 dias        [PDF ⬇] │
│ ● Dia 1  ○ Dia 2  ○ Dia 3  ○ 4 │ ← tabs deslizantes
├─────────────────────────────────┤
│ 🌅 DIA 2 — Hoje é dia de        │
│    desacelerar                  │
│                                 │
│ 🚦 Antes de sair  ▾             │
│ ☀️ MANHÃ                        │
│  09:00 Café da manhã            │
│   📍 Rua X, 123   💰 R$ 25–40   │
│   ⏱️ 1h    [ Abrir no Maps ↗ ]  │
│  10:30 Passeio ⭐ Imperdível    │
│   ...                           │
│   🚗 12 min · 🚶 —  · 🚕 ~R$18  │
│ 🍴 ALMOÇO ▾                     │
│ 🌤️ TARDE ▾                      │
│ 🌅 FIM DE TARDE ▾               │
│ 🌙 NOITE ▾                      │
│ 💰 Estimativa do dia: R$ 310    │
│ 🌧️ Plano B ▾                    │
└─────────────────────────────────┘
```
