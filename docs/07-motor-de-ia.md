# 07 — Motor de IA

## Princípio inegociável

> **A IA organiza. O banco informa.**

A IA recebe um conjunto fechado de POIs reais (com preço, horário, endereço e
coordenada verificados) e produz **sequência, ritmo, horários, justificativa
personalizada e voz**. Ela não pode citar nada fora desse conjunto.

---

## 1. Modelos e custo

| Etapa | Modelo | Por quê |
|---|---|---|
| Parse do texto livre (etapa 7) | `claude-haiku-4-5` | Tarefa simples de extração, alto volume |
| Prévia gratuita | `claude-haiku-4-5` | Roda para todo visitante — precisa ser barato |
| **Roteiro completo (o produto)** | **`claude-opus-5`** | É o que o cliente paga. Qualidade do texto longo e do encaixe logístico é o diferencial |
| Roteiro completo — modo econômico (teste A/B) | `claude-sonnet-5` | ~4× mais barato; avaliar se a queda de qualidade é perceptível |

Configuração das chamadas:
- **Structured outputs** (`output_config.format`) com o schema `RoteiroJSON` → resposta
  sempre válida, sem parsing frágil de Markdown.
- **Adaptive thinking** (`thinking: {type: "adaptive"}`) com `output_config.effort: "high"` —
  o encaixe logístico é exatamente o tipo de problema que melhora com raciocínio.
- **Streaming** obrigatório (`max_tokens` alto; saídas de 20–40k tokens estouram timeout HTTP).
- **Prompt caching** no bloco do catálogo do destino: 8 destinos × catálogo estável =
  altíssima taxa de acerto de cache. Ordem do prompt: `tools → system (estável) →
  catálogo do destino (cacheado) → perfil do usuário (volátil, por último)`.
- **Fallback de recusa** (`fallbacks: "default"`) ligado por padrão.

---

## 2. Pipeline detalhado

### Etapa 1 — Parse do desejo em texto livre
```
entrada: "Quero conhecer as Cataratas, jantar em algum restaurante bom
          e fazer um passeio de barco."
saída  : {
  "desejos": [
    {"texto": "Cataratas", "poi_id": "atr_foz_cataratas", "confianca": 0.97},
    {"texto": "jantar em restaurante bom", "tipo": "restaurante",
     "criterio": {"faixa_preco_min": 3}},
    {"texto": "passeio de barco", "categoria": "passeio_nautico"}
  ],
  "restricoes": [],
  "alertas": []
}
```
Casamento com o catálogo por busca textual (`pg_trgm`) + confirmação do modelo.
Desejo **não atendível** no destino → não é silenciado: vira aviso honesto no roteiro
("passeio de balão não existe em Bombinhas; sugerimos X").

### Etapa 2 — Seleção de candidatos (código puro, sem IA)

Determinística, testável e auditável:

```ts
score(poi, viagem) =
    3.0 * afinidadeInteresses(poi.categoria, viagem.interesses)
  + 2.0 * afinidadePerfil(poi.perfisIndicados, viagem.perfil)
  + 1.5 * poi.prioridadeBase / 5
  + 1.0 * compatibilidadeOrcamento(poi.preco, viagem.estilo)
  + 1.0 * (viagem.criancas > 0 ? (poi.adequadoCriancas ? 1 : -3) : 0)
  + 0.5 * proximidadeAoCluster(poi, clusterDoDia)
  - 2.0 * (poi.requerReserva && viagem.dias <= 2 ? 1 : 0)
  + FORCADO se estiver nos desejos explícitos do usuário
```

Saída: **~4× mais POIs do que cabem no roteiro** (dá liberdade de composição à IA),
já agrupados geograficamente (k-means simples sobre lat/lng → um cluster por dia),
com a submatriz de distâncias apenas desses POIs.

> Agrupar por região **antes** da IA é o que evita o clássico "café no centro,
> praia no norte, almoço no sul, museu no centro de novo".

### Etapa 3 — Prévia (gratuita, barata)
Gera: perfil identificado em 1 frase, 4–6 destaques, Dia 1 manhã completo.
~2k tokens de saída. Custo ≈ **R$ 0,05**.

### Etapa 4 — Roteiro completo
Após confirmação do pagamento. Um dia por chamada quando `dias > 4` (mantém
qualidade e permite streaming progressivo na tela), com resumo dos dias anteriores
no contexto para evitar repetição de restaurantes e atrações.

### Etapa 5 — Validação (nada vai ao cliente sem passar)

| Checagem | Ação se falhar |
|---|---|
| Schema Zod do `RoteiroJSON` | retry com o erro no prompt (máx. 1) |
| Todo `poi_id` citado existe no conjunto enviado | retry; se persistir → remove o item |
| Preço citado == preço do banco (tolerância 0) | sobrescreve com o valor do banco |
| Horário de funcionamento compatível com o horário sugerido | retry |
| Deslocamento entre POIs consecutivos existe na matriz | insere aviso ou reordena |
| Soma de (atividades + deslocamentos) ≤ 14h/dia | retry com instrução de aliviar |
| Todo dia tem plano B e estimativa de orçamento (se o produto inclui) | retry |
| 2 falhas seguidas | pedido marcado para revisão humana + e-mail ao cliente + reembolso automático oferecido |

---

## 3. Formato de saída (`RoteiroJSON`, resumido)

