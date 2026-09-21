# 03 — Banco de dados

PostgreSQL 15+ (Supabase). ORM: Prisma. Schema executável em
[`prisma/schema.prisma`](../prisma/schema.prisma).

## Visão geral

```
                    ┌──────────────┐
                    │   destinos   │ 8 linhas no MVP
                    └──────┬───────┘
          ┌────────────────┼────────────────┬──────────────────┐
          ▼                ▼                ▼                  ▼
     ┌─────────┐    ┌─────────────┐   ┌────────────┐   ┌──────────────┐
     │ atracoes│    │restaurantes │   │transportes │   │ dicas_seguranca│
     └────┬────┘    └──────┬──────┘   └────────────┘   └──────────────┘
          └────────┬───────┘
                   ▼
           ┌───────────────┐
           │ poi_distancias│ matriz pré-computada (A→B, modal, min, km)
           └───────────────┘

  ┌──────────┐      ┌──────────┐      ┌───────────┐      ┌──────────┐
  │ usuarios │─────▶│ viagens  │─────▶│ roteiros  │      │ produtos │
  └──────────┘      └────┬─────┘      └───────────┘      └────┬─────┘
                         │                                    │
                         └──────────▶┌──────────┐◀────────────┘
                                     │ pedidos  │──▶ pagamentos
                                     └──────────┘
```

---

## Tabelas do núcleo

### `destinos`
Os 8 destinos do MVP. Adicionar cidade = inserir linha (sem deploy).

| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | |
| `slug` | text unique | `florianopolis` — usado na URL/SEO |
| `nome` | text | Florianópolis |
| `estado` | char(2) | SC |
| `pais` | char(2) | BR — já previsto para expansão internacional |
| `descricao_curta` | text | 1 linha para o card |
| `descricao_longa` | text | landing SEO |
| `categorias` | text[] | praias, natureza, gastronomia... (as "tags de experiência") |
| `imagens` | jsonb | `[{url, alt, credito, largura, altura}]` |
| `centro_lat/lng` | numeric | para ordenação geográfica |
| `fuso`, `moeda` | text | `America/Sao_Paulo`, `BRL` |
| `notas_transito` | text | insumo para a seção 🚦 Antes de sair |
| `ativo` | bool | permite despublicar |
| `melhor_epoca`, `clima_notas` | jsonb/text | usado quando relevante |

### `atracoes`
Coração do catálogo curado. ~40–80 por destino no MVP.

`id`, `destino_id`, `nome`, `slug`, `categoria` (enum), `subcategorias[]`,
`descricao`, `endereco`, `lat`, `lng`, `bairro`,
`horarios` (jsonb por dia da semana + exceções), `fechado_em` (feriados),
`preco_min`, `preco_max`, `preco_obs`, `gratuito` (bool),
`duracao_min`, `duracao_recomendada_min`,
`perfis_indicados` (text[] — casal, família, aventura...),
`adequado_criancas`, `acessivel_pcd`, `requer_reserva`, `indoor` (bool → plano B de chuva),
`melhor_horario` (manhã/tarde/pôr do sol/noite), `sazonalidade`,
`info_seguranca` (text), `dicas` (text),
`prioridade_base` (1–5 — o quanto é "imperdível" no destino),
`fonte_url`, `verificado_em`, `confianca` (alta|media|baixa),
`link_afiliado`, `parceiro_id` (⬅ preparado para monetização futura), `ativo`.

### `restaurantes`
`id`, `destino_id`, `nome`, `categoria` (cozinha), `tipo` (café/almoço/jantar/bar),
`faixa_preco` (1–4 `$`), `ticket_medio`, `bairro`, `endereco`, `lat`, `lng`,
`horarios`, `perfis_indicados[]`, `vegetariano`, `adequado_criancas`,
`requer_reserva`, `dicas`, `fonte_url`, `verificado_em`, `confianca`, `ativo`.

### `transportes`
`id`, `destino_id`, `modal` (onibus|metro|app|taxi|transfer|aluguel|barco|caminhada),
`regiao`, `nome_linha`, `descricao`, `custo_aprox`, `como_pagar`,
`horarios_operacao`, `observacoes`, `fonte_url`, `verificado_em`, `confianca`.

### `dicas_seguranca`
`id`, `destino_id`, `contexto` (geral|noite|praia|trilha|transporte|clima|golpes),
`regiao` (opcional), `texto`, `severidade` (info|atencao), `fonte_url`, `verificado_em`.

> Redação obrigatoriamente **objetiva e não alarmista**. Nunca classificar uma cidade
> inteira como perigosa. Regra aplicada na curadoria e reforçada no prompt.