```jsonc
{
  "perfil_identificado": "Casal explorador, ritmo tranquilo, apaixonado por gastronomia",
  "resumo": "4 dias em Gramado e arredores, com foco em...",
  "destaques": ["...", "..."],
  "dias": [{
    "numero": 2,
    "titulo": "Hoje é dia de desacelerar",
    "abertura": "Depois de ontem, você provavelmente vai querer começar sem correria...",
    "antes_de_sair": {
      "transito": "Entre 8h e 9h a Borges de Medeiros costuma travar...",
      "estacionamento": "...",
      "recomendacao_modal": "app"
    },
    "blocos": [{
      "periodo": "manha",
      "hora": "09:00",
      "titulo": "Café da manhã",
      "poi_id": "res_gramado_cafe_colonial",
      "poi_tipo": "restaurante",
      "descricao": "...",
      "por_que_combina": "Você marcou 'apaixonado por comida' e...",
      "endereco": "...",            // ← preenchido pelo BANCO, não pelo modelo
      "preco": {"min": 60, "max": 90, "obs": "por pessoa"},
      "duracao_min": 90,
      "prioridade": "imperdivel",   // imperdivel | recomendado | se_der_tempo
      "verificar_antes": false,
      "deslocamento_ate_proximo": {
        "carro":    {"minutos": 12, "obs": "estacionamento pago na rua"},
        "publico":  {"minutos": 28, "linha": "Linha 4", "custo": 5.50},
        "app":      {"minutos": 10, "custo_aprox": 18.00},
        "caminhada":{"minutos": 35, "km": 2.6}
      }
    }],
    "orcamento": {
      "alimentacao": 180, "passeios": 90, "transporte": 40, "outros": 0,
      "total": 310, "observacao": "Valores estimados — podem variar."
    },
    "plano_b": {
      "chuva":    [{"poi_id": "...", "motivo": "coberto e a 5 min"}],
      "cansaco":  [{"...": "versão mais leve do dia"}],
      "transito": [{"...": "..."}],
      "lotado":   [{"...": "experiência equivalente"}]
    }
  }],
  "seguranca": [{"contexto": "noite", "texto": "..."}],
  "transporte_resumo": "...",
  "dicas_finais": ["..."],
  "avisos": ["Horários de alta temporada podem mudar — confirme no dia."]
}
```

Campos **factuais** (`endereco`, `preco`, `horarios`, `lat/lng`, `linha`, `minutos`)
são **sobrescritos pelo servidor** a partir do banco depois da geração.
O modelo só fornece `poi_id`, texto e organização. Isso torna a alucinação de fato
**estruturalmente impossível**, não apenas improvável.

---

## 4. System prompt (esqueleto)

```
Você é um planejador de viagens brasileiro que conhece profundamente {DESTINO}.
Você escreve como alguém que mora lá e está dando dica para um amigo.

REGRAS ABSOLUTAS
1. Use APENAS os POIs da lista fornecida. Referencie sempre por poi_id.
2. NUNCA invente preço, horário, endereço, linha de ônibus, evento ou regra local.
   Esses dados vêm do sistema — você só organiza.
3. Se algo for incerto, marque "verificar_antes": true.
4. Respeite os horários de funcionamento e os tempos de deslocamento fornecidos.
5. Segurança: objetiva e prática. Nunca alarmista. Nunca chame uma cidade
   inteira de perigosa. Contexto + recomendação.

RITMO
- Máximo 3 a 4 atividades principais por dia (2 a 3 com crianças ou perfil "relaxar").
- Inclua refeições, deslocamento e respiro. Um dia real, não uma maratona.
- Agrupe por região. Não faça o viajante cruzar a cidade duas vezes.
- Varie: não coloque duas trilhas seguidas, nem dois museus no mesmo período.

VOZ
- Conversacional, leve, divertida, brasileira, prática.
- O tom "hoje é dia de desacelerar" é TEMPERO, não a regra — use com moderação.
- Cada sugestão explica em 1 frase POR QUE combina com ESTE viajante.
- Sem clichê de folheto ("terra encantada", "paraíso escondido").

PERSONALIZAÇÃO (este viajante)
{PERFIL} {COMPANHIA} {ESTILO} {INTERESSES} {TRANSPORTE} {DESEJOS} {DIAS}
```

---

## 5. Qualidade: como medimos

Um **eval set de ~40 perfis sintéticos** (combinações de destino × dias × companhia ×
estilo), rodado a cada mudança de prompt ou modelo, com verificadores automáticos:

| Verificador | Critério |
|---|---|
| Referencial | 100% dos POIs existem no conjunto enviado |
| Logístico | 0 deslocamentos impossíveis; ≤ 14h/dia |
| Horários | 0 sugestões fora do horário de funcionamento |
| Personalização | ≥ 80% dos blocos citam o perfil no `por_que_combina` |
| Cobertura | 100% dos desejos explícitos atendidos ou justificados |
| Diversidade | nenhum restaurante repetido; ≤ 2 POIs da mesma categoria/dia |
| Voz (LLM-as-judge) | nota ≥ 4/5 em "parece escrito por quem conhece o lugar" |

Além disso: **revisão humana obrigatória dos 30 primeiros roteiros vendidos**,
antes do envio. É a forma mais barata de descobrir o que o eval não pega.

---

## 6. Atualização de dados (item 28 do briefing)

| Tipo de dado | Frequência | Como |
|---|---|---|
| Preço e horário de atração | Trimestral + alta temporada | Fila no admin; fonte oficial obrigatória |
| Restaurantes | Semestral | Idem |
| Transporte público | Semestral | Site da prefeitura/concessionária |
| Eventos e sazonalidade | Mensal | Calendário oficial do destino |
| Clima | Em tempo real | API de previsão no momento da geração (só quando `data_inicio` existe) |
| Segurança | Semestral | Fontes oficiais; linguagem revisada por humano |

Regra de exibição: `verificado_em` > 90 dias **ou** `confianca = baixa` →
o roteiro mostra automaticamente
> ⚠️ *Verifique esta informação antes de sair, pois pode sofrer alterações.*