### `poi_distancias`
Matriz pré-computada entre atrações/restaurantes do mesmo destino.
`origem_tipo`, `origem_id`, `destino_tipo`, `destino_id`, `modal`,
`minutos`, `km`, `custo_aprox`, `atualizado_em`.
Índice composto `(origem_id, destino_id, modal)`.
~3.500 pares por destino com 60 POIs → gerado uma vez pela Google Routes API e cacheado.

---

## Tabelas transacionais

### `usuarios`
`id`, `email` (unique), `nome`, `telefone?`, `role` (cliente|admin),
`preferencias` (jsonb — perfil consolidado entre viagens),
`aceite_termos_em`, `aceite_marketing`, `criado_em`, `excluido_em` (soft delete LGPD).

### `viagens`
Uma resposta completa do questionário.
`id`, `usuario_id?` (null enquanto anônimo), `destino_id`, `status`
(rascunho|previa_gerada|pago|roteiro_gerado|falhou),
`dias`, `data_inicio?`, `data_fim?`,
`companhia`, `adultos`, `criancas`, `idades_criancas[]`,
`estilo` (economico|equilibrado|confortavel|premium), `orcamento_pessoa?`,
`perfil[]`, `interesses[]`, `transportes[]`, `desejos_texto`,
`desejos_parseados` (jsonb — saída da etapa 1 do pipeline),
`respostas_raw` (jsonb — cópia íntegra, à prova de mudança de formulário),
`criado_em`.

### `roteiros`
`id`, `viagem_id`, `pedido_id?`, `tipo` (previa|completo),
`produto_id` (define quais seções existem),
`conteudo` (**jsonb** — o RoteiroJSON validado; ver [07](07-motor-de-ia.md)),
`modelo_ia`, `tokens_entrada`, `tokens_saida`, `custo_usd`, `duracao_ms`,
`versao` (int — permite regerar mantendo histórico), `pdf_url`, `pdf_gerado_em`, `criado_em`.

### `produtos`
Preços **configuráveis pelo administrador** (requisito do briefing).
`id`, `slug` (essencial|completo|premium), `nome`, `descricao`, `beneficios` (jsonb),
`preco_centavos`, `preco_riscado_centavos?`, `moeda`, `secoes_incluidas` (text[] —
`transporte`, `orcamento`, `seguranca`, `plano_b`, `gastronomia_detalhada`...),
`destaque` (bool), `ordem`, `ativo`.

### `pedidos`
`id`, `usuario_id`, `viagem_id`, `produto_id`,
`valor_centavos`, `cupom_id?`, `desconto_centavos`,
`status` (criado|aguardando_pagamento|pago|falhou|reembolsado|expirado),
`gateway` (mercadopago), `gateway_pedido_id`, `gateway_pagamento_id`,
`metodo` (pix|cartao), `pago_em`, `criado_em`, `expira_em`.

### `pagamentos` (log imutável de eventos do gateway)
`id`, `pedido_id`, `evento`, `status`, `valor_centavos`, `payload` (jsonb),
`assinatura_valida` (bool), `recebido_em`, `processado_em`.
Unique em `(gateway, evento_id)` → **idempotência de webhook**.

### Preparadas, não usadas no MVP
`cupons`, `pedido_itens`, `ofertas` (hotéis/ingressos/afiliados), `parceiros`, `avaliacoes`.

---

## Auditoria de conteúdo

### `fontes_verificacao`
Registra **quando e de onde** cada dado factual foi conferido.
`id`, `entidade` (atracao|restaurante|transporte|dica), `entidade_id`,
`campo`, `valor_anterior`, `valor_novo`, `fonte_url`, `verificado_por`, `verificado_em`.

Job semanal cria uma fila de revisão: tudo com `verificado_em` > 90 dias vira
tarefa no admin e passa a exibir o aviso de verificação no roteiro.

---

## Políticas e índices

- **RLS (Supabase):** `usuarios`, `viagens`, `roteiros`, `pedidos` → `auth.uid() = usuario_id`;
  catálogo é leitura pública apenas via server-side.
- **Índices:** `atracoes(destino_id, categoria, ativo)`,
  `atracoes USING GIN (perfis_indicados)`, `poi_distancias(origem_id, destino_id, modal)`,
  `pedidos(status, criado_em)`, `viagens(status, criado_em)`.
- **PostGIS:** opcional; com ≤ 100 POIs por cidade, `lat/lng` + matriz pré-computada bastam.
- **Backups:** PITR do Supabase (7 dias no plano Pro) + dump semanal do catálogo
  curado no R2 — o catálogo é o ativo mais valioso do negócio.
